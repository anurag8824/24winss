const router = require("express").Router()

const Auth = require("../Middleware/Auth")
const Transaction = require("../Model/transaction")
const User = require("../Model/User")
const Temp = require('../Model/temp/temp')
const Game = require("../Model/Games");
const multer = require('multer');
const sharp = require("sharp")
const fs = require("fs")
const upload = multer();
const axios = require("axios").default;
const Razorpay = require('razorpay');
const jsSHA = require('jssha');

const crypto = require("crypto");
const querystring = require('querystring');
//use for razorpay service provider
let InProcessSubmit = false;
let InProcessDipositCallback = false;
let InProcessDipositWebhook = false;


const razorpayKey = 'rzp_live_A345345';
const razorpaySecretKey = '345345';

const phonpeMID = 'MNHJH678';
const phonepeSignKey = '83178afa-d646-4c2f-9134-uujjj';

const algorithm = "aes-128-cbc";
var authKey = "MNBVGGHJJ";
var authIV = "iuhiuhiuiuhu";
const KvmPayToken = require("../utils/Auth");




//manual deposit...

router.post('/manual/deposit/txn', Auth, upload.single('Transaction_Screenshot'), async (req, res) => {

    const lasttrans = await Transaction.findOne({ 'User_id': req.user.id, Req_type: 'deposit' }).sort({ _id: -1 });
    if (lasttrans && lasttrans.status == 'Pending') {
        console.log('lasttranschecked');
        return res.send(lasttrans);
    }
    const txn = new Transaction({ amount: req.body.amount, referenceId: req.body.referenceId, User_id: req.user._id, Req_type: 'deposit' });
    const user = await User.findById(txn.User_id)


    try {
        var Screenshot;

        if (typeof req.file !== 'undefined') {

            fs.access("public/PaymentScreenshot", (error) => {
                if (error) {
                    fs.mkdirSync("public/PaymentScreenshot");
                }
            });
            const { buffer, originalname } = req.file;
            const uniqueSuffix = Date.now() + "-1-" + Math.round(Math.random() * 1e9);

            const ref = `${uniqueSuffix}.webp`;
            //   console.log(buffer);
            await sharp(buffer)
                .webp({ quality: 20 })
                .toFile("public/PaymentScreenshot/" + ref);

            Screenshot = "public/PaymentScreenshot/" + ref

        }
        txn.status = "Pending";
        txn.payment_gatway = "Manual",
            txn.Transaction_Screenshot = Screenshot

        txn.save();

        return res.send(txn);



    } catch (error) {
        console.log(error)
    }
})


router.get("/manual/depositstatus/:id", async (req, res) => {
    try {
        const txn1 = await Transaction.findById(req.params.id)
        //console.log(txn1);
        res.send(txn1);
    } catch (e) {
        res.status(400).send(e)
    }
})

//payoutstatus
router.get("/manual/payoutstatus/:id", async (req, res) => {
    try {
        const txn1 = await Transaction.findById(req.params.id)
        //console.log(txn1);
        res.send(txn1);
    } catch (e) {
        res.status(400).send(e)
    }
})

// KVM start payin

// TODO : KVM start
router.post('/user/depositeupiKVM', Auth, async (req, res) => {
    try {
        console.log('--body', req.body)
        console.log('--user', req.user)

        const txn = new Transaction({
            amount: req.body.amount,
            User_id: req.user._id,
            Req_type: 'deposit',
            payment_gatway: 'KVM'
        });

        const user = await User.findById(txn.User_id);
        console.log(req.body);

        // Retrieve the access token
        const accessToken = await KvmPayToken();
        console.log("-accessToken", accessToken)

        const customer_email = '24wins@gmail.com';
        const customer_mobile = user.Phone.toString();

        // Generate the UPI URL using the access token
        const upiURLResponse = await generateDynamicQrCode(customer_email, customer_mobile, txn.amount.toString(), txn._id, accessToken);
        console.log("-upiURL", upiURLResponse);

        if (upiURLResponse) {
            txn.status = 'Pending';
            txn.payment_gatway = 'KVM';
            txn.order_id = txn._id;
            txn.order_token = upiURLResponse.clientReferenceId; //paymentReferenceId
            txn.save();

            res.send({ status: true, data: upiURLResponse, txnID: txn._id });

        } else {
            res.send({ status: false, msg: 'QR code not generated' });
        }

    } catch (error) {
        console.log('Error occurred while generating QR codess:', error);
    }

});

router.post('/user/responseKVMDeposit', async (req, res) => {
    try {
        console.log("responseKVMDeposit", req.query);
        const { ClientReferenceId, PaymentReferenceId, BankUTRNO, Amount, Status, Message, CHMOD, TRANSACTIONTIME, Optional1, Optional2, Optional3, Optional4, UpdatedTime } = req.query;

        const txn = await Transaction.findOne({ _id: ClientReferenceId, status: 'Pending' });
        console.log("txn--", txn);

        if (!txn) {
            console.log("No pending transactions found");
            return res.status(404).send({ status: false, message: "No pending transactions found" });
        }

        const user = await User.findOne({ _id: txn.User_id });
        console.log("user-----", user);

        if (!user) {
            console.log("User not found for transaction", txn);
            return res.status(404).send({ status: false, message: "User not found for transaction" });
        }

        console.log("user", user);

        txn.status = Status;
        txn.txn_msg = Message;
        txn.PaymentReferenceId = PaymentReferenceId;
        txn.BankUTRNO = BankUTRNO;
        txn.CHMOD = CHMOD;
        txn.TRANSACTIONTIME = TRANSACTIONTIME;
        txn.Optional1 = Optional1;
        txn.Optional2 = Optional2;
        txn.Optional3 = Optional3;
        txn.Optional4 = Optional4;

        if (CHMOD == 'PAYOUT') {
            if (Status !== 'SUCCESS') {
                if (user.withdraw_holdbalance == txn.amount) {
                    user.Wallet_balance += txn.amount;
                    user.withdrawAmount += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }
            } else {
                if (user.withdraw_holdbalance == txn.amount) {
                    user.totalWithdrawl += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }
            }

            txn.UpdatedTime = (UpdatedTime != undefined) ? UpdatedTime : UpdatedTime;
        } else {
            if (Status === 'SUCCESS') {
                console.log("Transaction SUCCESS");

                user.Wallet_balance += txn.amount;
                user.totalDeposit += txn.amount;
                txn.closing_balance = user.Wallet_balance;
            }
        }

        await user.save();
        await txn.save();

        console.log("Transaction updated");
        return res.send({ status: true });

    } catch (error) {
        console.error("error callback >> responseKVMDeposit", error);
        return res.status(500).send({ status: false, message: "Internal server error" });
    }
});
// TODO : KVM end

// KVM end payin

// KVM Payout Start
// TODO : KVM

//kvm payout Auto bank
router.post("/withdraw/payoutKVM", Auth, async (req, res) => {

    const { amount, type, payment_gatway } = req.body
    const userID = req.user.id

    console.log("-/withdraw/payoutKVM")

    try {
        //userID != '6645e5107f1b5848e9baefaf' && 
        // if (userID != '662ce9c9a96fbbf5b7c14f62') {
        //   return res.status(200).send({ message: 'Withdrawal not allowed.', subCode: 999 });
        // }
        console.log("-payoutKVM")
        const user1 = await User.findById(userID);
        const lasttrans = await Transaction.findOne({ 'User_id': req.user.id }).sort({ _id: -1 });

        // console.log('userlasttxnstsauto',lasttrans.status);
        // console.log('userlasttxntime-auto',user1.lastWitdrawl);

        let currentTime = Date.now();
        let pendingGame = await Game.find(
            {
                $or: [
                    { $and: [{ Status: "new" }, { Created_by: userID }] },
                    { $and: [{ Status: "new" }, { Accepetd_By: userID }] },
                    { $and: [{ Status: "requested" }, { Created_by: userID }] },
                    { $and: [{ Status: "requested" }, { Accepetd_By: userID }] },
                ],

            }
        )
        let calculatedWallet = ((user1.wonAmount - user1.loseAmount) + user1.totalDeposit + user1.referral_earning + user1.hold_balance + user1.totalBonus) - (user1.totalWithdrawl + user1.referral_wallet + user1.totalPenalty);
        console.log("-calculatedWallet", calculatedWallet)
        console.log("-Wallet_balance", user1.Wallet_balance)

        if (user1.Wallet_balance == calculatedWallet) {

            if (pendingGame.length == 0) {
                if (((parseInt(user1.lastWitdrawl) + 10800000) < currentTime && lasttrans.status == 'SUCCESS') || (user1.lastWitdrawl == null) || (!lasttrans || lasttrans.status != 'SUCCESS')) {
                    if (amount >= 195 && amount <= 10000) {
                        if (user1.withdraw_holdbalance == 0) {

                            if (amount <= user1.Wallet_balance && amount <= user1.withdrawAmount) {
                                const txn1 = new Transaction();
                                txn1.amount = amount;
                                txn1.User_id = user1._id;
                                txn1.Req_type = 'withdraw';
                                txn1.Withdraw_type = type;
                                txn1.payment_gatway = payment_gatway;

                                user1.Wallet_balance -= amount;
                                user1.withdrawAmount -= amount;
                                user1.withdraw_holdbalance += amount;
                                user1.lastWitdrawl = Date.now();
                                txn1.closing_balance = user1.Wallet_balance;

                                await user1.save();
                                await txn1.save();

                                const user = await User.findById(userID);
                                const txn = await Transaction.findById(txn1._id);


                                try {

                                    const access_token = await KvmPayToken();
                                    console.log("-access_token", access_token)
                                    // console.log(access_token);
                                    if (access_token) {
                                        const apiresponse = await axios.post('https://api-live.kvmpay.com/payouts/v1/Payments/initiate-payments',
                                            {
                                                "accountNumber": `${user.account_number}`,
                                                "ifscCode": `${user.ifsc_code}`,
                                                "vpa": "",
                                                "payeeName": `${user.holder_name.trim()}`,
                                                "amount": `${txn.amount}`,
                                                "clientReferenceId": `${txn._id.toString()}`,
                                                "email": "rj52ludo@gmail.com",
                                                "mobileNo": `${user.Phone}`,
                                                "transfermode": "IMPS",
                                                "remarks": "Payout"
                                            }
                                            , {
                                                headers: {
                                                    'Authorization': `Bearer ${access_token}`
                                                }
                                            });

                                        console.log(apiresponse.data);

                                        if (apiresponse.data.status === 'SUCCESS') {
                                            txn.referenceId = apiresponse.data.paymentReferenceId;
                                            txn.status = 'SUCCESS';
                                            txn.action_by = req.user.id;
                                            txn.txn_msg = apiresponse.data.message;

                                            if (user.withdraw_holdbalance == txn.amount) {
                                                user.totalWithdrawl += txn.amount;
                                                user.withdraw_holdbalance -= txn.amount;
                                            }

                                            user.save();
                                            txn.save()

                                            res.status(200).send({ message: 'Your withdrawal request successfully completed', subCode: 200 });

                                        } else if (apiresponse.data.status === 'PENDING') {

                                            txn.referenceId = apiresponse.data.paymentReferenceId;
                                            txn.status = 'Pending';
                                            txn.action_by = req.user.id;
                                            txn.txn_msg = apiresponse.data.message;
                                            txn.save();
                                            user.save();

                                            res.status(200).send({ message: 'Your withdrawal request in proccessing', subCode: 200 });

                                        } else if (apiresponse.data.status === 'FAILED' || apiresponse.data.status === 'REVERSED') {
                                            txn.referenceId = apiresponse.data.paymentReferenceId;
                                            txn.status = 'FAILED';
                                            txn.action_by = req.user.id;
                                            txn.txn_msg = "issuer bank or payment service provider declined the transaction";

                                            if (user.withdraw_holdbalance == txn.amount) {
                                                user.Wallet_balance += txn.amount;
                                                user.withdrawAmount += txn.amount;
                                                user.withdraw_holdbalance -= txn.amount;
                                            }
                                            user.save();
                                            txn.save();

                                            res.status(200).send({ message: 'Your withdrawal request failed', subCode: 200 });
                                        }

                                    }

                                } catch (error) {
                                    console.error('Error in kvmpayout requests:', error);
                                    console.error('Error in kvmpayout userphone:', user.Phone);
                                    // console.error('Error in kvmpayout errordetails:', error.response.data.errordetails);
                                    if (error.response && error.response.data) {

                                        txn.status = 'FAILED';
                                        txn.action_by = req.user.id;
                                        txn.txn_msg = error.response.data.errordetails.toString();

                                        if (user.withdraw_holdbalance == txn.amount) {
                                            user.Wallet_balance += txn.amount;
                                            user.withdrawAmount += txn.amount;
                                            user.withdraw_holdbalance -= txn.amount;
                                        }
                                        txn.save();
                                        user.save();

                                        res.status(200).send({ message: error.response.data.errordetails, subCode: 200 });
                                    }
                                    // res.status(200).send({ message: error.response.data.errordetails, subCode: 200 });
                                }

                            }
                            else {
                                res.status(200).send({ message: 'Amount must be less than and equal to Wallet amount', subCode: 999 });
                            }
                        }
                        else {
                            res.status(200).send({ message: 'Your previous request already in process', subCode: 999 });
                        }
                    } else {
                        res.status(200).send({ message: 'UPI Withdrawal limit is 195 to Rs.10000, You can use withdraw through bank', subCode: 999 });
                    }
                }
                else {
                    res.status(200).send({ message: 'You can\'t Withdrawal for 3 hour since the last withdrawal.', subCode: 999 });
                }
            }
            else {
                res.status(200).send({ message: 'You are enrolled in game.', subCode: 999 });
            }
        }
        else {
            res.status(200).send({ message: 'Withdrawal is failed please contact to admin.', subCode: 999 });
        }
    }
    catch (e) {
        console.log(e);
        res.status(200).send({ message: 'Withdrawal is failed, Due to technical issue.', subCode: 999 });
    }
})


//   KVM Payout end



