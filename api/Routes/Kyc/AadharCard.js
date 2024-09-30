const router = require('express').Router()
const multer = require('multer')
const Auth = require('../../Middleware/Auth')
const AadharCard = require('../../Model/Kyc/Aadharcard')
const path = require("path")
const User = require("../../Model/User")
const sharp = require("sharp")
const fs = require("fs")
const axios = require("axios").default;

const storage = multer.memoryStorage();
const upload = multer({ storage });



//use for otp aadhar verification service provider
router.post("/aadhar/aadharverification", Auth, async (req, res) => {
    
    let data = await AadharCard.findOne({ User: req.user.id })
        
        if (data && data.verified === "verified") {
            return res.status(400).send({ msg: false })
            //res.send({ msg: false })
        }
        
        
    const { aadharNumber } = req.body
        dataNew = new AadharCard({
            Number:maskNumber(aadharNumber),
            User: req.user.id
        })
    
        // const userNew = await User.findById(req.user.id);
        // userNew.verified = 'pending';
        // userNew.save();
        
    const toBase64 = obj => {
       // converts the obj to a string
       const str = JSON.stringify(obj);
       // returns string converted to base64
       return Buffer.from(str).toString('base64');
    };

    const replaceSpecialChars = b64string => {
    // create a regex to match any of the characters =,+ or / and replace them with their // substitutes
      return b64string.replace(/[=+/]/g, charToBeReplaced => {
        switch (charToBeReplaced) {
          case '=':
            return '';
          case '+':
            return '-';
          case '/':
            return '_';
        }
      });
    };

   
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };
    const b64Header = toBase64(header);
    const jwtB64Header = replaceSpecialChars(b64Header);
    // console.log ("the header is: ",jwtB64Header); 
    
    const timestamps = Date.now();
    const reqid = Math.floor(Math.random() * 1000000);
    const payload = { 
     "timestamp": timestamps, 
      "partnerId": "CORP00001110", 
      "reqid": reqid  
    };
    
    // console.log('payload', payload);
    // converts payload to base64
    const b64Payload = toBase64(payload);
    const jwtB64Payload = replaceSpecialChars(b64Payload);
    // console.log("the payload is: ",jwtB64Payload);
    

    const crypto = require('crypto');
    const createSignature =(jwtB64Header,jwtB64Payload,secret)=>{
    // create a HMAC(hash based message authentication code) using sha256 hashing alg
        let signature = crypto.createHmac('sha256',secret);
    
    // use the update method to hash a string formed from our jwtB64Header a period and 
    //jwtB64Payload 
        signature.update(jwtB64Header + '.' + jwtB64Payload);
    
    //signature needs to be converted to base64 to make it usable
        signature = signature.digest('base64');
    
    //of course we need to clean the base64 string of URL special characters
        signature = replaceSpecialChars(signature);
        return signature
    }
    // create your secret to sign the token
    //test UTA5U1VEQXdNREF4VFZSSmVrNUVWVEpPZWxVd1RuYzlQUT09
    const secret = 'UTA5U1VEQXdNREF4TVRFd1QwUnJNRTVxYXpKT2Vra3dUbEU5UFE9PQ==';
    const signature= createSignature(jwtB64Header,jwtB64Payload,secret);
    // console.log("the signature is: ",signature);
    
    const jsonWebToken = jwtB64Header + '.' + jwtB64Payload + '.' + signature;
    console.log ("the JWT is :",jsonWebToken);
    
    const aadharNum = aadharNumber;
    // const requstData2 = `{
    //     "id_number": ${aadharNum}
    // },{
    //     headers: {
    //         'Token': ${jsonWebToken},
    //         'Authorisedkey': 'TVRJek5EVTJOelUwTnpKRFQxSlFNREF3TURFPQ==',
    //         'Content-Type': "application/json"
    //     }
    // }`;
    //   console.log(requstData);
    await axios.post('https://api.verifya2z.com/api/v1/verification/aadhaar_sendotp',
    {
        "id_number": aadharNum
    },{
        headers: {
            'Token': jsonWebToken,
            // 'Authorisedkey': 'TVRJek5EVTJOelUwTnpKRFQxSlFNREF3TURFPQ==',
            'Content-Type': "application/json"
        }
    }
    ).then((result) => {
        
        // console.log('RequestData:',requstData2);
        // console.log('aadhardata',result.data)
        if(result.data.statuscode == 200){
            const successData = result.data.data;
            const client_id = successData.client_id;
            const otp_sent = successData.otp_sent;
            const valid_aadhaar = successData.valid_aadhaar;
            const ad_status = successData.status;
            if(ad_status == 'generate_otp_success'){
                dataNew.client_id=client_id
                dataNew.save();
                // console.log('dataNew',dataNew);
            }
        }

        return res.send(result.data)
        
        
    }).catch((e) => {
        console.log('errorrrrrrr', e)
                res.status(400).send(e)
    })
    
})

//use for otp aadhar service provider
router.post("/aadhar/otpverification", Auth, upload.none(), async (req, res) => {
    
    const { otpnumber, client_id } = req.body
    
    const getaadhardata = await AadharCard.findOne({ client_id: client_id });
    const userNew = await User.findById(req.user.id);
    console.log('getaadhardata1',getaadhardata)
    
    const toBase64 = obj => {
       // converts the obj to a string
       const str = JSON.stringify(obj);
       // returns string converted to base64
       return Buffer.from(str).toString('base64');
    };

    const replaceSpecialChars = b64string => {
    // create a regex to match any of the characters =,+ or / and replace them with their // substitutes
      return b64string.replace(/[=+/]/g, charToBeReplaced => {
        switch (charToBeReplaced) {
          case '=':
            return '';
          case '+':
            return '-';
          case '/':
            return '_';
        }
      });
    };

   
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };
    const b64Header = toBase64(header);
    const jwtB64Header = replaceSpecialChars(b64Header);
    // console.log ("the header is: ",jwtB64Header); 
    
    const timestamps = Date.now();
    const reqid = Math.floor(Math.random() * 1000000);
    
    const payload = { 
     "timestamp": timestamps, 
      "partnerId": "CORP00001110", 
      "reqid": reqid  
    };
    
    // console.log('payload', payload);
    // converts payload to base64
    const b64Payload = toBase64(payload);
    const jwtB64Payload = replaceSpecialChars(b64Payload);
    // console.log("the payload is: ",jwtB64Payload);
    

    const crypto = require('crypto');
    const createSignature =(jwtB64Header,jwtB64Payload,secret)=>{
    // create a HMAC(hash based message authentication code) using sha256 hashing alg
        let signature = crypto.createHmac('sha256',secret);
    
    // use the update method to hash a string formed from our jwtB64Header a period and 
    //jwtB64Payload 
        signature.update(jwtB64Header + '.' + jwtB64Payload);
    
    //signature needs to be converted to base64 to make it usable
        signature = signature.digest('base64');
    
    //of course we need to clean the base64 string of URL special characters
        signature = replaceSpecialChars(signature);
        return signature
    }
    // create your secret to sign the token
    const secret = 'UTA5U1VEQXdNREF4TVRFd1QwUnJNRTVxYXpKT2Vra3dUbEU5UFE9PQ==';
    const signature= createSignature(jwtB64Header,jwtB64Payload,secret);
    // console.log("the signature is: ",signature);
    
    const jsonWebToken = jwtB64Header + '.' + jwtB64Payload + '.' + signature;
    console.log ("the JWT is :",jsonWebToken);
    
    // const requstData = `{
    //     "otp": ${otpnumber},
    //     "client_id": ${client_id}
    // },{
    //     headers: {
    //         'Token': ${jsonWebToken},
    //         'Authorisedkey': 'TVRJek5EVTJOelUwTnpKRFQxSlFNREF3TURFPQ==',
    //         'Content-Type': "application/json"
    //     }
    // }`;
    await axios.post('https://api.verifya2z.com/api/v1/verification/aadhaar_verifyotp',
    {
        "otp": otpnumber,
        "client_id": client_id
    },{
        headers: {
            'Token': jsonWebToken,
            // 'Authorisedkey': 'TVRJek5EVTJOelUwTnpKRFQxSlFNREF3TURFPQ==',
            'Content-Type': "application/json"
        }
    }
    ).then((result) => {
        // console.log('aadharOTPrequstData',requstData)
        // console.log('aadharOTPData',result.data)
        if(result.data.statuscode == 200){
            const successData = result.data.data;
            const client_id = successData.client_id;
            const full_name = successData.full_name;
            const aadhaar_number = successData.aadhaar_number;
            const dob = successData.dob;
            const gender = successData.gender;
            const address = successData.address;
            const ad_status = successData.status;
            if(ad_status == 'success_aadhaar'){
                
                getaadhardata.Name = full_name;
                getaadhardata.Number = maskNumber(aadhaar_number);
                getaadhardata.Gender = gender;
                getaadhardata.DOB = dob;
                getaadhardata.Address = address;
                getaadhardata.verified= "verified";
                getaadhardata.alldata= successData;
                getaadhardata.save();
                
                userNew.holder_name = full_name;
                userNew.verified = 'verified';
                userNew.save();
                // console.log('getaadhardata', getaadhardata);
                // console.log('userNew', userNew);
            }
            
            return res.send(result.data)
        }
        
        return res.send(result.data)
        
        
    }).catch((e) => {
        console.log('errorrrrrrr', e)
                res.status(400).send(e)
    })
    
})