// //use for mypayapi service provider
router.post("/user/mypaydepositeapi", Auth, async (req, res) => {

    // if(req.user.Phone!='8441099365'){
    //     return res.send({ data: 'ok'}); 
    // }
    const txn = new Transaction({ amount: req.body.amount, User_id: req.user._id, Req_type: 'deposit' });

    const user = await User.findById(txn.User_id);
    // await txn.save();
    try {
        const createTokan = await axios.post('https://api-live.kvmpay.com/payouts/OAuth/get-token',
            {

            }, {
            headers: {
                "X-Api-Key": "b869dd48-e146-4c33-88c3-d4834a11fbba",
                "X-Secret-key": "Iu+WK0PdA/jWgjxs785FuRUDVyTyabPYeK1rgcN1MbY=",
                'Content-Type': "application/json"
            }
        });
        // console.log('token',createTokan.data);
        if (createTokan.data && createTokan.data.Access_token) {
            const access_token = createTokan.data.Access_token;
            const token_type = createTokan.data.Token_type;
            // console.log(access_token);
            const apiresponse = await axios.post('https://api-live.kvmpay.com/payouts/v1/Generate-QrCode',
                {
                    "amount": `${txn.amount}`,
                    "mobileNo": `${user.Phone.toString()}`,
                    // "email": `${user.Email.toString()}`,
                    "email": `krludo@gmail.com`,
                    "clientReferenceId": `${txn._id}`,
                }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            // console.log('response:',apiresponse.data);

            if (apiresponse.data.status == "SUCCESS") {
                txn.status = "Pending";
                txn.payment_gatway = "kvmpay";
                txn.order_id = txn._id;
                txn.order_token = apiresponse.data.paymentReferenceId;

                txn.save();
                // console.log(txn);
                return res.send({ data: apiresponse.data, mytoken: access_token });

            } else {
                return res.send({ data: apiresponse.data });
            }

        }

    } catch (error) {
        console.error('Error in myapi token API requests:', error);
    }


})

// use for mypay service provider response
// router.post('/mypaystatus/response', Auth, async (req, res) => {
// // router.get('/mypaystatus/response', async (req, res) => {

//     const mytoken = req.body.mytoken;
//     // console.log('mytoken',mytoken);
//     const orderID = req.body.order_id;
//     // const orderToken = req.body.order_token;
//     const txn = await Transaction.findById(orderID);
//     return res.send(txn);
// })

// //mypay callback /kvmpaydeposit/status
// router.post('/Addcase', async (req, res) => {
//     console.log('mypaydeposit notify',req.query);
//     const queryData = req.query;
//     const orderID = queryData.ClientReferenceId;
//     const txn = await Transaction.findById(orderID);

//     if (txn.status != "PAID" && txn.status != "FAILED" && txn.Req_type=="deposit") 
//     {
//             if (queryData.Status == "SUCCESS") 
//             {
//                 console.log("hello world")
//                 txn.status = 'PAID';
//                 const user = await User.findById(txn.User_id)
//                 user.Wallet_balance += parseFloat(queryData.Amount);
//                 console.log(user.Wallet_balance);
//                 user.totalDeposit+=parseFloat(queryData.Amount);
//                 await user.save();
//                 txn.closing_balance = user.Wallet_balance;
//                 txn.amount = parseFloat(queryData.Amount);
//                 txn.txn_msg = 'My UPI Transaction is Successful '+ queryData.TRANSACTIONTIME +'done';
//                 await txn.save();
//             }
//             else if (queryData.Status == "FAIL") 
//             {
//                 txn.status = 'FAILED';
//                 txn.txn_msg = req.body.remark;
//                 await txn.save();
//             }
//             else
//             {
//                 txn.status = 'FAILED';
//                 txn.txn_msg = "Transaction failed";
//                 await txn.save();
//             }

//     }else if(txn.status != "SUCCESS" && txn.status != "FAILED" && txn.Req_type=="withdraw"){

//             const withdraw = await Temp.findOne({txn_id:txn._id});
//             const user = await User.findById(txn.User_id);

//             console.log('payoutkvmqueryData',queryData);
//             if (queryData.Status == "SUCCESS") 
//             {
//                 txn.status = 'SUCCESS';
//                 txn.txn_msg = queryData.Message;

//                 if(user.withdraw_holdbalance == txn.amount){
//                     user.totalWithdrawl+=txn.amount;
//                     user.withdraw_holdbalance -= txn.amount;
//                 }

//                 user.save();
//                 txn.save()

//                 if(withdraw){
//                     withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
//                     withdraw.status = 'SUCCESS';
//                     withdraw.save();
//                 }
//             }else if(queryData.Status === 'FAILED' || queryData.Status === 'REVERSED'){

//                 txn.status = 'FAILED';
//                 txn.txn_msg = queryData.Message;

//                 if(user.withdraw_holdbalance == txn.amount){
//                     user.Wallet_balance += txn.amount;
//                     user.withdrawAmount += txn.amount;
//                     user.withdraw_holdbalance -= txn.amount;
//                 } 
//                 user.save();
//                 txn.save();

//                 if(withdraw){
//                     withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
//                     withdraw.status = 'FAILED';
//                     withdraw.save();
//                 }
//             }
//     }
//     res.status(200).json({status: "ok", message: "response", responsecode: "200"})
// })

const generateDynamicQrCode = async (email, mobile, amount, tid, accessToken) => {
    try {
        const postData = {
            email: email,
            mobileNo: mobile,
            clientReferenceId: tid,
            amount: amount
        };
        console.log("-postData====", postData)
        const response = await axios.post(
            'https://api-live.kvmpay.com/payouts/v1/Generate-QrCode',
            postData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        const data = response.data;
        console.log("data---generateDynamicQrCode>>", data.status);
        if (data.status === 'SUCCESS') {
            return data;
            // const upiURL = data.qrcodE_STRING;
            // return upiURL;
        } else {
            // Return error
            console.log("--generate qr- status not success")
            return false;
            //   throw new Error('Transaction Failed!');
        }
    } catch (error) {
        //JSON.stringify(error.data.errordetails)
        console.log('EEError occurred while generating QR code:',error);//, error.response.data
        // throw error;
        return false;
    }
};




// router.post('/user/mypaydepositeapi', Auth, async (req, res) => {

//   try {
//     console.log('--body', req.body)
//     console.log('--user', req.user)

//     const txn = new Transaction({
//       amount: req.body.amount,
//       User_id: req.user._id,
//       Req_type: 'deposit',
//       payment_gatway: 'KVM'
//     });

//     const user = await User.findById(txn.User_id);
//     console.log(req.body);

//     // Retrieve the access token
//     const accessToken = await KvmPayToken();
//     console.log("-accessToken", accessToken)

//     const customer_email = 'safariludo51@gmail.com';
//     const customer_mobile = user.Phone.toString();
//      try {
//     const response = await axios.post(
//       'https://api-live.kvmpay.com/payouts/OAuth/get-token',
//       null,
//       {
//         headers: {
//           'X-Api-Key': "b869dd48-e146-4c33-88c3-d4834a11fbba",//process.env.KvmpXApiKey,
//           'X-Secret-key': "Iu+WK0PdA/jWgjxs785FuRUDVyTyabPYeK1rgcN1MbY="//process.env.KvmpXApiKeySecret,
//         }
//       }
//     );
//     console.log("===response KvmPayToken>>", response.data);
//     if(response.data && response.data.Access_token){
//       return response.data.Access_token;
//     }else{
//       return "";
//     }
//   } catch (error) {
//     console.error('Error occurred while fetching access token:', error);
//     throw error;
//   }

//     // Generate the UPI URL using the access token
//     const upiURLResponse = await generateDynamicQrCode(customer_email, customer_mobile, txn.amount.toString(), txn._id, accessToken);
//     console.log("-upiURL", upiURLResponse);

//     if (upiURLResponse) {
//       txn.status = 'Pending';
//       txn.payment_gatway = 'KVM';
//       txn.order_id = txn._id;
//       txn.order_token = upiURLResponse.clientReferenceId; //paymentReferenceId
//       txn.save();

//       res.send({ status: true, data: upiURLResponse, txnID: txn._id });

//     } else {
//       res.send({ status: false, msg: 'QR code not generated' });
//     }

//   } catch (error) {
//     console.error('Error occurred while generating QR code:', error);
//   }

//   // await axios
//   //   .post(
//   //     'https://merchant.upigateway.com/api/create_order',
//   //     {
//   //       key: 'cac71b74-8115-49bf-ba3f-fa48b6f4f870',
//   //       client_txn_id: txn._id,
//   //       amount: txn.amount.toString(),
//   //       p_info: 'Add Wallet',
//   //       customer_name: 'Indra Raj Gurjar ', //req.body.account_name,
//   //       customer_email: 'safariludo51@gmail.com', //req.body.account_mail_id,
//   //       customer_mobile: user.Phone.toString(),
//   //       redirect_url: 'https://www.rj52ludo.com/return',
//   //       udf1: 'user desposit',
//   //     },
//   //     {
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //     }
//   //   )
//   //   .then((result) => {
//   //     //console.log(result)
//   //     if (result.data.status) {
//   //       txn.status = 'Pending';
//   //       txn.payment_gatway = req.body.payment_gatway;
//   //       txn.order_id = txn._id;
//   //       txn.order_token = result.data.data.order_id;
//   //       res.send({ data: result.data, txnID: txn._id });
//   //       txn.save();
//   //     } else {
//   //       res.send({ data: result.data });
//   //     }
//   //   })
//   //   .catch((e) => {
//   //     console.log(e);
//   //   });
// });

router.post('/24wins.in/Addcase', async (req, res) => {
    try {
        console.log("responseKVMDeposit", req.query);
        const { ClientReferenceId, PaymentReferenceId, BankUTRNO, Amount, Status, Message, CHMOD, TRANSACTIONTIME, Optional1, Optional2, Optional3, Optional4, UpdatedTime } = req.query;

        const txn = await Transaction.findOne({ _id: ClientReferenceId, status: 'Pending' });
        console.log("txn--", txn);

        if (!txn) {
            console.log("No pending transactions found");
            return res.status(404).send({ status: false, message: "No pending transactions found" });
        }

        const user = await User.findOne({ _id: txn.User_id });
        console.log("user-----", user);

        if (!user) {
            console.log("User not found for transaction", txn);
            return res.status(404).send({ status: false, message: "User not found for transaction" });
        }

        console.log("user", user);

        txn.status = Status;
        txn.txn_msg = Message;
        txn.PaymentReferenceId = PaymentReferenceId;
        txn.BankUTRNO = BankUTRNO;
        txn.CHMOD = CHMOD;
        txn.TRANSACTIONTIME = TRANSACTIONTIME;
        txn.Optional1 = Optional1;
        txn.Optional2 = Optional2;
        txn.Optional3 = Optional3;
        txn.Optional4 = Optional4;

        if (CHMOD == 'PAYOUT') {
            if (Status !== 'SUCCESS') {
                if (user.withdraw_holdbalance == txn.amount) {
                    user.Wallet_balance += txn.amount;
                    user.withdrawAmount += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }
            } else {
                if (user.withdraw_holdbalance == txn.amount) {
                    user.totalWithdrawl += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }
            }

            txn.UpdatedTime = (UpdatedTime != undefined) ? UpdatedTime : UpdatedTime;
        } else {
            if (Status === 'SUCCESS') {
                console.log("Transaction SUCCESS");

                user.Wallet_balance += txn.amount;
                user.totalDeposit += txn.amount;
                txn.closing_balance = user.Wallet_balance;
            }
        }

        await user.save();
        await txn.save();

        console.log("Transaction updated");
        return res.send({ status: true });

    } catch (error) {
        console.error("error callback >> responseKVMDeposit", error);
        return res.status(500).send({ status: false, message: "Internal server error" });
    }
});


//kvm payout Auto bank
router.post("/withdraw/mypaybankpayout/user", Auth, async (req, res) => {

    const { amount, type, payment_gatway } = req.body
    const userID = req.user.id

    var clientIp = req.headers['x-real-ip'];
    var clientForwardedIp = req.headers['x-forwarded-for'];
    var clientRemoteIp = req.headers['remote-host'];

    try {
        const user1 = await User.findById(userID);
        const lasttrans = await Transaction.findOne({ 'User_id': req.user.id }).sort({ _id: -1 });

        // console.log('userlasttxnstsauto',lasttrans.status);
        // console.log('userlasttxntime-auto',user1.lastWitdrawl);

        let currentTime = Date.now();
        let pendingGame = await Game.find(
            {
                $or: [
                    { $and: [{ Status: "new" }, { Created_by: userID }] },
                    { $and: [{ Status: "new" }, { Accepetd_By: userID }] },
                    { $and: [{ Status: "requested" }, { Created_by: userID }] },
                    { $and: [{ Status: "requested" }, { Accepetd_By: userID }] },
                ],

            }
        )
        let calculatedWallet = ((user1.wonAmount - user1.loseAmount) + user1.totalDeposit + user1.referral_earning + user1.hold_balance + user1.totalBonus) - (user1.totalWithdrawl + user1.referral_wallet + user1.totalPenalty);
        if (user1.Wallet_balance == calculatedWallet) {

            if (pendingGame.length == 0) {
                if (((parseInt(user1.lastWitdrawl) + 5400000) < currentTime && lasttrans.status == 'SUCCESS') || (user1.lastWitdrawl == null) || (!lasttrans || lasttrans.status != 'SUCCESS')) {
                    if (amount <= 10000) {
                        if (user1.withdraw_holdbalance == 0) {

                            if (amount <= user1.Wallet_balance && amount <= user1.withdrawAmount) {
                                const txn1 = new Transaction();
                                txn1.amount = amount;
                                txn1.User_id = user1._id;
                                txn1.Req_type = 'withdraw';
                                txn1.Withdraw_type = type;
                                txn1.payment_gatway = payment_gatway;

                                user1.Wallet_balance -= amount;
                                user1.withdrawAmount -= amount;
                                user1.withdraw_holdbalance += amount;
                                user1.lastWitdrawl = Date.now();
                                txn1.closing_balance = user1.Wallet_balance;

                                await user1.save();
                                await txn1.save();

                                const user = await User.findById(userID);
                                const txn = await Transaction.findById(txn1._id);


                                try {
                                    const createTokan = await axios.post('https://api-live.kvmpay.com/payouts/OAuth/get-token',
                                        {

                                        }, {
                                        headers: {
                                            "X-Api-Key": "b869dd48-e146-4c33-88c3-d4834a11fbba",
                                            "X-Secret-key": "Iu+WK0PdA/jWgjxs785FuRUDVyTyabPYeK1rgcN1MbY=",
                                            'Content-Type': "application/json"
                                        }
                                    });
                                    // console.log(createTokan);
                                    if (createTokan.data && createTokan.data.Access_token) {
                                        const access_token = createTokan.data.Access_token;
                                        const token_type = createTokan.data.Token_type;
                                        // console.log(access_token);
                                        const apiresponse = await axios.post('https://api-live.kvmpay.com/payouts/v1/Payments/initiate-payments',
                                            {
                                                "accountNumber": `${user.account_number}`,
                                                "ifscCode": `${user.ifsc_code}`,
                                                "vpa": "",
                                                "payeeName": `${user.holder_name.trim()}`,
                                                "amount": `${txn.amount}`,
                                                "clientReferenceId": `${txn._id.toString()}`,
                                                "email": "krludo@gmail.com",
                                                "mobileNo": `${user.Phone}`,
                                                "transfermode": "IMPS",
                                                "remarks": "Payout"
                                            }
                                            , {
                                                headers: {
                                                    'Authorization': `Bearer ${access_token}`
                                                }
                                            });

                                        // console.log(apiresponse.data);

                                        if (apiresponse.data.status === 'SUCCESS') {
                                            txn.referenceId = apiresponse.data.paymentReferenceId;
                                            txn.status = 'SUCCESS';
                                            txn.action_by = req.user.id;
                                            txn.txn_msg = apiresponse.data.message;

                                            if (user.withdraw_holdbalance == txn.amount) {
                                                user.totalWithdrawl += txn.amount;
                                                user.withdraw_holdbalance -= txn.amount;
                                            }

                                            user.save();
                                            txn.save()

                                            res.status(200).send({ message: 'Your withdrawal request successfully completed', subCode: 200 });

                                        } else if (apiresponse.data.status === 'PENDING') {

                                            txn.referenceId = apiresponse.data.paymentReferenceId;
                                            txn.status = 'pending';
                                            txn.action_by = req.user.id;
                                            txn.txn_msg = apiresponse.data.message;
                                            txn.save();
                                            user.save();

                                            res.status(200).send({ message: 'Your withdrawal request in proccessing', subCode: 200 });

                                        } else if (apiresponse.data.status === 'FAILED' || apiresponse.data.status === 'REVERSED') {
                                            txn.referenceId = apiresponse.data.paymentReferenceId;
                                            txn.status = 'FAILED';
                                            txn.action_by = req.user.id;
                                            txn.txn_msg = "issuer bank or payment service provider declined the transaction";

                                            if (user.withdraw_holdbalance == txn.amount) {
                                                user.Wallet_balance += txn.amount;
                                                user.withdrawAmount += txn.amount;
                                                user.withdraw_holdbalance -= txn.amount;
                                            }
                                            user.save();
                                            txn.save();

                                            res.status(200).send({ message: 'Your withdrawal request failed', subCode: 200 });
                                        }

                                    }

                                } catch (error) {
                                    console.error('Error in kvmpayout requests:', error);
                                    console.error('Error in kvmpayout userphone:', user.Phone);
                                    // console.error('Error in kvmpayout errordetails:', error.response.data.errordetails);
                                    if (error.response && error.response.data) {

                                        txn.status = 'FAILED';
                                        txn.action_by = req.user.id;
                                        txn.txn_msg = error.response.data.errordetails.toString();

                                        if (user.withdraw_holdbalance == txn.amount) {
                                            user.Wallet_balance += txn.amount;
                                            user.withdrawAmount += txn.amount;
                                            user.withdraw_holdbalance -= txn.amount;
                                        }
                                        txn.save();
                                        user.save();

                                        res.status(200).send({ message: error.response.data.errordetails, subCode: 200 });
                                    }
                                    // res.status(200).send({ message: error.response.data.errordetails, subCode: 200 });
                                }

                            }
                            else {
                                res.status(200).send({ message: 'Amount must be less than and equal to Wallet amount', subCode: 999 });
                            }
                        }
                        else {
                            res.status(200).send({ message: 'Your previous request already in process', subCode: 999 });
                        }
                    } else {
                        res.status(200).send({ message: 'UPI Withdrawal limit is Rs.10000, You can use withdraw through bank', subCode: 999 });
                    }
                }
                else {
                    res.status(200).send({ message: 'You can\'t Withdrawal for 1.5 hour since the last withdrawal.', subCode: 999 });
                }
            }
            else {
                res.status(200).send({ message: 'You are enrolled in game.', subCode: 999 });
            }
        }
        else {
            res.status(200).send({ message: 'Withdrawal is failed please contact to admin.', subCode: 999 });
        }
    }
    catch (e) {
        console.log(e);
        res.status(200).send({ message: 'Withdrawal is failed, Due to technical issue.', subCode: 999 });
    }
})

//kvm payout Auto bank end
//kvm payout manual


router.post("/withdraw/mypaybankpayout/adminmanual", Auth, async (req, res) => {

    const { amount, type, userID, txnID, reqID } = req.body

    const user = await User.findById(userID);
    const txn = await Transaction.findById(txnID);

    const withdraw = await Temp.findById(reqID);

    // if(user.Phone!='7014660763'){
    //     return res.send({ data: 'ok'}); 
    // }

    try {
        const createTokan = await axios.post('https://api-live.kvmpay.com/payouts/OAuth/get-token',
            {

            }, {
            headers: {
                "X-Api-Key": "b869dd48-e146-4c33-88c3-d4834a11fbba",
                "X-Secret-key": "Iu+WK0PdA/jWgjxs785FuRUDVyTyabPYeK1rgcN1MbY=",
                'Content-Type': "application/json"
            }
        });
        // console.log(createTokan);
        if (createTokan.data && createTokan.data.Access_token) {
            const access_token = createTokan.data.Access_token;
            const token_type = createTokan.data.Token_type;
            // console.log(access_token);
            const apiresponse = await axios.post('https://api-live.kvmpay.com/payouts/v1/Payments/initiate-payments',
                {
                    "accountNumber": `${user.account_number}`,
                    "ifscCode": `${user.ifsc_code}`,
                    "vpa": "",
                    "payeeName": `${user.holder_name.trim()}`,
                    "amount": `${txn.amount}`,
                    // "amount": 10,
                    "clientReferenceId": `${txn._id.toString()}`,
                    "email": "krludo@gmail.com",
                    "mobileNo": `${user.Phone}`,
                    "transfermode": "IMPS",
                    "remarks": "Payout"
                }
                , {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                });

            // console.log(apiresponse.data);

            if (apiresponse.data.status === 'SUCCESS') {
                txn.referenceId = apiresponse.data.paymentReferenceId;
                txn.status = 'SUCCESS';
                txn.action_by = req.user.id;
                txn.txn_msg = apiresponse.data.message;

                if (user.withdraw_holdbalance == txn.amount) {
                    user.totalWithdrawl += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }

                user.save();
                txn.save()

                withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                withdraw.status = 'SUCCESS';
                withdraw.save();

                res.status(200).send({ message: 'Your withdrawal request successfully completed', subCode: 200 });

            } else if (apiresponse.data.status === 'PENDING') {

                txn.referenceId = apiresponse.data.paymentReferenceId;
                txn.status = 'pending';
                txn.action_by = req.user.id;
                txn.txn_msg = apiresponse.data.message;
                txn.save();
                user.save();

                //withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                withdraw.status = 'Proccessing';
                withdraw.save();

                res.status(200).send({ message: 'Your withdrawal request in proccessing', subCode: 200 });

            } else if (apiresponse.data.status === 'FAILED' || apiresponse.data.status === 'REVERSED') {
                txn.referenceId = apiresponse.data.paymentReferenceId;
                txn.status = 'FAILED';
                txn.action_by = req.user.id;
                txn.txn_msg = "issuer bank or payment service provider declined the transaction";

                if (user.withdraw_holdbalance == txn.amount) {
                    user.Wallet_balance += txn.amount;
                    user.withdrawAmount += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }
                user.save();
                txn.save();

                withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                withdraw.status = 'FAILED';
                withdraw.save();

                res.status(200).send({ message: 'Your withdrawal request failed', subCode: 200 });
            }

        }

    } catch (error) {
        console.error('Error in kvmpayout requests:', error.response.data);
        console.error('Error in kvmpayout userphone:', user.Phone);
        // console.error('Error in kvmpayout errordetails:', error.response.data.errordetails);

        txn.status = 'FAILED';
        txn.action_by = req.user.id;
        txn.txn_msg = error.response.data.errordetails.toString();

        if (user.withdraw_holdbalance == txn.amount) {
            user.Wallet_balance += txn.amount;
            user.withdrawAmount += txn.amount;
            user.withdraw_holdbalance -= txn.amount;
        }
        txn.save();
        user.save();


        withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
        withdraw.status = 'FAILED';
        withdraw.save();

        res.status(200).send({ message: error.response.data.errordetails, subCode: 200 });

        // res.status(200).send({ message: error.response.data.errordetails, subCode: 200 });
    }


})

//payout through kvmupi
router.post("/withdraw/mypapayout/adminmanual", Auth, async (req, res) => {

    const { amount, type, userID, txnID, reqID } = req.body

    const user = await User.findById(userID);
    const txn = await Transaction.findById(txnID);

    const withdraw = await Temp.findById(reqID);

    // if(user.Phone!='7014660763'){
    //     return res.send({ data: 'ok'}); 
    // }

    try {
        const createTokan = await axios.post('https://api-live.kvmpay.com/payouts/OAuth/get-token',
            {

            }, {
            headers: {
                "X-Api-Key": "b869dd48-e146-4c33-88c3-d4834a11fbba",
                "X-Secret-key": "Iu+WK0PdA/jWgjxs785FuRUDVyTyabPYeK1rgcN1MbY=",
                'Content-Type': "application/json"
            }
        });
        // console.log(createTokan);
        if (createTokan.data && createTokan.data.Access_token) {
            const access_token = createTokan.data.Access_token;
            const token_type = createTokan.data.Token_type;
            // console.log(access_token);
            const apiresponse = await axios.post('https://apiv1.mypay.zone/api/v1/Payout/domestic-payments',
                {
                    "accountNumber": `${user.upi_id}`,
                    "ifscCode": `${user.ifsc_code}`,
                    "vpa": "",
                    "payeeName": `${user.holder_name}`,
                    "amount": `${txn.amount}`,
                    "clientReferenceId": `${txn._id.toString()}`,
                    "email": "krludo@gmail.com",
                    "mobileNo": `${user.Phone}`,
                    "transfermode": "IMPS",
                    "remarks": "Payout"
                }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            // console.log(apiresponse.data);

            if (apiresponse.data.statusCode == "TXN" && apiresponse.data.data.status === 'Success') {
                txn.referenceId = apiresponse.data.data.orderId;
                txn.status = 'SUCCESS';
                txn.action_by = req.user.id;

                if (user.withdraw_holdbalance == txn.amount) {
                    user.totalWithdrawl += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }

                user.save();
                txn.save()

                withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                withdraw.status = 'SUCCESS';
                withdraw.save();

                res.status(200).send({ message: 'Your withdrawal request successfully completed', subCode: 200 });

            } else if (apiresponse.data.statusCode == "TXN" && apiresponse.data.data.status === 'Pending') {

                txn.referenceId = apiresponse.data.id;
                txn.status = 'pending';
                txn.action_by = req.user.id;

                txn.save();
                user.save();

                //withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                withdraw.status = 'Proccessing';
                withdraw.save();

                res.status(200).send({ message: 'Your withdrawal request in proccessing', subCode: 200 });

            } else if (apiresponse.data.statusCode == "TXN" && apiresponse.data.data.status === 'Failed' || apiresponse.data.data.status === 'Refund') {
                txn.referenceId = apiresponse.data.id;
                txn.status = 'FAILED';
                txn.action_by = req.user.id;
                txn.txn_msg = "issuer bank or payment service provider declined the transaction";

                if (user.withdraw_holdbalance == txn.amount) {
                    user.Wallet_balance += txn.amount;
                    user.withdrawAmount += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }
                user.save();
                txn.save();

                withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                withdraw.status = 'FAILED';
                withdraw.save();

                res.status(200).send({ message: 'Your withdrawal request failed', subCode: 200 });
            }

            // if(apiresponse.data.statusCode == "TXN"){
            //     txn.status = "pending";
            //     txn.payment_gatway = req.body.payment_gatway;
            //     txn.order_id = txn._id;
            //     txn.order_token = apiresponse.data.data.clientrefid;

            //     txn.save();
            //     // console.log(txn);
            //     // return res.send({data: apiresponse.data, mytoken:access_token});  
            //     res.status(200).send({ message: 'Your withdrawal request in proccessing', subCode: 200 });

            // }else{
            //     return res.send({ data: apiresponse.data});        
            // }

        }

    } catch (error) {
        console.error('Error in myapi token API requests:', error.response.data);
    }


})



router.post("/mypapayout/response", Auth, async (req, res) => {

    const orderID = req.body.txn_id;
    const referenceId = req.body.referenceId;
    const txn = await Transaction.findById(orderID);
    const user = await User.findById(txn.User_id);


    const withdraw = await Temp.findOne({ txn_id: txn._id });


    try {
        const createTokan = await axios.post('https://apiv1.mypay.zone/api/Auth/access-token',
            {

            }, {
            headers: {
                "X-Api-Key": "b869dd48-e146-4c33-88c3-d4834a11fbba",
                "X-Secret-key": "Iu+WK0PdA/jWgjxs785FuRUDVyTyabPYeK1rgcN1MbY=",
                'Content-Type': "application/json"
            }
        });
        // console.log(createTokan);
        if (createTokan.data && createTokan.data.access_token) {
            const access_token = createTokan.data.access_token;
            const token_type = createTokan.data.token_type;

            const apiresponse = await axios.get(`https://apiv1.mypay.zone/api/v1/TransStatus/payment-details?ServiceType=Payments&ExternalId=${orderID}`,
                {

                }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

            // console.log(apiresponse.data);

            if (apiresponse.data.statusCode == "TXN" && apiresponse.data.data.status === 'Success') {
                txn.referenceId = apiresponse.data.data.orderId;
                txn.status = 'SUCCESS';
                txn.action_by = req.user.id;

                if (user.withdraw_holdbalance == txn.amount) {
                    user.totalWithdrawl += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }

                user.save();
                txn.save()

                withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                withdraw.status = 'SUCCESS';
                withdraw.save();

                res.status(200).send({ message: 'Your withdrawal request successfully completed', subCode: 200 });

            } else if (apiresponse.data.statusCode == "TXN" && apiresponse.data.data.status === 'Pending') {

                txn.referenceId = apiresponse.data.id;
                txn.status = 'pending';
                txn.action_by = req.user.id;

                txn.save();
                user.save();

                //withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                withdraw.status = 'Proccessing';
                withdraw.save();

                res.status(200).send({ message: 'Your withdrawal request in proccessing', subCode: 200 });

            } else if (apiresponse.data.statusCode == "TXN" && apiresponse.data.data.status === 'Failed' || apiresponse.data.data.status === 'Refund') {
                txn.referenceId = apiresponse.data.id;
                txn.status = 'FAILED';
                txn.action_by = req.user.id;
                txn.txn_msg = "issuer bank or payment service provider declined the transaction";

                if (user.withdraw_holdbalance == txn.amount) {
                    user.Wallet_balance += txn.amount;
                    user.withdrawAmount += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }
                user.save();
                txn.save();

                withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                withdraw.status = 'FAILED';
                withdraw.save();

                res.status(200).send({ message: 'Your withdrawal request failed', subCode: 200 });
            }

        }

    } catch (error) {
        console.error('Error in myapi token API requests222:', error.response);
    }


})



//kvm payout 



//use for phonedepositeapi service provider
router.post("/user/phonedepositeapi", Auth, async (req, res) => {

    const txn = new Transaction({ amount: req.body.amount, User_id: req.user._id, Req_type: 'deposit' });

    const user = await User.findById(txn.User_id);

    const requstData = `{
        "merchantId": "${phonpeMID}",
        "merchantTransactionId": "${txn._id.toString()}",
        "merchantUserId": "${req.user._id.toString()}",
        "amount": "${txn.amount * 100}",
        "redirectUrl": "https://24wins.in/Addcase",
        "callbackUrl": "https://24wins.in/kvmpaydeposit/status",
        "mobileNumber": "${user.Phone.toString()}",
        "paymentInstrument": {
          "type": "PAY_PAGE"
        }
      }`


    const base_encode_data = Buffer.from(requstData).toString('base64');
    //console.log(requstData);
    const shaObj = new jsSHA("SHA-256", "TEXT", { encoding: "UTF8" });
    /* .update() can be chained */
    //shaObj.update("This is").update(" a ");
    shaObj.update(base_encode_data + `/pg/v1/pay${phonepeSignKey}`);
    const hash = shaObj.getHash("HEX");
    //console.log(hash);
    await axios.post('https://api.phonepe.com/apis/hermes/pg/v1/pay',
        {
            "request": base_encode_data
        }, {
        headers: {
            'X-VERIFY': hash + '###1',
            'Content-Type': "application/json"
        }
    }
    ).then((result) => {
        console.log(result.data.data.instrumentResponse)
        if (result.data.success == true) {
            txn.status = "Pending";
            txn.payment_gatway = req.body.payment_gatway;
            txn.order_id = txn._id;
            txn.order_token = result.data.data.transactionId;

            txn.save();
            //console.log(txn);
            res.send({ data: result.data, txnID: txn._id });

        } else {
            res.send({ data: result.data });
        }

    }).catch((e) => {
        console.log('errorrrrrrr', e.response.data)
    })

})

//use for phonedepositeapi service provider response
router.post('/phonepestatus/response', Auth, async (req, res) => {

    const orderID = req.body.order_id;
    const orderToken = req.body.order_token;
    const txn = await Transaction.findById(orderID);
    const user = await User.findById(txn.User_id);

    const merchantId = `${phonpeMID}`;
    //console.log(orderToken);
    //console.log(txn);
    //&& txn.status != "FAILED"
    if (txn.order_id === orderID && txn.order_token === orderToken && txn.status != 'PAID') {

        const shaObj = new jsSHA("SHA-256", "TEXT", { encoding: "UTF8" });
        /* .update() can be chained */
        shaObj.update(`/pg/v1/status/${merchantId}/${orderID}${phonepeSignKey}`);
        const hash = shaObj.getHash("HEX");

        const axios = require('axios').default;
        const options = {
            method: 'GET',
            url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${orderID}`,
            headers: {
                'X-VERIFY': hash + '###1',
                'X-MERCHANT-ID': merchantId,
                'Content-Type': "application/json"
            }
        };

        axios.request(options).then(function (response) {
            console.log('phoneperesponse: ', response.data);

            if (response.data.success === true) {
                if (response.data.code == 'PAYMENT_SUCCESS' && response.data.data.state === 'COMPLETED') {

                    const PhonetxnCheck = Transaction.findOne({ order_token: orderToken });

                    if (PhonetxnCheck.status != 'PAID') {

                        txn.status = "PAID";
                        txn.txn_msg = "Deposit Transaction is Successful";
                        user.Wallet_balance += txn.amount;
                        user.totalDeposit += txn.amount;

                        txn.closing_balance = user.Wallet_balance;

                        user.save();
                        txn.save();
                        res.send(txn);

                    } else {
                        res.send(txn);
                    }

                }
                else if (response.data.code == 'BAD_REQUEST' || response.data.code == 'AUTHORIZATION_FAILED' || response.data.code == 'PAYMENT_ERROR') {
                    txn.status = "FAILED";
                    txn.txn_msg = "Transaction failed, incomplete payment!";

                    txn.save();
                    res.send(txn);
                }
                else if (response.data.code == 'INTERNAL_SERVER_ERROR') {
                    txn.status = "Pending";
                    txn.txn_msg = "Transaction pending due to INTERNAL SERVER ERROR !";

                    txn.save();
                    res.send(txn);
                }
                else if (response.data.code == 'PAYMENT_PENDING') {
                    txn.status = "Pending";
                    txn.txn_msg = "Transaction pending!";

                    txn.save();
                    res.send(txn);
                }
                else if (response.data.code == 'PAYMENT_DECLINED') {
                    txn.status = "FAILED";
                    txn.txn_msg = "Transaction Declined by User!";

                    txn.save();
                    res.send(txn);
                }
                else if (response.data.code == 'TIMED_OUT') {
                    txn.status = "FAILED";
                    txn.txn_msg = "Transaction failed due to timeout!";

                    txn.save();
                    res.send(txn);
                }
            } else {
                txn.status = "FAILED";
                txn.txn_msg = "Transaction failed!";

                txn.save();
                res.send(txn);
            }

        })
            .catch(function (error) {
                console.error('errorrrrr');

                txn.status = "FAILED";
                txn.txn_msg = "Transaction failed!";

                user.save();
                txn.save();
                res.send(txn);
            });

    } else {
        res.send(txn);
    }
})



router.post('/razorpaycheck/notify', async (req, res) => {
    //console.log('rezorpay webhook entity',req.body.payload.payment.entity);
    if (req.body.event) {

        const orderToken = req.body.payload.payment.entity.order_id;
        const orderStatus = req.body.payload.payment.entity.status;
        //console.log('orderToken',orderToken);
        //console.log('orderStatus',orderStatus);
        //console.log('req-body-event',req.body.event);

        const txn = await Transaction.findOne({ order_token: orderToken });
        const user = await User.findById(txn.User_id);
        //console.log('Razorpay txn',txn);
        if (req.body.event == 'payment.captured') {

            const txnCheck = await Transaction.findOne({ order_token: orderToken });

            if (txnCheck.status != 'PAID') {

                console.log('txn.status webhook11', txnCheck.status);

                txn.status = "PAID";
                txn.txn_msg = "Deposit Transaction is Successful";
                user.Wallet_balance += txn.amount;
                user.totalDeposit += txn.amount;

                txn.closing_balance = user.Wallet_balance;

                user.save();
                txn.save();
                //console.log('txnupdated2: Deposit Transaction is Successful');   
            } else {
                console.log('txn.status webhook21', txn.status);
            }

            res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
        }
        else if (req.body.event == 'payment.authorized') {
            const txnCheck2 = await Transaction.findOne({ order_token: orderToken });

            if (txnCheck2.status != 'PAID') {

                console.log('txn.status webhook12', txnCheck2.status);

                txn.status = "PAID";
                txn.txn_msg = "Deposit Transaction is Successful";
                user.Wallet_balance += txn.amount;
                user.totalDeposit += txn.amount;

                txn.closing_balance = user.Wallet_balance;

                user.save();
                txn.save();
                //console.log('txnupdated2: Deposit Transaction is Successful');   
            } else {
                console.log('txn.status webhook22', txn.status);
            }

            res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
        } else if (req.body.event == 'order.paid') {

            const txnCheck3 = await Transaction.findOne({ order_token: orderToken });

            if (txnCheck3.status != 'PAID') {

                console.log('txn.status webhook13', txnCheck2.status);

                txn.status = "PAID";
                txn.txn_msg = "Deposit Transaction is Successful";
                user.Wallet_balance += txn.amount;
                user.totalDeposit += txn.amount;

                txn.closing_balance = user.Wallet_balance;

                user.save();
                txn.save();
                //console.log('txnupdated2: Deposit Transaction is Successful');   
            } else {
                console.log('txn.status webhook23', txn.status);
            }

            res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
        }

        if (req.body.event == 'payment.failed') {

            if (txn.status != 'PAID') {
                txn.status = "FAILED";
                txn.txn_msg = "Transaction failed!";

                user.save();
                txn.save();
                //console.log('txnupdated2');
            }
            res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
        }

    } else {
        res.status(200).json({ status: "ok", message: "response fail", responsecode: "200", data: null })
    }
});

router.post('/razorpaycheck/response', Auth, async (req, res) => {


    const orderID = req.body.order_id;
    const orderToken = req.body.order_token;
    const orderStatus = req.body.order_status;
    const rpPaymentId = req.body.paymentId;
    const txn = await Transaction.findById(orderID);
    const user = await User.findById(txn.User_id)
    //console.log('orderID',orderID);
    //console.log('order_token',orderToken);

    //&& txn.status != "FAILED"
    if (txn.order_id === orderID && txn.order_token === orderToken && txn.status != 'PAID') {
        try {

            var instance = new Razorpay({ key_id: razorpayKey, key_secret: razorpaySecretKey })
            instance.orders.fetchPayments(orderToken, async function (err, order) {
                if (err) {
                    res.send({
                        status: 500,
                        message: "Something Went Wrong noti",
                    });
                }
                //captured
                console.log('paycap', order.items.length);
                if (order.items.length > 0) {
                    for (var i = 0; i < order.items.length; i++) {
                        console.log(order.items[i])
                        if (order.items[i].status == 'captured' && txn.status != 'PAID') {
                            txn.status = "PAID";
                            txn.txn_msg = "Deposit Transaction is Successfully Done";
                            user.Wallet_balance += txn.amount;
                            user.totalDeposit += txn.amount;

                            txn.closing_balance = user.Wallet_balance;
                            console.log('txnupdated: Deposit Transaction is Successfully Done');
                            user.save();
                            txn.save();
                        } else if (order.items[i].status == 'failed') {
                            txn.status = "FAILED";
                            txn.txn_msg = order.items[i].error_description;

                            user.save();
                            txn.save();
                        }

                    }
                    res.send(txn);
                } else {
                    txn.status = "FAILED";
                    txn.txn_msg = "Transaction failed!";

                    user.save();
                    txn.save();
                    res.send(txn);
                }
            });
        } catch (err) {
            //console.log('pay captur er',err);
            res.send(txn);
        }

    } else {
        res.send(txn);
    }
});


router.post('/razorpaydesposit/response', Auth, async (req, res) => {


    const orderID = req.body.order_id;
    const orderToken = req.body.order_token;
    const orderStatus = req.body.order_status;
    const rpPaymentId = req.body.paymentId;
    const txn = await Transaction.findById(orderID);
    const user = await User.findById(txn.User_id)
    //console.log(orderID);
    //&& txn.status != "FAILED"

    if (txn.order_id === orderID && txn.order_token === orderToken && txn.status != 'PAID') {
        try {
            const options = {
                method: 'POST',
                url: `https://${razorpayKey}:${razorpaySecretKey}@api.razorpay.com/v1/payments/${rpPaymentId}/capture`,
                form: {
                    amount: txn.amount * 100, // amount == Rs 10 // Same As Order amount
                    currency: "INR",
                }
            };
            axios.request(options).then(function (response) {
                console.log('payment capture', response);

            })
                .catch(function (error) {
                    console.error('pay captur error1');
                });
        } catch (err) {
            console.log('pay captur error2');
        }
        if (InProcessDipositCallback == false) {
            InProcessDipositCallback = true;
            if (orderStatus === 'SUCCESS' && txn.status != 'PAID') {
                console.log('InProcessDipositCallback2', txn.status)
                txn.status = "PAID";
                txn.txn_msg = "Deposit Transaction is Successfully Completed";
                user.Wallet_balance += txn.amount;
                user.totalDeposit += txn.amount;

                txn.closing_balance = user.Wallet_balance;

            } else {
                txn.status = "FAILED";
                txn.txn_msg = "Transaction failed!";
            }
            user.save();
            txn.save();
            InProcessDipositCallback = false;
            res.send(txn);
        } else {
            InProcessDipositCallback = false;
        }
    } else {
        res.send(txn);
    }
})

router.post("/user/razorpay_order", Auth, async (req, res) => {
    const txn = new Transaction({ amount: req.body.amount, User_id: req.user._id, Req_type: 'deposit' });

    const user = await User.findById(txn.User_id)
    var instance = new Razorpay({ key_id: razorpayKey, key_secret: razorpaySecretKey })

    var clientIp = req.headers['x-real-ip'];
    var clientForwardedIp = req.headers['x-forwarded-for'];
    var clientRemoteIp = req.headers['remote-host'];
    try {
        const options = {
            amount: txn.amount * 100, // amount == Rs 10
            currency: "INR",
            receipt: txn._id.toString(),
            payment_capture: 1,
        };
        instance.orders.create(options, async function (err, order) {
            if (err) {
                res.send({
                    status: 500,
                    message: "Something Went Wrong noti",
                });
            }
            txn.status = "Pending";
            txn.payment_gatway = req.body.payment_gatway;
            txn.order_id = txn._id;
            txn.order_token = order.id;

            txn.client_ip = clientIp;
            txn.client_forwarded_ip = clientForwardedIp;
            txn.client_remote_ip = clientRemoteIp;

            txn.save();
            res.send({ orderdata: order, txnID: txn._id });

        });
    } catch (err) {
        res.send({
            status: 500,
            message: "Something Went Wrong",
        });
    }

})




//use for upigatway service provider
router.post("/user/depositeupi", Auth, async (req, res) => {
    const txn = new Transaction({ amount: req.body.amount, User_id: req.user._id, Req_type: 'deposit' });
    const user = await User.findById(txn.User_id)
    await axios.post('https://merchant.upigateway.com/api/create_order',
        {
            "key": "************",
            "client_txn_id": txn._id,
            "amount": txn.amount.toString(),
            "p_info": "Add Wallet",
            "customer_name": "kr ludo", //req.body.account_name,
            "customer_email": "krludo@gmail.com", //req.body.account_mail_id,
            "customer_mobile": user.Phone.toString(),
            "redirect_url": "https://jaipurludo.com/return",
            "udf1": "user desposit"
        },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    ).then((result) => {
        //console.log(result)
        if (result.data.status) {

            txn.status = "Pending";
            txn.payment_gatway = req.body.payment_gatway;
            txn.order_id = txn._id;
            txn.order_token = result.data.data.order_id;
            res.send({ data: result.data, txnID: txn._id });
            txn.save();
        } else {
            res.send({ data: result.data });
        }
    }).catch((e) => {
        console.log(e)
    })

})

//use for upigatway service provider response
router.post('/depositupipay/response', Auth, async (req, res) => {
    //console.log(req.body);
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    //today = dd + '-' + mm + '-' + yyyy;
    if (req.body.pay_date) {
        today = req.body.pay_date;
    } else {
        today = dd + '-' + mm + '-' + yyyy;
    }
    //console.log(today)

    const orderID = req.body.order_id;
    const orderToken = req.body.order_token;
    const txn = await Transaction.findById(orderID);
    const user = await User.findById(txn.User_id)
    //&& txn.status != "FAILED"
    if (txn.order_id === orderID && txn.order_token === orderToken && txn.status != 'PAID') {
        await axios.post('https://merchant.upigateway.com/api/check_order_status',
            {
                "key": "**********",
                "client_txn_id": orderID,
                "txn_date": today
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ).then((response) => {
            //console.log(response)
            if (response.data.data.status === 'success') {
                txn.status = "PAID";
                txn.txn_msg = "Transaction is Successful";
                user.Wallet_balance += txn.amount;
                user.totalDeposit += txn.amount;

                txn.closing_balance = user.Wallet_balance;
            } else {
                txn.status = "FAILED";
                txn.txn_msg = response.data.data.remark;
            }
            user.save();
            txn.save();
            res.send(txn);
        }).catch((e) => {
            console.log(e)
        })

    } else {
        res.send(txn);
    }
})



router.post('/upideposit/status', async (req, res) => {
    //console.log('upigateway notify',req.body);

    const orderID = req.body.client_txn_id;
    const txn = await Transaction.findById(orderID);
    if (txn.status != "PAID" && txn.status != "FAILED") {
        if (req.body.status == "success") {
            txn.status = 'PAID';
            const user = await User.findById(txn.User_id)
            user.Wallet_balance += txn.amount;
            user.totalDeposit += txn.amount;
            await user.save();
            txn.closing_balance = user.Wallet_balance;
            txn.txn_msg = 'UPI Transaction is Successful';
            await txn.save();
        }
        else if (req.body.status == "failure") {
            txn.status = 'FAILED';
            txn.txn_msg = req.body.remark;
            await txn.save();
        }
        else {
            txn.status = 'Pending';
            txn.txn_msg = "Transaction Processing";
            await txn.save();
        }
    }
    res.status(200).json({ status: "ok", message: "response", responsecode: "200" })
})


router.post('/checkout/deposite/txn', Auth, async (req, res) => {
    try {
        const txn = await Transaction.findById(req.body.txnID);
        if (txn.status != 'Pending') {
            res.send({ txnStatus: txn.status, msg: txn.txn_msg })
        }
        else {
            res.send({ txnStatus: 'pending' })
        }
    } catch (error) {
        console.log(error)
    }
})


router.get("/deposit/success", async (req, res) => {
    try {
        const admin = await Transaction.find({ status: "success" }).countDocuments()

        res.status(200).send(admin.toString()).sort({ createdAt: -1 })

    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/deposit/pending", async (req, res) => {
    try {
        const admin = await Transaction.find({ status: "Pending" }).countDocuments()

        res.status(200).send(admin.toString()).sort({ createdAt: -1 })

    } catch (e) {
        res.status(400).send(e)
    }
})
router.get("/deposit/rejected", async (req, res) => {
    try {
        const admin = await Transaction.find({ status: "rejected" }).countDocuments().sort({ createdAt: -1 })

        res.status(200).send(admin.toString())

    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/txn/deposit/all", Auth, async (req, res) => {
    const searchq = req.query._q;
    const searchtype = req.query._stype;
    const searchbystatus = req.query._status;

    const PAGE_SIZE = req.query._limit;
    let page = (req.query.page == 0) ? 0 : parseInt(req.query.page - 1);
    try {

        let query = {};
        let total;
        let admin;
        if (searchq != 0 && searchtype != 0 && searchbystatus == 0 && searchtype != '_id') {
            page = parseInt("0");
            query[searchtype] = (searchtype === 'Phone' || searchtype === '_id') ? searchq : new RegExp('.*' + searchq + '.*')
            let userData = await User.findOne(query).select('_id').where("user_type").ne("Admin");

            myObjectId = userData._id;
            myObjectIdString = myObjectId.toString()

            total = await Transaction.countDocuments({ Req_type: "deposit", User_id: myObjectIdString });
            admin = await Transaction.find({ Req_type: "deposit", User_id: myObjectIdString }).populate("User_id").sort({ createdAt: -1 });

        } else if (searchbystatus != 0 && searchq == 0 && searchtype == 0) {
            total = await Transaction.countDocuments({ Req_type: "deposit", status: searchbystatus });
            admin = await Transaction.find({ Req_type: "deposit", status: searchbystatus }).populate("User_id").sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE * page);
        }
        else if (searchtype === '_id') {
            query[searchtype] = (searchtype === '_id') ? searchq : new RegExp('.*' + searchq + '.*')
            total = await Transaction.countDocuments(query);
            admin = await Transaction.find(query).populate("User_id").sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE * page);
        }
        else {
            total = await Transaction.countDocuments({ Req_type: "deposit" });
            admin = await Transaction.find({ Req_type: "deposit" }).populate("User_id").sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE * page);
        }

        //const total = await Transaction.countDocuments({$and: [{ Req_type: "deposit" }]});
        //const admin = await Transaction.find({$and: [{ Req_type: "deposit" }]}).populate("User_id").sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE * page)

        res.status(200).send({ totalPages: Math.ceil(total / PAGE_SIZE), admin })

    } catch (e) {
        res.status(400).send(e)
    }
})

//bonusbyadmin
router.get("/txn/bonusbyadmin/all", Auth, async (req, res) => {
    const PAGE_SIZE = req.query._limit;
    let page = (req.query.page == 0) ? 0 : parseInt(req.query.page - 1);
    try {
        const total = await Transaction.countDocuments({ $and: [{ Req_type: "bonus" }] });
        const admin = await Transaction.find({ $and: [{ Req_type: "bonus" }] }).populate("User_id").populate("action_by").sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE * page)

        res.status(200).send({ totalPages: Math.ceil(total / PAGE_SIZE), admin })

    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/txn_history/user/:id", Auth, async (req, res) => {
    try {
        const admin = await Transaction.find({
            $and: [{


                User_id: req.params.id, Req_type: "deposit"
            }]
        }).populate("User_id").sort({ createdAt: -1 });

        res.status(200).send(admin)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/txnwith_history/user/:id", Auth, async (req, res) => {
    try {
        const admin = await Transaction.find({


            $or: [{ User_id: req.params.id, Req_type: "withdraw" }]
        }).populate("User_id").sort({ createdAt: -1 });

        res.status(200).send(admin)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/txn/withdraw/all", Auth, async (req, res) => {
    const searchq = req.query._q;
    const searchtype = req.query._stype;
    const searchbystatus = req.query._status;

    const PAGE_SIZE = req.query._limit;
    let page = (req.query.page == 0) ? 0 : parseInt(req.query.page - 1);
    try {

        let query = {};
        let total;
        let data;
        if (searchq != 0 && searchtype != 0 && searchbystatus == 0) {
            page = parseInt("0");
            query[searchtype] = (searchtype === 'Phone' || searchtype === '_id') ? searchq : new RegExp('.*' + searchq + '.*')
            let admin = await User.findOne(query).select('_id').where("user_type").ne("Admin");

            myObjectId = admin._id;
            myObjectIdString = myObjectId.toString()

            total = await Transaction.countDocuments({ Req_type: "withdraw", User_id: myObjectIdString });
            data = await Transaction.find({ Req_type: "withdraw", User_id: myObjectIdString }).populate("User_id").sort({ createdAt: -1 });

        } else if (searchbystatus != 0 && searchq == 0 && searchtype == 0) {
            total = await Transaction.countDocuments({ Req_type: "withdraw", status: searchbystatus });
            data = await Transaction.find({ Req_type: "withdraw", status: searchbystatus }).populate("User_id").sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE * page);
        }
        else {
            total = await Transaction.countDocuments({ Req_type: "withdraw" });
            data = await Transaction.find({ Req_type: "withdraw" }).populate("User_id").sort({ createdAt: -1 }).limit(PAGE_SIZE).skip(PAGE_SIZE * page);
        }


        //res.status(200).send(data)

        res.status(200).send({ totalPages: Math.ceil(total / PAGE_SIZE), data })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get("/txn/withdraw/all/reject", Auth, async (req, res) => {
    try {
        const data = await Transaction.find({
            Req_type: "withdraw"
        }).populate("User_id").sort({ createdAt: -1 })
        res.status(200).send(data)
    } catch (e) {
        res.status(400).send(e)
    }
})



//payout manual through upi
router.post("/withdraw/payoutmanualupi", Auth, async (req, res) => {

    const { amount, withdraw_type, payment_gatway } = req.body
    const userID = req.user.id

    try {
        const user1 = await User.findById(userID);
        const lasttrans = await Transaction.findOne({ 'User_id': req.user.id }).sort({ _id: -1 });

        // console.log('userlasttxnstsauto',lasttrans.status);
        // console.log('userlasttxntime-auto',user1.lastWitdrawl);

        let currentTime = Date.now();
        let pendingGame = await Game.find(
            {
                $or: [
                    { $and: [{ Status: "new" }, { Created_by: userID }] },
                    { $and: [{ Status: "new" }, { Accepetd_By: userID }] },
                    { $and: [{ Status: "requested" }, { Created_by: userID }] },
                    { $and: [{ Status: "requested" }, { Accepetd_By: userID }] },
                ],

            }
        )
        let calculatedWallet = ((user1.wonAmount - user1.loseAmount) + user1.totalDeposit + user1.referral_earning + user1.hold_balance + user1.totalBonus) - (user1.totalWithdrawl + user1.referral_wallet + user1.totalPenalty);
        if (user1.Wallet_balance == calculatedWallet) {

            if (pendingGame.length == 0) {
                if (((parseInt(user1.lastWitdrawl) + 5400000) < currentTime && lasttrans.status == 'SUCCESS') || (user1.lastWitdrawl == null) || (!lasttrans || lasttrans.status != 'SUCCESS')) {
                    if (amount <= 10000) {
                        if (user1.withdraw_holdbalance == 0) {

                            if (amount <= user1.Wallet_balance && amount <= user1.withdrawAmount) {
                                const txn1 = new Transaction();
                                txn1.amount = amount;
                                txn1.User_id = user1._id;
                                txn1.Req_type = 'withdraw';
                                txn1.Withdraw_type = withdraw_type;
                                txn1.payment_gatway = payment_gatway;
                                txn1.status = 'Processing';

                                user1.Wallet_balance -= amount;
                                user1.withdrawAmount -= amount;
                                user1.withdraw_holdbalance += amount;
                                user1.lastWitdrawl = Date.now();

                                txn1.closing_balance = user1.Wallet_balance;

                                user1.save();
                                txn1.save();

                                return res.send(txn1);
                            }
                            else {
                                res.status(200).send({ message: 'Amount must be less than and equal to Wallet amount', subCode: 999 });
                            }
                        }
                        else {
                            res.status(200).send({ message: 'Your previous request already in process', subCode: 999 });
                        }
                    } else {
                        res.status(200).send({ message: 'UPI Withdrawal limit is Rs.10000, You can use withdraw through bank', subCode: 999 });
                    }
                }
                else {
                    res.status(200).send({ message: 'You can\'t Withdrawal for 1 hour since the last withdrawal.', subCode: 999 });
                }
            }
            else {
                res.status(200).send({ message: 'You are enrolled in game.', subCode: 999 });
            }
        }
        else {
            res.status(200).send({ message: 'Withdrawal is failed please contact to admin.', subCode: 999 });
        }
    }
    catch (e) {
        console.log(e);
        res.status(200).send({ message: 'Withdrawal is failed, Due to technical issue.', subCode: 999 });
    }
})


router.get("/manual/payoutstatus/:id", async (req, res) => {
    try {
        const txn1 = await Transaction.findById(req.params.id)
        //console.log(txn1);
        res.send(txn1);
    } catch (e) {
        res.status(400).send(e)
    }
})


const cfSdk = require('cashfree-sdk');
const { findById } = require("../Model/User")


const config = {
    Payouts: {
        ClientID: "CF217991CB3DEFUD94MM84223P3G",
        ClientSecret: "4fdeb33d0a4cecc3ad2975e83fe026f8377d487e",
        ENV: "PRODUCTION",
    }
};

const handleResponse = (response) => {
    if (response.status === "ERROR") {
        throw { name: "handle response error", message: "error returned" };
    }
}

const { Payouts } = cfSdk;
const { Beneficiary, Transfers } = Payouts;



router.post("/withdraw/request", Auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const lasttrans = await Transaction.findOne({ 'User_id': req.user.id }).sort({ _id: -1 });
        // console.log('userlasttxnsts',lasttrans.status);
        // console.log('userlasttxntime',user.lastWitdrawl);

        let currentTime = Date.now();
        console.log('userCurrenttime', currentTime);

        let pendingGame = await Game.find(
            {
                $or: [
                    { $and: [{ Status: "new" }, { Created_by: req.user.id }] },
                    { $and: [{ Status: "new" }, { Accepetd_By: req.user.id }] },
                    { $and: [{ Status: "requested" }, { Created_by: req.user.id }] },
                    { $and: [{ Status: "requested" }, { Accepetd_By: req.user.id }] },
                ],

            }
        )
        if (pendingGame.length == 0) {
            if (((parseInt(user.lastWitdrawl) + 5400000) < currentTime && lasttrans.status == 'SUCCESS') || (user.lastWitdrawl == null) || (!lasttrans || lasttrans.status != 'SUCCESS')) {
                if (req.body.amount >= 95) {
                    if (user.withdraw_holdbalance == 0) {
                        if (user.Wallet_balance >= req.body.amount && user.withdrawAmount >= req.body.amount) {
                            user.Wallet_balance -= req.body.amount;
                            user.withdrawAmount -= req.body.amount;
                            user.withdraw_holdbalance += req.body.amount;
                            user.lastWitdrawl = Date.now();
                            user.save();

                            var clientIp = req.headers['x-real-ip'];
                            var clientForwardedIp = req.headers['x-forwarded-for'];
                            var clientRemoteIp = req.headers['remote-host'];

                            const txn = new Transaction();
                            txn.amount = req.body.amount;
                            txn.User_id = user._id;
                            txn.Req_type = 'withdraw';
                            txn.Withdraw_type = req.body.type;
                            txn.payment_gatway = (req.body.payment_gatway) ? req.body.payment_gatway : '';
                            txn.closing_balance = user.Wallet_balance;
                            txn.status = 'Pending';
                            txn.client_ip = clientIp;
                            txn.client_forwarded_ip = clientForwardedIp;
                            txn.client_remote_ip = clientRemoteIp;
                            txn.save();

                            const withdraw = new Temp();
                            withdraw.Req_type = "withdraw";
                            withdraw.type = req.body.type;
                            withdraw.user = user._id;
                            withdraw.status = "Pending";
                            withdraw.closing_balance = user.Wallet_balance;
                            withdraw.amount = req.body.amount;
                            withdraw.txn_id = txn._id;
                            withdraw.save();

                            res.send({ "msg": "Your withdraw request submited successfully.", "success": true })
                        }
                        else {
                            res.send({ "msg": "You have not sufficient balance for withdrawal.", "success": false })
                        }
                    }
                    else {
                        res.send({ "msg": "Your previous request already in process", "success": false })
                        //Your previous request already in process
                    }
                }
                else {
                    res.send({ "msg": "Withdrawal amount should be greater or equal to 95 Rupees", "success": false })
                    //Withdrawal amount should be greater or equal to 95 Rupees.
                }
            }
            else {
                res.status(200).send({ "msg": 'You can\'t withdrawal for 1 hour since the last withdrawal.', "success": false, subCode: 999 });
            }
        }
        else {
            res.status(200).send({ "msg": 'You are enrolled in game.', "success": false, subCode: 999 });
        }

    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
})

//for cashfree admin approval
router.post("/withdraw/bank/adminmanual", Auth, async (req, res) => {

    const { amount, type, userID, txnID, reqID } = req.body
    try {
        const user = await User.findById(userID);
        if (user.withdraw_holdbalance > 0) {

            const txn = await Transaction.findById(txnID);

            const transfer = {
                beneId: user._id,
                transferId: txn._id,
                amount: amount,
                transferMode: type
            };

            (
                async () => {
                    Payouts.Init(config.Payouts);
                    //Get Beneficiary details
                    try {
                        const response = await Beneficiary.GetDetails({
                            "beneId": user._id,
                        });
                        if (response.status === 'ERROR' && response.subCode === '404' && response.message === 'Beneficiary does not exist') {
                            res.status(200).send(response);

                        }
                        else {
                            // further process for payment transfer
                            try {
                                const response = await Transfers.RequestTransfer(transfer);

                                res.status(200).send(response);
                                handleResponse(response);
                            }
                            catch (err) {

                                console.log(err);
                                return;
                            }
                            //Get transfer status
                            try {
                                const response = await Transfers.GetTransferStatus({
                                    "transferId": transfer.transferId,
                                });
                                if (response.data.transfer.status === 'SUCCESS') {
                                    txn.referenceId = response.data.transfer.referenceId;
                                    txn.status = response.data.transfer.status;
                                    user.totalWithdrawl += txn.amount;
                                    user.withdraw_holdbalance -= txn.amount;
                                    user.lastWitdrawl = Date.now();
                                    await user.save();
                                    await txn.save()


                                    const withdraw = await Temp.findById(reqID);
                                    withdraw.status = response.data.transfer.status;
                                    withdraw.save();
                                }
                                handleResponse(response);
                            }
                            catch (err) {
                                console.log("err caught in getting transfer status");
                                console.log(err);
                                return;
                            }
                        }
                    }
                    catch (err) {
                        console.log("err caught in getting beneficiary details");
                        console.log(err);
                        return;
                    }

                }
            )();

        }
        else {
            res.status(200).send({ message: 'Invalid Request', subCode: 999 });
        }
    }
    catch (e) {
        res.send(e)
        console.log(e);
    }
})

//for razorpay admin payout approval
/*router.post("/withdraw/razorpay/adminmanual", Auth, async (req, res) => {

    const { amount, type, userID, txnID, reqID } = req.body
    
    var clientIp = req.headers['x-real-ip'];
    var clientForwardedIp = req.headers['x-forwarded-for'];
    var clientRemoteIp = req.headers['remote-host'];
    
    console.log('admin rzp txnid');
    console.log(reqID);
    
    try {
        const user = await User.findById(userID);
        if(user.withdraw_holdbalance>0 && type=='upi')
        {
    
                const txn = await Transaction.findById(txnID);
                const withdraw = await Temp.findById(reqID);
                
                if(InProcessSubmit == false){
                    //res.status(200).send({ message: 'Payout Request already processed', subCode: 999 });
                InProcessSubmit = true;
                //console.log(withdraw);
                if(txn.status === 'SUCCESS' || txn.status === 'FAILED'){
                    console.log('Payout Request already processed1');
                    InProcessSubmit = false;
                    res.status(200).send({ message: 'Payout Request already processed1', subCode: 999 });
                }else{
                //rzp_test_i0SlYyQSHbxcv1
                //P7J4aOT676Px2CJq0eXLAs9K
                
                var username = razorpayKey;
                var password = razorpaySecretKey;
                (
                    async () => {
                        const axios = require('axios').default;
                        const options = {
                        method: 'POST',
                        url: 'https://api.razorpay.com/v1/payouts',
                        auth: {
                            username: username,
                            password: password
                            },
                        headers: {
                            'content-type': 'application/json'
                        },
                        data: 
                        {
                            "account_number": "409002043921",
                            // "amount": amount*100,
                            "amount": 100,
                            "currency": "INR",
                            "mode": "UPI",
                            "purpose": "payout",
                            "fund_account": {
                                "account_type": "vpa",
                                "vpa": {
                                    "address": user.upi_id
                                },
                                "contact": {
                                    "name": user.holder_name.toString(),
                                    "email": (user.email)?user.email.toString():"",
                                    "contact": (user.Phone)?user.Phone.toString():"",
                                    "type": "self",
                                    "reference_id": user._id.toString(),
                                }
                            },
                            "queue_if_low_balance": true,
                            "reference_id": txn._id,
                        },
                    };

                    axios.request(options)
                    .then(function (response) {
                        console.log('admin payout request response');
                        console.log(response.data);
                        
                        if (response.data.status === 'processed') {
                            txn.referenceId = response.data.id;
                            txn.status = 'SUCCESS';
                            txn.action_by = req.user.id;
                            
                            txn.client_ip = clientIp;
                            txn.client_forwarded_ip = clientForwardedIp;
                            txn.client_remote_ip = clientRemoteIp;
                            
                            if(user.withdraw_holdbalance == txn.amount){
                                user.totalWithdrawl+=txn.amount;
                                user.withdraw_holdbalance -= txn.amount;
                            }
                            
                            user.save();
                            txn.save()
                            
                            withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                            withdraw.status = 'SUCCESS';
                            withdraw.save();
                            
                            InProcessSubmit = false;
                                            
                            res.status(200).send({ message: 'Your withdrawal request successfully completed', subCode: 200 });
                            
                        }else if(response.data.status === 'pending' || response.data.status === 'queued' || response.data.status === 'processing') {

                            txn.referenceId = response.data.id;
                            txn.status = 'pending';
                            txn.action_by = req.user.id;
                        
                            txn.client_ip = clientIp;
                            txn.client_forwarded_ip = clientForwardedIp;
                            txn.client_remote_ip = clientRemoteIp;
        
                            txn.save();
                            user.save();
                            
                            //withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                            withdraw.status = 'Proccessing';
                            withdraw.save();
                            
                            InProcessSubmit = false;                            
                            
                            res.status(200).send({ message: 'Your withdrawal request in proccessing', subCode: 200 });

                        }else if (response.data.status === 'rejected' || response.data.status === 'cancelled') {
                            txn.referenceId = response.data.id;
                            txn.status = 'FAILED';
                            txn.action_by = req.user.id;
                            txn.txn_msg = "issuer bank or payment service provider declined the transaction";
                            
                            txn.client_ip = clientIp;
                            txn.client_forwarded_ip = clientForwardedIp;
                            txn.client_remote_ip = clientRemoteIp;
                            
                            if(user.withdraw_holdbalance == txn.amount){
                                user.Wallet_balance += txn.amount;
                                user.withdrawAmount += txn.amount;
                                user.withdraw_holdbalance -= txn.amount;
                            } 
                            user.save();
                            txn.save();
                            
                            withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                            withdraw.status = 'FAILED';
                            withdraw.save();
                            
                            InProcessSubmit = false;                            
                            
                            res.status(200).send({ message: 'Your withdrawal request failed', subCode: 200 });
                        }
                    })
                    .catch(function (error) {
                        console.error('admin auto payout response error');
                            txn.status = 'FAILED';
                            txn.action_by = req.user.id;
                            txn.txn_msg = "Withdraw request failed due to technical issue, try after some time.";
                            
                            txn.client_ip = clientIp;
                            txn.client_forwarded_ip = clientForwardedIp;
                            txn.client_remote_ip = clientRemoteIp;
                            
                            if(user.withdraw_holdbalance == txn.amount){
                                user.Wallet_balance += txn.amount;
                                user.withdrawAmount += txn.amount;
                                user.withdraw_holdbalance -= txn.amount;
                            } 
                            user.save();
                            txn.save();
                            
                            withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                            withdraw.status = 'FAILED';
                            withdraw.save();
                            
                            InProcessSubmit = false;
                            
                            res.status(200).send({ message: 'Withdraw request failed due to technical issue, try after some time.', subCode: 200 }); 

                    });        
                    }
                )();
                user.save();
                txn.save();
               
                } 
            }else{
                console.log('Payout Request already processed2');
                InProcessSubmit = false;
                res.status(200).send({ message: 'Payout Request already processed2', subCode: 999 });
            }
        }
        else{
            InProcessSubmit = false;
            res.status(200).send({ message: 'Invalid Request', subCode: 999 });
        }
    }
    catch (e) {
        res.send(e)
        //console.log(e);
    }
})*/



//for razorpay admin payout approval adminmanual__upipayout
router.post("/withdraw/razorpay/adminmanual", Auth, async (req, res) => {

    const { amount, type, userID, txnID, reqID } = req.body

    var clientIp = req.headers['x-real-ip'];
    var clientForwardedIp = req.headers['x-forwarded-for'];
    var clientRemoteIp = req.headers['remote-host'];

    // console.log('admin rzp txnid');
    // console.log(reqID);

    try {
        const user = await User.findById(userID);
        if (user.withdraw_holdbalance > 0 && type == 'upi') {

            const txn = await Transaction.findById(txnID);
            const withdraw = await Temp.findById(reqID);

            if (InProcessSubmit == false) {
                //res.status(200).send({ message: 'Payout Request already processed', subCode: 999 });
                InProcessSubmit = true;
                //console.log(withdraw);
                if (txn.status === 'SUCCESS' || txn.status === 'FAILED') {
                    console.log('Payout Request already processed1');
                    InProcessSubmit = false;
                    res.status(200).send({ message: 'Payout Request already processed1', subCode: 999 });
                } else {
                    //rzp_test_i0SlYyQSHbxcv1
                    //P7J4aOT676Px2CJq0eXLAs9K

                    var username = razorpayKey;
                    var password = razorpaySecretKey;
                    (
                        async () => {
                            const axios = require('axios').default;
                            const options = {
                                method: 'POST',
                                url: 'https://api.razorpay.com/v1/payouts',
                                auth: {
                                    username: username,
                                    password: password
                                },
                                headers: {
                                    'content-type': 'application/json'
                                },
                                data:
                                {
                                    "account_number": "409002229172",
                                    "amount": amount * 100,
                                    "currency": "INR",
                                    "mode": "UPI",
                                    "purpose": "payout",
                                    "fund_account": {
                                        "account_type": "vpa",
                                        "vpa": {
                                            "address": user.upi_id
                                        },
                                        "contact": {
                                            "name": user.holder_name.toString(),
                                            "email": (user.email) ? user.email.toString() : "",
                                            "contact": (user.Phone) ? user.Phone.toString() : "",
                                            "type": "self",
                                            "reference_id": user._id.toString(),
                                        }
                                    },
                                    "queue_if_low_balance": true,
                                    "reference_id": txn._id,
                                },
                            };

                            axios.request(options)
                                .then(function (response) {
                                    console.log('admin payout request response');
                                    // console.log(response.data);

                                    if (response.data.status === 'processed') {
                                        txn.referenceId = response.data.id;
                                        txn.status = 'SUCCESS';
                                        txn.action_by = req.user.id;

                                        txn.client_ip = clientIp;
                                        txn.client_forwarded_ip = clientForwardedIp;
                                        txn.client_remote_ip = clientRemoteIp;

                                        if (user.withdraw_holdbalance == txn.amount) {
                                            user.totalWithdrawl += txn.amount;
                                            user.withdraw_holdbalance -= txn.amount;
                                        }

                                        user.save();
                                        txn.save()

                                        withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                                        withdraw.status = 'SUCCESS';
                                        withdraw.save();

                                        InProcessSubmit = false;

                                        res.status(200).send({ message: 'Your withdrawal request successfully completed', subCode: 200 });

                                    } else if (response.data.status === 'pending' || response.data.status === 'queued' || response.data.status === 'processing') {

                                        txn.referenceId = response.data.id;
                                        txn.status = 'pending';
                                        txn.action_by = req.user.id;

                                        txn.client_ip = clientIp;
                                        txn.client_forwarded_ip = clientForwardedIp;
                                        txn.client_remote_ip = clientRemoteIp;

                                        txn.save();
                                        user.save();

                                        //withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                                        withdraw.status = 'Proccessing';
                                        withdraw.save();

                                        InProcessSubmit = false;

                                        res.status(200).send({ message: 'Your withdrawal request in proccessing', subCode: 200 });

                                    } else if (response.data.status === 'rejected' || response.data.status === 'cancelled') {
                                        txn.referenceId = response.data.id;
                                        txn.status = 'FAILED';
                                        txn.action_by = req.user.id;
                                        txn.txn_msg = "issuer bank or payment service provider declined the transaction";

                                        txn.client_ip = clientIp;
                                        txn.client_forwarded_ip = clientForwardedIp;
                                        txn.client_remote_ip = clientRemoteIp;

                                        if (user.withdraw_holdbalance == txn.amount) {
                                            user.Wallet_balance += txn.amount;
                                            user.withdrawAmount += txn.amount;
                                            user.withdraw_holdbalance -= txn.amount;
                                        }
                                        user.save();
                                        txn.save();

                                        withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                                        withdraw.status = 'FAILED';
                                        withdraw.save();

                                        InProcessSubmit = false;

                                        res.status(200).send({ message: 'Your withdrawal request failed', subCode: 200 });
                                    }
                                })
                                .catch(function (error) {
                                    console.log('admin auto payout response error upi', error.response.data);
                                    txn.status = 'FAILED';
                                    txn.action_by = req.user.id;
                                    txn.txn_msg = "Withdraw request failed due to technical issue, try after some time.";

                                    txn.client_ip = clientIp;
                                    txn.client_forwarded_ip = clientForwardedIp;
                                    txn.client_remote_ip = clientRemoteIp;

                                    if (user.withdraw_holdbalance == txn.amount) {
                                        user.Wallet_balance += txn.amount;
                                        user.withdrawAmount += txn.amount;
                                        user.withdraw_holdbalance -= txn.amount;
                                    }
                                    user.save();
                                    txn.save();

                                    withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                                    withdraw.status = 'FAILED';
                                    withdraw.save();

                                    InProcessSubmit = false;

                                    res.status(200).send({ message: 'Withdraw request failed due to technical issue, try after some time.', subCode: 200 });

                                });
                        }
                    )();
                    user.save();
                    txn.save();

                }
            } else {
                console.log('Payout Request already processed2');
                InProcessSubmit = false;
                res.status(200).send({ message: 'Payout Request already processed2', subCode: 999 });
            }
        }
        else {
            InProcessSubmit = false;
            res.status(200).send({ message: 'Invalid Request', subCode: 999 });
        }
    }
    catch (e) {
        console.log(e);
        res.send(e)
    }
})



//for razorpay admin payout approval ---bank payout ---withdraw/decentro/adminmanual
router.post("/withdraw/decentro/adminmanual", Auth, async (req, res) => {

    const { amount, type, userID, txnID, reqID } = req.body

    var clientIp = req.headers['x-real-ip'];
    var clientForwardedIp = req.headers['x-forwarded-for'];
    var clientRemoteIp = req.headers['remote-host'];

    // console.log('admin rzp txnid');
    // console.log(reqID);

    try {
        const user = await User.findById(userID);

        if (user.razor_pay_fund_id && type == 'banktransfer') {

            if (user.withdraw_holdbalance > 0 && type == 'banktransfer') {

                const txn = await Transaction.findById(txnID);
                const withdraw = await Temp.findById(reqID);

                if (InProcessSubmit == false) {
                    //res.status(200).send({ message: 'Payout Request already processed', subCode: 999 });
                    InProcessSubmit = true;
                    //console.log(withdraw);
                    if (txn.status === 'SUCCESS' || txn.status === 'FAILED') {
                        console.log('Payout Request already processed1');
                        InProcessSubmit = false;
                        res.status(200).send({ message: 'Payout Request already processed1', subCode: 999 });
                    } else {
                        //rzp_test_i0SlYyQSHbxcv1
                        //P7J4aOT676Px2CJq0eXLAs9K

                        var username = razorpayKey;
                        var password = razorpaySecretKey;
                        (
                            async () => {
                                const axios = require('axios').default;
                                const options = {
                                    method: 'POST',
                                    url: 'https://api.razorpay.com/v1/payouts',
                                    auth: {
                                        username: username,
                                        password: password
                                    },
                                    headers: {
                                        'content-type': 'application/json'
                                    },
                                    data:
                                    {
                                        "account_number": "409002229172",
                                        "fund_account_id": user.razor_pay_fund_id,
                                        "amount": amount * 100,
                                        "currency": "INR",
                                        "mode": "IMPS",
                                        "purpose": "payout",
                                        "queue_if_low_balance": true,
                                        "reference_id": txn._id,
                                    },
                                };

                                axios.request(options)
                                    .then(function (response) {
                                        console.log('admin payout request response');
                                        // console.log(response.data);

                                        if (response.data.status === 'processed') {
                                            txn.referenceId = response.data.id;
                                            txn.status = 'SUCCESS';
                                            txn.action_by = req.user.id;

                                            txn.client_ip = clientIp;
                                            txn.client_forwarded_ip = clientForwardedIp;
                                            txn.client_remote_ip = clientRemoteIp;

                                            if (user.withdraw_holdbalance == txn.amount) {
                                                user.totalWithdrawl += txn.amount;
                                                user.withdraw_holdbalance -= txn.amount;
                                            }

                                            user.save();
                                            txn.save()

                                            withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                                            withdraw.status = 'SUCCESS';
                                            withdraw.save();

                                            InProcessSubmit = false;

                                            res.status(200).send({ message: 'Your withdrawal request successfully completed', subCode: 200 });

                                        } else if (response.data.status === 'pending' || response.data.status === 'queued' || response.data.status === 'processing') {

                                            txn.referenceId = response.data.id;
                                            txn.status = 'pending';
                                            txn.action_by = req.user.id;

                                            txn.client_ip = clientIp;
                                            txn.client_forwarded_ip = clientForwardedIp;
                                            txn.client_remote_ip = clientRemoteIp;

                                            txn.save();
                                            user.save();

                                            //withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                                            withdraw.status = 'Proccessing';
                                            withdraw.save();

                                            InProcessSubmit = false;

                                            res.status(200).send({ message: 'Your withdrawal request in proccessing', subCode: 200 });

                                        } else if (response.data.status === 'rejected' || response.data.status === 'cancelled') {
                                            txn.referenceId = response.data.id;
                                            txn.status = 'FAILED';
                                            txn.action_by = req.user.id;
                                            txn.txn_msg = "issuer bank or payment service provider declined the transaction";

                                            txn.client_ip = clientIp;
                                            txn.client_forwarded_ip = clientForwardedIp;
                                            txn.client_remote_ip = clientRemoteIp;

                                            if (user.withdraw_holdbalance == txn.amount) {
                                                user.Wallet_balance += txn.amount;
                                                user.withdrawAmount += txn.amount;
                                                user.withdraw_holdbalance -= txn.amount;
                                            }
                                            user.save();
                                            txn.save();

                                            withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                                            withdraw.status = 'FAILED';
                                            withdraw.save();

                                            InProcessSubmit = false;

                                            res.status(200).send({ message: 'Your withdrawal request failed', subCode: 200 });
                                        }
                                    })
                                    .catch(function (error) {
                                        // console.error('admin auto payout response error',error.response.data);
                                        txn.status = 'FAILED';
                                        txn.action_by = req.user.id;
                                        txn.txn_msg = "Withdraw request failed due to technical issue, try after some time.";

                                        txn.client_ip = clientIp;
                                        txn.client_forwarded_ip = clientForwardedIp;
                                        txn.client_remote_ip = clientRemoteIp;

                                        if (user.withdraw_holdbalance == txn.amount) {
                                            user.Wallet_balance += txn.amount;
                                            user.withdrawAmount += txn.amount;
                                            user.withdraw_holdbalance -= txn.amount;
                                        }
                                        user.save();
                                        txn.save();

                                        withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                                        withdraw.status = 'FAILED';
                                        withdraw.save();

                                        InProcessSubmit = false;

                                        res.status(200).send({ message: 'Withdraw request failed due to technical issue, try after some time.', subCode: 200 });

                                    });
                            }
                        )();
                        user.save();
                        txn.save();

                    }
                } else {
                    console.log('Payout Request already processed2');
                    InProcessSubmit = false;
                    res.status(200).send({ message: 'Payout Request already processed2', subCode: 999 });
                }
            }
            else {
                InProcessSubmit = false;
                res.status(200).send({ message: 'Invalid Request', subCode: 999 });
            }
        } else {
            InProcessSubmit = false;
            res.status(200).send({ message: 'Your Bank Details Not Verified', subCode: 999 });
        }

    }
    catch (e) {
        res.send(e)
        //console.log(e);
    }
})

//payout payout razorpay bank
router.post("/withdraw/payoutrazorpaybank", Auth, async (req, res) => {

    const { amount, type, payment_gatway } = req.body
    const userID = req.user.id

    var clientIp = req.headers['x-real-ip'];
    var clientForwardedIp = req.headers['x-forwarded-for'];
    var clientRemoteIp = req.headers['remote-host'];

    try {
        const user1 = await User.findById(userID);
        const lasttrans = await Transaction.findOne({ 'User_id': req.user.id }).sort({ _id: -1 });

        // console.log('userlasttxnstsauto',lasttrans.status);
        // console.log('userlasttxntime-auto',user1.lastWitdrawl);

        let currentTime = Date.now();
        let pendingGame = await Game.find(
            {
                $or: [
                    { $and: [{ Status: "new" }, { Created_by: userID }] },
                    { $and: [{ Status: "new" }, { Accepetd_By: userID }] },
                    { $and: [{ Status: "requested" }, { Created_by: userID }] },
                    { $and: [{ Status: "requested" }, { Accepetd_By: userID }] },
                ],

            }
        )
        let calculatedWallet = ((user1.wonAmount - user1.loseAmount) + user1.totalDeposit + user1.referral_earning + user1.hold_balance + user1.totalBonus) - (user1.totalWithdrawl + user1.referral_wallet + user1.totalPenalty);
        if (user1.Wallet_balance == calculatedWallet) {

            if (pendingGame.length == 0) {
                if (((parseInt(user1.lastWitdrawl) + 5400000) < currentTime && lasttrans.status == 'SUCCESS') || (user1.lastWitdrawl == null) || (!lasttrans || lasttrans.status != 'SUCCESS')) {
                    if (amount <= 10000) {
                        if (user1.withdraw_holdbalance == 0) {

                            if (amount <= user1.Wallet_balance && amount <= user1.withdrawAmount) {
                                const txn1 = new Transaction();
                                txn1.amount = amount;
                                txn1.User_id = user1._id;
                                txn1.Req_type = 'withdraw';
                                txn1.Withdraw_type = type;
                                txn1.payment_gatway = payment_gatway;

                                user1.Wallet_balance -= amount;
                                user1.withdrawAmount -= amount;
                                user1.withdraw_holdbalance += amount;
                                user1.lastWitdrawl = Date.now();
                                txn1.closing_balance = user1.Wallet_balance;

                                user1.save();
                                txn1.save();

                                const user = await User.findById(userID);
                                const txn = await Transaction.findById(txn1._id);

                                //console.log('razor-seco-txndata',txn);

                                var username = razorpayKey;
                                var password = razorpaySecretKey;
                                (
                                    async () => {
                                        const axios = require('axios').default;
                                        const options = {
                                            method: 'POST',
                                            url: 'https://api.razorpay.com/v1/payouts',
                                            auth: {
                                                username: username,
                                                password: password
                                            },
                                            headers: {
                                                'content-type': 'application/json'
                                            },
                                            data:
                                            {
                                                "account_number": "409002229172",
                                                "amount": amount * 100,
                                                "currency": "INR",
                                                "mode": "UPI",
                                                "purpose": "payout",
                                                "fund_account": {
                                                    "account_type": "vpa",
                                                    "vpa": {
                                                        "address": user.upi_id
                                                    },
                                                    "contact": {
                                                        "name": user.holder_name.toString(),
                                                        "email": (user.email) ? user.email.toString() : "",
                                                        "contact": (user.Phone) ? user.Phone.toString() : "",
                                                        "type": "self",
                                                        "reference_id": user._id.toString(),
                                                    }
                                                },
                                                "queue_if_low_balance": true,
                                                "reference_id": txn._id,
                                            },
                                        };

                                        axios.request(options)
                                            .then(function (response) {
                                                //console.log('USER auto payout response2');
                                                //console.log(response.data);

                                                txn.client_ip = clientIp;
                                                txn.client_forwarded_ip = clientForwardedIp;
                                                txn.client_remote_ip = clientRemoteIp;

                                                if (response.data.status === 'processed') {
                                                    txn.referenceId = response.data.id;
                                                    txn.status = 'SUCCESS';

                                                    if (user.withdraw_holdbalance == txn.amount) {
                                                        user.totalWithdrawl += txn.amount;
                                                        user.withdraw_holdbalance -= txn.amount;
                                                    }

                                                    user.save();
                                                    txn.save()

                                                    withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                                                    withdraw.status = 'SUCCESS';
                                                    withdraw.save();

                                                    res.status(200).send({ message: 'Your withdrawal request successfully completed', subCode: 200 });

                                                } else if (response.data.status === 'pending' || response.data.status === 'queued' || response.data.status === 'processing') {

                                                    txn.referenceId = response.data.id;
                                                    txn.status = 'pending';
                                                    txn.save();
                                                    user.save();

                                                    res.status(200).send({ message: 'Your withdrawal request in proccessing', subCode: 200 });

                                                } else if (response.data.status === 'rejected' || response.data.status === 'cancelled') {
                                                    txn.referenceId = response.data.id;
                                                    txn.status = 'FAILED';
                                                    txn.txn_msg = "issuer bank or payment service provider declined the transaction";


                                                    if (user.withdraw_holdbalance == txn.amount) {
                                                        user.Wallet_balance += txn.amount;
                                                        user.withdrawAmount += txn.amount;
                                                        user.withdraw_holdbalance -= txn.amount;
                                                    }
                                                    user.save();
                                                    txn.save();

                                                    res.status(200).send({ message: 'issuer bank or payment service provider declined the transaction', subCode: 200 });
                                                }
                                            })
                                            .catch(function (error) {
                                                //console.error('admin auto payout response error2');
                                                txn.status = 'FAILED';
                                                txn.txn_msg = "Withdraw request failed due to technical issue, try after some time.";


                                                if (user.withdraw_holdbalance == txn.amount) {
                                                    user.Wallet_balance += txn.amount;
                                                    user.withdrawAmount += txn.amount;
                                                    user.withdraw_holdbalance -= txn.amount;
                                                }
                                                user.save();
                                                txn.save();

                                                res.status(200).send({ message: 'Withdraw request failed due to technical issue, try after some time.', subCode: 200 });

                                            });
                                    }
                                )();

                            }
                            else {
                                res.status(200).send({ message: 'Amount must be less than and equal to Wallet amount', subCode: 999 });
                            }
                        }
                        else {
                            res.status(200).send({ message: 'Your previous request already in process', subCode: 999 });
                        }
                    } else {
                        res.status(200).send({ message: 'UPI Withdrawal limit is Rs.10000, You can use withdraw through bank', subCode: 999 });
                    }
                }
                else {
                    res.status(200).send({ message: 'You can\'t Withdrawal for 1.5 hour since the last withdrawal.', subCode: 999 });
                }
            }
            else {
                res.status(200).send({ message: 'You are enrolled in game.', subCode: 999 });
            }
        }
        else {
            res.status(200).send({ message: 'Withdrawal is failed please contact to admin.', subCode: 999 });
        }
    }
    catch (e) {
        console.log(e);
        res.status(200).send({ message: 'Withdrawal is failed, Due to technical issue.', subCode: 999 });
    }
})

//razorpay check payouts
router.post('/razorpaypayoutscheck/response', Auth, async (req, res) => {

    const orderID = req.body.txn_id;
    const referenceId = req.body.referenceId;
    const txn = await Transaction.findById(orderID);
    const user = await User.findById(txn.User_id);

    const withdraw = await Temp.findOne({ txn_id: txn._id });
    if (withdraw && withdraw.status == 'Pending') {
        res.send(txn);
    } else {
        //&& txn.status != "FAILED"
        if (txn._id == orderID && txn.referenceId == referenceId && txn.status != 'SUCCESS') {
            try {
                const axios = require("axios").default;
                const options = {
                    method: 'GET',
                    url: `https://${razorpayKey}:${razorpaySecretKey}@api.razorpay.com/v1/payouts/${referenceId}`
                };
                axios.request(options).then(function (response) {
                    // console.log('payout capture',response.data);
                    const payout_id = response.data.id;
                    const payout_status = response.data.status;
                    const txn_id = response.data.reference_id;

                    console.log('razorpayoutrespo', payout_status);
                    if (payout_status == "processed") {

                        if (txn.status != "SUCCESS" && txn.status != "FAILED") {

                            txn.status = 'SUCCESS';
                            txn.txn_msg = 'Withdraw Transaction is Successful';

                            if (user.withdraw_holdbalance == txn.amount) {
                                user.totalWithdrawl += txn.amount;
                                user.withdraw_holdbalance -= txn.amount;
                            }
                            user.lastWitdrawl = Date.now();
                            user.save();
                            txn.save();
                            if (withdraw) {
                                withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                                withdraw.status = 'SUCCESS';
                                withdraw.save();
                            }
                        }
                        res.send(txn);
                    }
                    else if (payout_status == "reversed" || payout_status == "failed") {

                        if (txn.status != "SUCCESS" && txn.status != "FAILED") {
                            txn.status = 'FAILED';
                            txn.txn_msg = response.data.status_details.description;

                            if (user.withdraw_holdbalance == txn.amount) {
                                user.Wallet_balance += txn.amount;
                                user.withdrawAmount += txn.amount;
                                user.withdraw_holdbalance -= txn.amount;
                            }
                            user.lastWitdrawl = Date.now();
                            user.save();
                            txn.save();
                            if (withdraw) {
                                withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                                withdraw.status = 'FAILED';
                                withdraw.save();
                            }
                        }
                        res.send(txn);
                    }
                    else if (payout_status == "processing") {

                        if (txn.status != "SUCCESS" && txn.status != "FAILED") {
                            txn.txn_msg = response.data.status_details.description;
                            txn.save();
                        }
                        res.send(txn);
                    }
                })
                    .catch(function (error) {
                        console.error('payout captur error1', error);
                        res.send(txn);
                    });
            } catch (err) {
                console.log('pay captur error2');
                res.send(txn);
            }

        } else {
            res.send(txn);
        }
    }


})

//razorpay check payouts useing decentro name 
router.post('/decentropayout/response', Auth, async (req, res) => {

    const orderID = req.body.txn_id;
    const referenceId = req.body.referenceId;
    const txn = await Transaction.findById(orderID);
    const user = await User.findById(txn.User_id);

    const withdraw = await Temp.findOne({ txn_id: txn._id });
    if (withdraw && withdraw.status == 'Pending') {
        res.send(txn);
    } else {
        //&& txn.status != "FAILED"
        if (txn._id == orderID && txn.referenceId == referenceId && txn.status != 'SUCCESS') {
            try {
                const axios = require("axios").default;
                const options = {
                    method: 'GET',
                    url: `https://${razorpayKey}:${razorpaySecretKey}@api.razorpay.com/v1/payouts/${referenceId}`
                };
                axios.request(options).then(function (response) {
                    // console.log('payout capture',response);
                    const payout_id = response.data.id;
                    const payout_status = response.data.status;
                    const txn_id = response.data.reference_id;

                    console.log('razorpayoutrespo', payout_status);
                    if (payout_status == "processed") {

                        if (txn.status != "SUCCESS" && txn.status != "FAILED") {

                            txn.status = 'SUCCESS';
                            txn.txn_msg = 'Withdraw Transaction is Successful';

                            if (user.withdraw_holdbalance == txn.amount) {
                                user.totalWithdrawl += txn.amount;
                                user.withdraw_holdbalance -= txn.amount;
                            }
                            user.lastWitdrawl = Date.now();
                            user.save();
                            txn.save();
                            if (withdraw) {
                                withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                                withdraw.status = 'SUCCESS';
                                withdraw.save();
                            }
                        }
                        res.send(txn);
                    }
                    else if (payout_status == "queued") {
                        res.send(txn);
                    }
                    else if (payout_status == "reversed") {

                        if (txn.status != "SUCCESS" && txn.status != "FAILED") {
                            txn.status = 'FAILED';
                            txn.txn_msg = response.data.status_details.description;

                            if (user.withdraw_holdbalance == txn.amount) {
                                user.Wallet_balance += txn.amount;
                                user.withdrawAmount += txn.amount;
                                user.withdraw_holdbalance -= txn.amount;
                            }
                            user.lastWitdrawl = Date.now();
                            user.save();
                            txn.save();
                            if (withdraw) {
                                withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                                withdraw.status = 'FAILED';
                                withdraw.save();
                            }
                        }
                        res.send(txn);
                    }
                    else if (payout_status == "failed") {

                        if (txn.status != "SUCCESS" && txn.status != "FAILED") {
                            txn.status = 'FAILED';
                            txn.txn_msg = response.data.status_details.description;

                            if (user.withdraw_holdbalance == txn.amount) {
                                user.Wallet_balance += txn.amount;
                                user.withdrawAmount += txn.amount;
                                user.withdraw_holdbalance -= txn.amount;
                            }
                            user.lastWitdrawl = Date.now();
                            user.save();
                            txn.save();
                            if (withdraw) {
                                withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
                                withdraw.status = 'FAILED';
                                withdraw.save();
                            }
                        }
                        res.send(txn);
                    }

                })
                    .catch(function (error) {
                        console.error('payout captur error1', error);
                        res.send(txn);
                    });
            } catch (err) {
                console.log('pay captur error2');
                res.send(txn);
            }

        } else {
            res.send(txn);
        }
    }


})


//payout withdrawAmount none/proccessing clear through api
router.post('/payout/response/api', Auth, async (req, res) => {

    const orderID = req.body.txn_id;
    const referenceId = req.body.referenceId;
    const txn = await Transaction.findById(orderID);
    const user = await User.findById(txn.User_id);

    // && txn.status != "FAILED"
    if (txn.status != 'SUCCESS') {
        txn.status = 'FAILED';
        txn.txn_msg = "issuer bank or payment service provider declined the transaction";

        if (user.withdraw_holdbalance == txn.amount) {
            user.Wallet_balance += txn.amount;
            user.withdrawAmount += txn.amount;
            user.withdraw_holdbalance -= txn.amount;
        }
        user.lastWitdrawl = Date.now();
        user.save();
        txn.save();
        res.send(txn);
    } else {
        res.send(txn);
    }
})




router.get("/total/deposit", Auth, async (req, res) => {
    try {
        const data = await Transaction.find({
            $and: [
                { Req_type: "deposit" },
                { status: "SUCCESS" }
            ]
        })

        let total = 0

        data.forEach((item) => {
            total += item.amount
        })

        res.status(200).send({ "data": total })
        // console.log(ress);
    } catch (e) {
        res.status(400).send(e)
        console.log(e);
    }
})

router.get("/total/withdraw", Auth, async (req, res) => {
    try {
        const data = await Transaction.find({
            $and: [
                { Req_type: "deposit" },
                { status: "withdraw" }
            ]
        })
        let total = 0

        data.forEach((item) => {
            total += item.amount
        })

        res.status(200).send({ "data": total })
        // console.log(ress);
    } catch (e) {
        res.status(400).send(e)
        console.log(e);
    }
})

// router.get("/withdrawlstatus/:id",Auth,async(req,res)=>{
//     try {
//         Payouts.Init(config.Payouts);

//         const withdraw=await Temp.findById(req.params.id);
//         const txn= await Transaction.findById(withdraw.txn_id);
//         const user= await User.findById(txn.User_id);
//         const response = await Transfers.GetTransferStatus({
//             "transferId": txn._id,
//         });
//         if(response.status=='ERROR' && response.subCode=='404')
//         {
//             if(txn.status==='FAILED')
//             {
//                 withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
//                 withdraw.status="FAILED";
//                 withdraw.save();
//             }else if(txn.status==='SUCCESS'){
//                 withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
//                 withdraw.status="SUCCESS";
//                 withdraw.save();
//             }
//             res.send({message:response.message});
//         }
//         else
//         {
//             if (response.status==='ERROR' && response.subCode==='403') {
//                 //console.log(txn.status)
//                 if(txn.status==='FAILED')
//                 {
//                     withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
//                     withdraw.status="FAILED";
//                     withdraw.save();
//                 }else{
//                     withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
//                     withdraw.status="SUCCESS";
//                     withdraw.save();
//                 }
//             }
//             if (response.data.transfer.status === 'SUCCESS') {
//                 if(txn.status!='SUCCESS')
//                 {
//                     txn.referenceId = response.data.transfer.referenceId;
//                     txn.status = response.data.transfer.status;

//                     if(user.withdraw_holdbalance >= txn.amount){
//                         user.withdraw_holdbalance -= txn.amount;
//                     }
//                     user.totalWithdrawl+=txn.amount
//                     await user.save();
//                     await txn.save()
//                     withdraw.status=response.data.transfer.status;
//                     withdraw.save();
//                 }else{
//                     if(txn.status==='FAILED')
//                     {
//                         withdraw.status="FAILED";
//                         withdraw.save();
//                     }else{
//                         withdraw.status="SUCCESS";
//                         withdraw.save();
//                     }
//                 }
//             }
//             else if(response.data.transfer.status === 'FAILED')
//             {
//                 if(txn.status!='FAILED')
//                 {
//                     txn.referenceId = response.data.transfer.referenceId;
//                     txn.status = response.data.transfer.status;
//                     user.Wallet_balance += txn.amount;
//                     user.withdrawAmount += txn.amount;
//                     if(user.withdraw_holdbalance >= txn.amount){
//                         user.withdraw_holdbalance -= txn.amount;
//                     }
//                     await user.save();
//                     await txn.save();
//                     withdraw.status="FAILED";
//                     withdraw.save();
//                 }else{
//                     if(txn.status==='FAILED')
//                     {
//                         withdraw.status="FAILED";
//                         withdraw.save();
//                     }else{
//                         withdraw.status="SUCCESS";
//                         withdraw.save();
//                     }
//                 }
//             }else{
//                 if(txn.status==='FAILED')
//                 {
//                     withdraw.status="FAILED";
//                     withdraw.save();
//                 }else{
//                     withdraw.status="SUCCESS";
//                     withdraw.save();
//                 }
//             }
//             res.send({message:response.data.transfer.status});
//         }
//     }
//     catch (err) {
//         console.log("err caught in getting transfer status");
//         console.log(err);
//         return;
//     }
// })


router.get("/withdrawreject/:id", async (req, res) => {
    try {
        const txn = await Transaction.findById(req.params.id);
        const user = await User.findById(txn.User_id);

        console.log("reject done1", user)

        if (user.withdraw_holdbalance > 0) {
            //const txn=await Transaction.findById(User_id);
            console.log("reject done2", txn.amount)
            user.Wallet_balance += txn.amount;
            user.withdrawAmount += txn.amount;
            user.withdraw_holdbalance -= txn.amount;
            //user.lastWitdrawl=null;
            user.lastWitdrawl = Date.now();
            //withdraw.closing_balance = withdraw.closing_balance + withdraw.amount;
            //withdraw.status = 'reject';

            txn.status = "FAILED";
            txn.txn_msg = "Withdraw rejected";
            txn.closing_balance = txn.closing_balance + txn.amount;
            console.log("reject done3", txn.closing_balance, user.withdraw_holdbalance, user.withdrawAmount, user.Wallet_balance)
            //withdraw.save();
            user.save();
            txn.save();
            res.status(200).send(txn)
        }
        else {
            res.send({ message: 'Invalid request', error: true })
        }
    } catch (e) {
        res.status(400).send(e)
    }
})





//user withdraw success update by admin side
router.post('/userwithdrawupdate/:id', Auth, async (req, res) => {

    if (req.body.status == "SUCCESS") {
        const orderID = req.params.id;
        const txn = await Transaction.findById(orderID);
        const user = await User.findById(txn.User_id)
        if (txn.status != "SUCCESS" && txn.status != "FAILED") {

            const user = await User.findById(txn.User_id)
            txn.status = 'SUCCESS';
            txn.txn_msg = 'Transaction is Successful';
            txn.action_by = req.user.id;//Added By team
            txn.referenceId = req.body.referenceId;
            user.totalWithdrawl += txn.amount;
            if (user.withdraw_holdbalance >= txn.amount) {
                user.withdraw_holdbalance -= txn.amount;
            }
            user.lastWitdrawl = Date.now();
            await user.save();
            await txn.save();
        }

        res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
    }

    else if (req.body.status == "FAILED") {
        const orderID1 = req.params.id;
        const txn1 = await Transaction.findById(orderID1);
        const user1 = await User.findById(txn1.User_id)
        if (txn1.status != "SUCCESS" && txn1.status != "FAILED") {
            txn1.status = 'FAILED';
            txn1.txn_msg = "issuer bank or payment service provider declined the transaction";
            txn1.referenceId = req.body.referenceId;


            if (user1.withdraw_holdbalance == txn1.amount) {
                user1.Wallet_balance += txn1.amount;
                user1.withdrawAmount += txn1.amount;
                user1.withdraw_holdbalance -= txn1.amount;
            }
            await user1.save();
            await txn1.save();
        }
        res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
    }
    else {
        res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
    }

})



//user deposit success update by admin side
router.post('/userdipositupdate/:id', Auth, async (req, res) => {

    if (req.body.status == "SUCCESS") {
        const orderID = req.params.id;
        const txn = await Transaction.findById(orderID);
        const user = await User.findById(txn.User_id)
        //if (txn.status != "PAID" && txn.status != "FAILED") {

        txn.status = "PAID";
        txn.txn_msg = "Deposit Transaction is Successful";
        user.Wallet_balance += txn.amount;
        user.totalDeposit += txn.amount;

        txn.closing_balance = user.Wallet_balance;

        await user.save();
        await txn.save();
        //}

        res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
    }

    else if (req.body.status == "FAILED") {
        const orderID1 = req.params.id;
        const txn1 = await Transaction.findById(orderID1);
        const user1 = await User.findById(txn1.User_id)
        // if (txn1.status != "PAID" && txn1.status != "FAILED") {
        txn1.status = 'FAILED';
        txn1.txn_msg = "issuer bank or payment service provider declined the transaction";

        await user1.save();
        await txn1.save();
        // }
        res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
    }
    else {
        res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
    }

})

//webhook-payouts-razorpay
router.post('/webhook-payouts-razorpay', async (req, res) => {
    //console.log("razorpay webhook",req.body);
    //console.log("razorpay webhook payload",req.body.payload);
    //console.log("razorpay webhook payoutentity",req.body.payload.payout.entity);
    if (req.body.payload && req.body.payload.payout && req.body.payload.payout.entity) {
        const payout_id = req.body.payload.payout.entity.id;
        const payout_status = req.body.payload.payout.entity.status;
        const txn_id = req.body.payload.payout.entity.reference_id;

        //console.log('razorpayoutrespo',payout_status);
        if (payout_status == "processed") {
            const orderID = txn_id;
            const txn = await Transaction.findById(orderID);


            if (txn.status != "SUCCESS" && txn.status != "FAILED") {

                const withdraw = await Temp.findOne({ txn_id: txn._id });

                const user = await User.findById(txn.User_id)
                txn.status = 'SUCCESS';
                txn.txn_msg = 'Withdraw Transaction is Successful';
                txn.referenceId = payout_id;

                if (user.withdraw_holdbalance == txn.amount) {
                    user.totalWithdrawl += txn.amount;
                    user.withdraw_holdbalance -= txn.amount;
                }

                await user.save();
                await txn.save();
                if (withdraw) {
                    withdraw.closing_balance = withdraw.closing_balance - withdraw.amount;
                    withdraw.status = 'SUCCESS';
                    await withdraw.save();
                }
            }

            res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
        }
        else if (payout_status == "reversed" || payout_status == "failed") {
            const orderID1 = txn_id;
            const txn1 = await Transaction.findById(orderID1);

            const user1 = await User.findById(txn1.User_id);

            const withdraw1 = await Temp.findOne({ txn_id: txn1._id });

            if (txn1.status != "SUCCESS" && txn1.status != "FAILED") {
                txn1.status = 'FAILED';
                txn1.txn_msg = req.body.payload.payout.entity.status_details.description;
                txn1.referenceId = payout_id;

                if (user1.withdraw_holdbalance == txn1.amount) {
                    user1.Wallet_balance += txn1.amount;
                    user1.withdrawAmount += txn1.amount;
                    user1.withdraw_holdbalance -= txn1.amount;
                }

                await user1.save();
                await txn1.save();
                if (withdraw1) {
                    withdraw1.closing_balance = withdraw1.closing_balance + withdraw1.amount;
                    withdraw1.status = 'FAILED';
                    await withdraw1.save();
                }


            }
            res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
        }
        else {
            res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
        }
    } else {
        res.status(200).json({ status: "ok", message: "response", responsecode: "200", data: null })
    }
})


module.exports = router