function maskNumber(number) {
  const masked = '*'.repeat(8) + number.toString().slice(-4);
  return masked;
}

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "public/kycdoc")
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     }
// })

// const fileFilter = (req, file, cd) => {
//     if (
//         (file.mimetype === "image/jpg",
//             file.mimetype === "image/jpeg",
//             file.mimetype === "image/png")
//     ) {
//         cd(null, true);
//     } else {
//         cd(null, false);
//     }
// };

// const upload = multer({
//     storage: storage,
//     limits: {
//         fieldSize: 100000000
//     }
// })

router.post("/aadharcard", Auth, upload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]), async (req, res) => {

    const { Name, Email, DOB, Gender, Number, Address, verified } = req.body
    var Adharfront;
    var Adharback;
    try {

        if(typeof req.files.front !== 'undefined'){

            fs.access("public/kycdoc", (error) => {
                if (error) {
                  fs.mkdirSync("public/kycdoc");
                }
              });
              const { buffer, originalname } = req.files.front[0];
               const uniqueSuffix = Date.now() + "-1-" + Math.round(Math.random() * 1e9);
                   
              const ref = `${uniqueSuffix}.webp`;
            //   console.log(buffer);
              await sharp(buffer)
                .webp({ quality: 20 })
                .toFile("public/kycdoc/" + ref);

             Adharfront= "public/kycdoc/" + ref 
            // data.front= req.files.front[0].path;
        }


        if(typeof req.files.back !== 'undefined'){

            fs.access("public/kycdoc", (error) => {
                if (error) {
                  fs.mkdirSync("public/kycdoc");
                }
              });
              const { buffer, originalname } = req.files.back[0];
               const uniqueSuffix1 = Date.now() + "-2-" + Math.round(Math.random() * 1e9);
                   
              const ref = `${uniqueSuffix1}.webp`;
            //   console.log(buffer);
              await sharp(buffer)
                .webp({ quality: 20 })
                .toFile("public/kycdoc/" + ref);
                 Adharback = "public/kycdoc/" + ref 
            // data.back= req.files.back[0].path;
        }

        let data = await AadharCard.findOne({ User: req.user.id })
        
        if (data && data.verified === "verified") {
            return res.send({ msg: false })
        }
        
        if (data && data.verified === "unverified") {
            
            data.Name = Name;
            data.Number = Number;
            data.DOB = DOB;
            data.verified= "pending";
            data.front=Adharfront;
            data.back=Adharback;
            
            data.save();

            const user = await User.findById(data.User);
            
            user.holder_name = Name;
            user.Email = Email;
            user.verified = 'pending';
            user.save();
            
            return res.send(data)
            
        }
        
        if (data && data.verified === "pending") {
            return res.send({ msg: false })
        }

        dataNew = new AadharCard({
            Name,
            verified: "pending",
            DOB,
            Gender,
            Number,
            Address,
            front:Adharfront,
            back: Adharback,
            User: req.user.id,
            
        })
        dataNew.save();
        
        const userNew = await User.findById(dataNew.User);

        userNew.holder_name = Name;
        userNew.Email = Email;
        userNew.verified = 'pending';
        userNew.save();
        
        return res.send(dataNew)
    }
    catch (e) {
        res.send(e)
        // console.log(e);
    }
})


router.get("/aadharcard/:id", Auth, async (req, res) => {
    await AadharCard.findById({ User: req.params.id }).then((ress) => {
        res.status(200).send(ress)
        // console.log(ress);
    }).catch((e) => {
        res.status(400).send(e)
    })
})


router.get("/aadharcard/all/all/all", Auth, async (req, res) => {
    const PAGE_SIZE = req.query._limit;
    let page =(req.query.page==0)? 0 : parseInt(req.query.page-1);
    try{
        const total = await AadharCard.countDocuments({ verified: "unverified", verified: "pending" });
        const admin = await AadharCard.find({ verified: "unverified", verified: "pending" }).populate("User").sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE * page);
        res.status(200).send({totalPages: Math.ceil(total / PAGE_SIZE), admin})
    }catch(e) {
        res.status(400).send(e)
    }
})

router.get("/admin/user/kyc/:id", Auth, async (req, res) => {
    await AadharCard.find({User:req.params.id}).populate("User").sort({ createdAt: -1 }).then((ress) => {
        res.status(200).send(ress)
    }).catch((e) => {
        res.status(400).send(e)
    })
})

router.get("/aadharcard/all/all/complete", Auth, async (req, res) => {
    const PAGE_SIZE = req.query._limit;
    let page =(req.query.page==0)? 0 : parseInt(req.query.page-1);
    try{
        const total = await AadharCard.countDocuments({ verified: "verified" });
        const admin = await AadharCard.find({ verified: "verified" }).populate("User").sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE * page);
        res.status(200).send({totalPages: Math.ceil(total / PAGE_SIZE), admin})
    }catch(e) {
        res.status(400).send(e)
    }

})

router.get("/aadharcard/all/all/reject", Auth, async (req, res) => {
    const PAGE_SIZE = req.query._limit;
    let page =(req.query.page==0)? 0 : parseInt(req.query.page-1);
    try{
        const total = await AadharCard.countDocuments({ verified: "reject" });
        const admin = await AadharCard.find({ verified: "reject" }).populate("User").sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE * page);
        res.status(200).send({totalPages: Math.ceil(total / PAGE_SIZE), admin})
    }catch(e) {
        res.status(400).send(e)
    }
})


router.patch("/aadharcard/:id", Auth, async (req, res) => {
    try {
        
        const data = await AadharCard.findByIdAndUpdate(req.params.id, req.body, { new: true })


        const user = await User.findById(data.User);

        user.verified = req.body.verified=="verified"?'verified':'unverified';
        user.save();
        res.send("ok")
    } catch (e) {
        res.status(400).send(e)
    }
})



// router.delete("/aadharcard/:id", Auth, async (req, res) => {
//     await AadharCard.findByIdAndDelete(req.params.id).then((ress) => {
//         res.status(200).send("ok")
//         // console.log(ress);
//     }).catch((e) => {
//         res.status(400).send(e)
//     })
// })

router.delete("/aadharcard/:id", Auth, async (req, res) => {
    let data = await AadharCard.findById(req.params.id)
    // await AadharCard.findByIdAndDelete(req.params.id)
    const dir = data.front;
    const dir1=data.back;

// delete directory recursively
try {
    if(dir && dir1==null||undefined){
        data.delete();
    }else{
        data.delete();
        fs.rmSync(dir, { recursive: true });
        fs.rmSync(dir1, { recursive: true });
    }
    console.log(`${dir,dir1} data is deleted!`);
} catch (err) {
    console.error(`Error while deleting ${dir, dir1}.`);
}

})


module.exports = router