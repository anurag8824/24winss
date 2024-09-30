import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
// import deposits from "../../app/components/transaction/Deposits";
import css from "../css/Addcase.module.css";
import { Link } from 'react-router-dom';
//import Rightcontainer from "../Components/Rightcontainer";
import '../css/Loader.css'
import Swal from "sweetalert2";
// import findGif from "/";
import Header from "../Components/Header";

const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
const nodeMode = process.env.NODE_ENV;
if (nodeMode === "development") {
  var baseUrl = beckendLocalApiUrl;
} else {
  baseUrl = beckendLiveApiUrl;
}
const Addcase = ({ walletUpdate }) => {

  const history = useHistory();
  let method = useRef();
  let checkInterval;
  const [userAllData, setUserAllData] = useState();


  const [global, setGlobal] = useState(100);
  const [next, setNext] = useState(1);
  const [process, setProcess] = useState(false);
  const [isMobile, setMobile] = useState(false);
  
  const [WebSitesettings, setWebsiteSettings] = useState("");

  const fetchData = async () => {
        const response = await fetch(baseUrl + "settings/data");
        const data = await response.json();
        return setWebsiteSettings(data);
    }
    
    useEffect(() => {
        fetchData();
    }, [])
    
  const [isCashFreeActive, setCashFreeActive] = useState(false);
  const [isPhonePeActive, setPhonePeActive] = useState(false);
  const [isRazorPayActive, setRazorPayActive] = useState(false);
  const [isDecentroActive, setDecentroActive] = useState(false);
  const [isUpiGatewayActive, setUpiGatewayActive] = useState(false);
  const [isMypayActive, setIsMypayActive] = useState(false);

  const [isManualPaymentActive, setManualPaymentActive] = useState(false);
  const [isManualUPIQR, setManualUPIQR] = useState(false);
  const [isManualUPIid, setManualUPIid] = useState(false);

  const [RazorPayKey, setRazorPayKey] = useState(false);
  const [RazorPayAccountName, setAccountName] = useState('Skill Based Gaming');

  const [qrCode, setQrCode] = useState()
  const [walletOption, setWalletOption] = useState("airtel");
  const [bankCode, setBankCode] = useState(3003);

  const [account_mail_id, setAccount_mail_id] = useState();
  const [account_name, setAccount_name] = useState();
  const [accountPhone, setAccountPhone] = useState();

  const [scrnshot, setScrnshot] = useState(null);
  const [scrnshot1, setScrnshot1] = useState("");
  const [upiUtrNum, setupiUtrNum] = useState("");


  const handleChange = (e) => {
    setScrnshot1(URL.createObjectURL(e.target.files[0]))
    setScrnshot(e.target.files[0])
  }

  const ManualPayment = async (e) => {
    e.preventDefault();
    const access_token = localStorage.getItem('token')
    const headers = {
      Authorization: `Bearer ${access_token}`,
    }
    const formData = new FormData();

    formData.append("Transaction_Screenshot", scrnshot);
    formData.append("amount", global);
    formData.append("referenceId", upiUtrNum);

    const response = await axios.post(
      baseUrl + `manual/deposit/txn`,
      formData,
      { headers }
    );
    //console.log(response.data);
    if(response.data.status === 'Pending'){
      setTimeout(() => {
     
      axios.get(baseUrl+`manual/depositstatus/${response.data._id}`, { headers })
        .then((res) => {
          //console.log(res);
          const icon = res.data.status === "PAID" ? "success" : "danger";
          var title = '';
          if(res.data && res.data.status === "PAID"){
            title = "Deposit submited successfully";
          }else if(res.data && res.data.status === "Pending"){
            title = "Deposit Transaction in proccess.";
          }else if(!res.data.status){
            title = "Deposit Transaction Rejected Due to invalid UTR Number.";
          }

          history.push('/');
          setTimeout(() => {
            setProcess(false);
            Swal.fire({
              title: title,
              icon: icon,
              confirmButtonText: "OK",
            });
          }, 1000);
        })
      }, 30000);
      setProcess(true);
    }else{
          setProcess(false);
          Swal.fire({
            title: 'Deposit Falied',
            icon: 'danger',
            confirmButtonText: "OK",
          });
      }
  }


  //use for Mypayapi 
  const myPayDepositeUpi = (channel, method, upiMethod, phonepay) => {
    //account_name
    //account_mail_id
    //alert(account_name);
    //if(account_name && account_mail_id){

    setProcess(true);
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `user/depositeupiKVM`,
      { amount: global, channel: channel, payment_method: method, provider: walletOption, bankCode: bankCode, account_name: account_name, payment_gatway: phonepay,account_mail_id: account_mail_id },
      // { amount: global, channel: channel, payment_method: method, provider: walletOption, bankCode: bankCode, account_name: account_name, account_mail_id: account_mail_id,},
      
      { headers })
      .then((res) => {
        console.log(res.data.data.qrcodE_STRING);
        // console.log(res.data.mytoken);
        if (res.data.data.status === "SUCCESS") {

          // let order_id = res.data.txnID;
          // let order_token = res.data.data.decentroTxnId;
          //setProcess(false);
          window.open(res.data.data.qrcodE_STRING);
          setTimeout(() => {
            //checkdecentrodeposit(order_id, order_token)
            setProcess(false);
          }, 30000);

        } else {
          setProcess(false);
          Swal.fire({
            title: res.data.data.msg,
            icon: 'danger',
            confirmButtonText: "OK",
          });
        }

      }).catch((e) => {
        alert(e)
      })
    // }else{
    //   Swal.fire({
    //     title: 'Account holder name or Mail id is required',
    //     icon: 'danger',
    //     confirmButtonText: "OK",
    // });
    // }
  }

  const checkmypaydeposit = (order_id, order_token,mytoken) => {
    console.log(order_token);
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `mypaystatus/response`, { order_id, order_token,mytoken }, { headers })
      .then((res) => {

        const icon = res.data.status === "PAID" ? "success" : "danger";
        const title = res.data.status === "PAID" ? "Deposit submited successfully" : "Transaction under proccess or failed";

        if (res.data.status == 'Pending') {
          setTimeout(() => {
            checkmypaydeposit(order_id, order_token)
            Swal.fire({
              title: title,
              icon: icon,
              confirmButtonText: "OK",
            });
          }, 6000);
        } else {
          history.push('/');
          setTimeout(() => {
            Swal.fire({
              title: title,
              icon: icon,
              confirmButtonText: "OK",
            });
          }, 1000);
        }

      })
      .catch((e) => {
        if (e.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
        }
      })
  }



  //Function to load razorpay script for the display of razorpay payment SDK.
  function loadRazorpayScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  //function will get called when clicked on the pay button.
  async function displayRazorpayPaymentSdk(channel, method, upiMethod, razorpay) {
    const res = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. please check are you online?");
      return;
    }
    //setProcess(true);
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    // creating a new order and sending order ID to backend
    const response = await axios.post(baseUrl + `user/razorpay_order`, { amount: global, channel: channel, payment_method: method, provider: walletOption, bankCode: bankCode, account_name: account_name, payment_gatway: razorpay }, { headers });

    if (!response) {
      alert("Server error. please check are you onlin?");
      return;
    }

    //console.log(response.data.orderdata); 
    // Getting the order details back
    let order_id = response.data.txnID;
    let order_token = response.data.orderdata.id;
    const data = response.data.orderdata;
    const options = {
      key: RazorPayKey,
      name: RazorPayAccountName,
      description: "Skill Based Game Tournament",
      order_id: data.id,
      prefill: {
        "name": account_name,
        "email": account_mail_id,
        "contact": accountPhone
      },
      handler: async (response) => {
        //console.log(response)
        try {
          const paymentId = response.razorpay_payment_id;

          //const url = baseUrl+`rozarpay/capture/${paymentId}`;
          //const captureResponse = await axios.post(url, {},{headers})
          //console.log(captureResponse.data);
          checkrazorpaydeposit(order_id, order_token, 'SUCCESS', paymentId);
        } catch (err) {
          checkrazorpaydeposit(order_id, order_token, 'FAILED');
          console.log(err);
        }
      },
      theme: {
        color: "#686CFD",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  const checkrazorpaydeposit = (order_id, order_token, order_status, paymentId) => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `razorpaydesposit/response`, { order_id, order_token, order_status, paymentId }, { headers })
      .then((res) => {
        const icon = res.data.status === "PAID" ? "success" : "danger";
        const title = res.data.status === "PAID" ? "Deposit submited successfully" : "Transaction Failed";
        history.push('/');
        setTimeout(() => {
          Swal.fire({
            title: title,
            icon: icon,
            confirmButtonText: "OK",
          });
        }, 1000);

      })
      .catch((e) => {
        if (e.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
        }
      })
  }

  //use for decentrodepositeupi 
  const decentroDepositeUpi = (channel, method, upiMethod, decentropay) => {
    //account_name
    //account_mail_id
    //alert(account_name);
    //if(account_name && account_mail_id){

    setProcess(true);
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `user/decentrodepositeupi`,
      { amount: global, channel: channel, payment_method: method, provider: walletOption, bankCode: bankCode, account_name: account_name, payment_gatway: decentropay },
      { headers })
      .then((res) => {
        console.log(res);
        if (res.data.data.status === "SUCCESS") {

          let order_id = res.data.txnID;
          let order_token = res.data.data.decentroTxnId;
          //setProcess(false);
          window.open(res.data.data.data.generatedLink);
          setTimeout(() => {
            //checkdecentrodeposit(order_id, order_token)
            setProcess(false);
          }, 30000);

        } else {
          setProcess(false);
          Swal.fire({
            title: res.data.data.msg,
            icon: 'danger',
            confirmButtonText: "OK",
          });
        }

      }).catch((e) => {
        alert(e)
      })
    // }else{
    //   Swal.fire({
    //     title: 'Account holder name or Mail id is required',
    //     icon: 'danger',
    //     confirmButtonText: "OK",
    // });
    // }
  }



  //use for decentrodepositeupi 
  const phonePeDepositeUpi = (channel, method, upiMethod, phonepay) => {
    //account_name
    //account_mail_id
    //alert(account_name);
    //if(account_name && account_mail_id){

    setProcess(true);
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `user/phonedepositeapi`,
      { amount: global, channel: channel, payment_method: method, provider: walletOption, bankCode: bankCode, account_name: account_name, payment_gatway: phonepay },
      { headers })
      .then((res) => {
        // console.log(res.data.data.data.instrumentResponse.redirectInfo.url);
        // console.log(res.data.data.data.transactionId);
        // console.log(res.data.txnID);
        if (res.data.data.success === true) {

          let order_id = res.data.txnID;
          let order_token = res.data.data.data.transactionId;
          //setProcess(false);
          window.open(res.data.data.data.instrumentResponse.redirectInfo.url);
          setTimeout(() => {
            checkphonepedeposit(order_id, order_token)
            //history.push('/');
            setProcess(false);
          }, 30000);

        } else {
          setProcess(false);
          Swal.fire({
            title: res.data.data.msg,
            icon: 'danger',
            confirmButtonText: "OK",
          });
        }

      }).catch((e) => {
        alert(e)
      })
    // }else{
    //   Swal.fire({
    //     title: 'Account holder name or Mail id is required',
    //     icon: 'danger',
    //     confirmButtonText: "OK",
    // });
    // }
  }

  const checkphonepedeposit = (order_id, order_token) => {
    console.log(order_token);
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `phonepestatus/response`, { order_id, order_token }, { headers })
      .then((res) => {

        const icon = res.data.status === "PAID" ? "success" : "danger";
        const title = res.data.status === "PAID" ? "Deposit submited successfully" : "Transaction in failed";

        if (res.data.status == 'Pending') {
          setTimeout(() => {
            checkphonepedeposit(order_id, order_token)
            Swal.fire({
              title: title,
              icon: icon,
              confirmButtonText: "OK",
            });
          }, 6000);
        } else {
          history.push('/');
          setTimeout(() => {
            Swal.fire({
              title: title,
              icon: icon,
              confirmButtonText: "OK",
            });
          }, 1000);
        }

      })
      .catch((e) => {
        if (e.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
        }
      })
  }


  //Function to load pinelab script for the display of pinelab payment SDK.
  // function loadPinelabScript(src) {
  //   return new Promise((resolve) => {
  //     const script = document.createElement("script");
  //     script.src = src;
  //     script.onload = () => {
  //       resolve(true);
  //     };
  //     script.onerror = () => {
  //       resolve(false);
  //     };
  //     document.body.appendChild(script);
  //   });
  // }

  //function will get called when clicked on the pay button.
  // async function displayPinelabFrame(channel, method, upiMethod, Phonepe) {
  //   const res2 = await loadPinelabScript(
  //     "https://checkout.pluralonline.com/v1/web-sdk-checkout.js"
  //   );

  //   if (!res2) {
  //     alert("Pinelab SDK failed to load. please check are you online?");
  //     return;
  //   }
  //   //setProcess(true);
  //   const access_token = localStorage.getItem("token")
  //   const headers = {
  //     Authorization: `Bearer ${access_token}`
  //   }
  //   // creating a new order and sending order ID to backend
  //   const response = await axios.post(baseUrl + `user/pinelab_order`, { amount: global, channel: channel, payment_method: method, provider: walletOption, bankCode: bankCode, account_name: account_name, payment_gatway: pinelab }, { headers });

  //   if (!response) {
  //     alert("Server error. please check are you onlin?");
  //     return;
  //   }

  //   console.log(response.data);
  //   // Getting the order details back
  //   let order_id = response.data.txnID;
  //   let order_token = response.data.orderdata.token;
  //   const data = response.data.orderdata;

  //   const options = {
  //     theme: "default", // "default" or "black"
  //     orderToken: order_token,
  //     channelId: "WEB", // "APP" or "WEB"
  //     paymentMode: 'CREDIT_DEBIT,NETBANKING,UPI,WALLET,EMI,DEBIT_EMI',// comma separated - Example - 'CREDIT_DEBIT,NETBANKING,UPI,WALLET,EMI,DEBIT_EMI'
  //     countryCode: "91",// type = string, default "91"
  //     mobileNumber: accountPhone, // type = string, default = null
  //     emailId: account_mail_id, //default null
  //     showSavedCardsFeature: false, // type = boolean, default = true
  //     successHandler: async function (response) {
  //       console.log(response)
  //       // Handle success response
  //       const payment_id = response.payment_id
  //       const plural_order_id = response.plural_order_id
  //       checkpinelabdeposit(order_id, plural_order_id, 'SUCCESS', payment_id)
  //     },
  //     failedHandler: async function (response) {
  //       console.log(response)
  //       // Handle failure response
  //       //error_code: "401"
  //       //error_message: "Something went wrong"
  //       const payment_id = response.payment_id
  //       checkpinelabdeposit(order_id, order_token, 'FAILED', payment_id)
  //     }
  //   };
  //   const plural = new window.Plural(options);
  //   plural.open(options);
  // }


  // const checkpinelabdeposit = (order_id, order_token, order_status, paymentId) => {

  //   const access_token = localStorage.getItem("token")
  //   const headers = {
  //     Authorization: `Bearer ${access_token}`
  //   }
  //   axios.post(baseUrl + `pinelabdesposit/response`, { order_id, order_token, order_status, paymentId }, { headers })
  //     .then((res) => {
  //       const icon = res.data.status === "PAID" ? "success" : "danger";
  //       const title = res.data.status === "PAID" ? "Deposit submited successfully" : "Transaction Failed";
  //       history.push('/');
  //       setTimeout(() => {
  //         Swal.fire({
  //           title: title,
  //           icon: icon,
  //           confirmButtonText: "OK",
  //         });
  //       }, 1000);

  //     })
  //     .catch((e) => {
  //       if (e.response.status === 401) {
  //         localStorage.removeItem('token');
  //         localStorage.removeItem('token');
  //         window.location.reload()
  //       }
  //     })
  // }


  //use for upigatway 
  const depositUpiGateway = (channel, method, upiMethod, upigateway) => {
    //account_name
    //account_mail_id
    //alert(account_name);
    //if(account_name && account_mail_id){

    setProcess(true);
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl+`user/depositeupi`,
      { amount: global, channel: channel, payment_method: method, provider: walletOption, bankCode: bankCode, account_name: account_name, account_mail_id: account_mail_id, payment_gatway: upigateway },
      { headers })
      .then((res) => {
        if (res.data.data.status) {
          // console.log(res.data.data.data.payment_url)
          // console.log(res.data.data.data.order_id)
          let order_id = res.data.txnID;
          let order_token = res.data.data.data.order_id;
          //setProcess(false);
          window.open(res.data.data.data.payment_url);
          setTimeout(() => {
            checkupideposit(order_id, order_token)
            setProcess(false);
          }, 30000);

        } else {
          setProcess(false);
          Swal.fire({
            title: res.data.data.msg,
            icon: 'danger',
            confirmButtonText: "OK",
          });
        }
      }).catch((e) => {
        alert(e)
      })
    // }else{
    //   Swal.fire({
    //     title: 'Account holder name or Mail id is required',
    //     icon: 'danger',
    //     confirmButtonText: "OK",
    // });
    // }
  }


  const checkupideposit = (order_id, order_token) => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `depositupipay/response`, { order_id, order_token }, { headers })
      .then((res) => {
        const icon = res.data.status === "PAID" ? "success" : "danger";
        const title = res.data.status === "PAID" ? "Deposit submited successfully" : "Transaction Failed";
        history.push('/');
        setTimeout(() => {
          Swal.fire({
            title: title,
            icon: icon,
            confirmButtonText: "OK",
          });
        }, 1000);

      })
      .catch((e) => {
        if (e.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
        }
      })
  }





  //use for cashfree gatway
  const deposit = (channel, method, upiMethod) => {
    setProcess(true);
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `user/deposite`,
      { amount: global, channel: channel, payment_method: method, provider: walletOption, bankCode: bankCode },
      { headers })
      .then((res) => {
        if (res.data.data.payment_method === "app") {
          window.location.href = res.data.data.data.url;
          checkInterval = setInterval((ID) => {
            checkout(ID);
          }, 10000, res.data.txnID);
        }
        else if (res.data.data.payment_method === "netbanking") {
          window.location.href = res.data.data.data.url;
          checkInterval = setInterval((ID) => {
            checkout(ID);
          }, 10000, res.data.txnID);
        }
        else if (res.data.data.channel === 'link' && res.data.data.payment_method === "upi") {
          checkInterval = setInterval((ID) => {
            checkout(ID);
          }, 10000, res.data.txnID);
          window.location.href = res.data.data.data.payload[upiMethod];
        }
        else if (res.data.data.channel === 'qrcode' && res.data.data.payment_method === "upi") {
          setQrCode(res.data.data.data.payload.qrcode)
          setProcess(false)
          setNext(3);
          checkInterval = setInterval((ID) => {
            checkout(ID);
          }, 10000, res.data.txnID);
        }
      }).catch((e) => {
        alert(e)
      })
  }

  const checkout = (paymentID) => {
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `checkout/deposite/txn`,
      { txnID: paymentID },
      { headers })
      .then((res) => {
        // alert(res.data.txnStatus)
        if (res.data.txnStatus === 'PAID') {
          walletUpdate();
          clearInterval(checkInterval);
          Swal.fire({
            title: res.data.msg,
            icon: 'success',
            confirmButtonText: "OK",
          });
          setProcess(false);
          setNext(1)
        }
        else if (res.data.txnStatus === 'FAILED') {
          walletUpdate();
          clearInterval(checkInterval);
          Swal.fire({
            title: res.data.msg,
            icon: 'error',
            confirmButtonText: "OK",
          });
          setProcess(false);
          setNext(1);
        }
        // else if(res.data.txnStatus!="PENDING")
        // {
        //     clearInterval(checkInterval);
        //     Swal.fire({
        //       title: res.data.msg,
        //       icon: 'info',
        //       confirmButtonText: "OK",
        //   });
        // }

      }).catch((e) => {
        console.log(e)
      })
  }

  useEffect(() => {

    let access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.get(baseUrl + `me`, { headers })
      .then((res) => {
        setUserAllData(res.data);
        setAccount_mail_id(res.data.Email)
        setAccount_name(res.data.holder_name);
        setAccountPhone(res.data.Phone);
      }).catch((e) => {
        if (e.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
          history.push("/login")
        }
      })

    axios.get(baseUrl + `website/setting`)
      .then((res) => {
        //console.log(res);
        setCashFreeActive(res.data.isCashFreeActive)
        setRazorPayActive(res.data.isRazorPayActive)
        setDecentroActive(res.data.isDecentroActive)
        setPhonePeActive(res.data.isPhonePeActive)
        setRazorPayKey(res.data.RazorPayKey)
        setAccountName(res.data.AccountName)
        setManualPaymentActive(res.data.isManualPaymentActive)
        setUpiGatewayActive(res.data.isUpiGatewayActive)
        setIsMypayActive(res.data.isMypayActive)
        setManualUPIQR(res.data.isManualUPIQR)
        setManualUPIid(res.data.isManualUPIid)
      }).catch((e) => {
        setCashFreeActive(false)
        setRazorPayActive(false)
        setDecentroActive(false)
        setPhonePeActive(false)
        setRazorPayKey(false)
        setManualPaymentActive(false)
        setManualUPIQR(false)
        setIsMypayActive(false)
        setUpiGatewayActive(false)
        setManualUPIid(false)
        setAccountName('Skill Based Gaming')
      })


    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      setMobile(true);
    }
  }, [])
  
const copyCode = (e) => {
    // console.log(Game.Room_code);
    navigator.clipboard.writeText(isManualUPIid);

    Swal.fire({
      position: 'center',
      icon: 'success',
      type: 'success',
      title: 'UPI ID  Copied',
      showConfirmButton: false,
      timer: 1200,
    

    });

  }

  return (
    <>



      <Header user={userAllData} />
      {//userAllData && userAllData.verified === 'verified' && 
        <div className="leftContainer add_cash_container" style={{ minHeight: '100vh', height: '100%', paddingBottom: '20rem'}}>
          {/* Add Cash Via QR Code */}
          {/* <div className="px-4  py-5">
            <div className="Addcase_refer_footer__DHnd7">
              <div className="d-grid gap-2 col-12 mx-auto">
                <a href="https://api.whatsapp.com/send?phone=911232342342" target="__blank">Upload Payment Screenshot</a>
              </div>
            </div>
            <div className="pb-3">
              <div className="MultiFormControl_root mt-4 MuiFormControl-fullWidth">
                <div 
                  style={{
                    backgroundColor: "#fafafa",
                    border: "1px solid #e0e0e0",
                    borderRadius: "7px",
                  }}
                > 
                    <img
                      width="370px"
                      src="log-upi.jpeg"
                      alt=""
                      style={{
                        marginLeft: "7px",
                        paddingBottom: "10px",
                        paddingLeft: "3px",
                        paddingTop: "5px",
                      }}
                    /> 
                  
                </div>
            </div>
            </div>
          </div> */}
            <br></br>
          {Boolean(!process) && <div>
            {Boolean(next === 1) && <div className="px-4  py-5">
              <div className={`${css.games_section}`}>
                <div className="d-flex position-relative align-items-center">
              
                  <div className={`${css.games_section_title}`}>
                    Choose Amount to Add
                  </div>
                </div>
              </div>
              <div className="pb-3">
                <div className="MultiFormControl_root mt-4 MuiFormControl-fullWidth">
                  <div className="MuiFormControl_root MuiTextField-root">
                    <label
                      className={`${css.MuiFormLabel_root} MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink`}
                      data-shrink="true"
                      style={{ fontSize: "1.5rem", fontWeight: "500", fontFamily: "Poppins" }} 
                    >
                      Enter Amount
                    </label>
                    <div className="MuiInputBase-root MuiInput-root MuiInput_underline jss58 MuiInputBase-formControl MuiInput-formControl MuiInputBase-adornedStart">
                      <div className="MuiInputAdornment-root MuiInputAdornment-positionStart d-flex w-100">
                        <div className="MuiInputAdornment-root MuiInputAdornment-positionStart d-flex align-items-center">
                          <p className="MuiTypography-root MuiTypography-body1 MuiTypography-colorTextSecondary"  style={{fontSize: "2rem"}}>₹</p>
                        </div>
                        <input
                          className={`w3-input input ${css.collapseCard_title} border-bottom text-dark `}
                          type="tel"
                          id="amountInput"
                          style={{ width: "100%", fontSize: '2em', background: 'transparent'}}
                          value={`${global}`}
                          onChange={(e) => { (e.target.value > 0) ? (e.target.value <= 10000) ? setGlobal(parseInt(e.target.value)) : (setGlobal(10000)) : (e.target.value < 0) ? setGlobal(10) : setGlobal(0) }}
                        ></input>
                      </div>
                    </div>
                    <span className="MuiFormHelperText-root" style={{ display: 'block',  fontSize: '1.2rem', padding: '0rem 0.5rem 1rem'}}>Min: 10, Max: 10000</span>
                  </div>
                </div>
                <div className={`${css.games_window}`}>
                  <div
                    className={`${css.gameCard_container}`}
                    onClick={() => {
                      // console.log(100);
                      setGlobal(100);
                    }}
                  >
                    <div className={`${css.add_fund_box}`}>
                      <div style={{ display: "flex", alignItems: "baseline"}}>
                        <div
                          className={`${css.collapseCard_title} mr-1`}
                          style={{ fontSize: "0.9em", color: "#ffffff"  }}
                        >
                          ₹
                        </div>
                        <div
                          className={`${css.collapseCard_title}`}
                          style={{ fontSize: "1.5em" }}
                        >
                          100
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${css.gameCard_container}`}
                    onClick={() => {
                      // console.log(250);
                      setGlobal(250);
                    }}
                  >
                    <div className={`${css.add_fund_box}`}>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <div
                          className={`${css.collapseCard_title} mr-1`}
                          style={{ fontSize: "0.9em" }}
                        >
                          ₹
                        </div>
                        <div
                          className={`${css.collapseCard_title}`}
                          style={{ fontSize: "1.5em" }}
                        >
                          250
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${css.gameCard_container}`}
                    onClick={() => {
                      // console.log(500);
                      setGlobal(500);
                    }}
                  >
                    <div className={`${css.add_fund_box}`}>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <div
                          className={`${css.collapseCard_title} mr-1`}
                          style={{ fontSize: "0.9em" }}
                        >
                          ₹
                        </div>
                        <div
                          className={`${css.collapseCard_title}`}
                          style={{ fontSize: "1.5em" }}
                        >
                          500
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${css.gameCard_container}`}
                    onClick={() => {
                      // console.log(1000);
                      setGlobal(1000);
                    }}
                  >
                    <div className={`${css.add_fund_box}`}>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <div
                          className={`${css.collapseCard_title} mr-1`}
                          style={{ fontSize: "0.9em" }}
                        >
                          ₹
                        </div>
                        <div
                          className={`${css.collapseCard_title}`}
                          style={{ fontSize: "1.5em" }}
                        >
                          1000
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${css.refer_footer}`}>
                <div className="d-grid gap-2 col-12 mx-auto">

                  <button type="button" className="Addcase_block__plP2y bg-primary rounded text-white font-weight-bold text-uppercase" onClick={() => { (global >= 10) ? setNext(2) : alert('Minimum deposit is 10') }}>Next</button>

                </div>
              </div>
            </div>}


            {Boolean(next === 2) && <div style={{padding: '1rem'}}>
              <div className="pb-3">
                <div className={`${css.games_section}`}>
                  <div className="d-flex position-relative align-items-center justify-content-between">
                    <div className={`${css.games_section_title}`} style={{ fontSize: '1.1em' }}>
                      Amount to be added ₹<span>{global}</span>
                    </div>
                    <button type="button" onClick={() => setNext(1)} className="btn btn-info font-weight-bold text-uppercase px-3 py-1 bg-white" style={{color: '#000051', border:'none', fontSize: '1rem'}}>Edit</button>
                  </div>
                </div>
              </div>
               <div style={{ "background": "rgb(241, 241, 241)", "width": "100%", "height": "10px", "position": "absolute", "left": "0", "right": "0" }}></div>
              <div className="d-flex flex-column">
                {/*<div className="games-section-title"
                style={{color: '#000000'}}>Pay Through UPI</div>*/}

              {/* Boolean(isUpiGatewayActive) &&
              <div>
              <label htmlFor="username " className="mr-5">
                  <i className="far fa-bank mr-2"></i>Account holder name
                </label>
                <div className="col-12 mb-3 p-0">
                  <input
                    type="text"
                    className="form-control"
                    id="account_name"
                    placeholder="Enter Account Name"
                    name="acname"
                    value={account_name}
                    onChange={(e) => setAccount_name(e.target.value)}
                    required
                  />
                </div>

                <label htmlFor="username " className="mr-5">
                  <i className="far fa-bank mr-2"></i>Enter Your Mail ID
                </label>
                <div className="col-12 mb-3 p-0">
                  <input
                    type="text"
                    className="form-control"
                    id="account_mail_id"
                    placeholder="Enter Your Mail ID"
                    name="mailid"
                    value={account_mail_id}
                    onChange={(e) => setAccount_mail_id(e.target.value)}
                    required
                  />
                </div>
                  </div> */}
                

              {Boolean(isUpiGatewayActive) &&
              <div onClick={() => { method.current = 'upipay'; depositUpiGateway("link","upi",'upipay','upigateway') }}
                    className="add-fund-box upi_container" style={{ paddingTop: "0px", height: "60px" }}>
                  <div
                    className="d-flex align-items-center"
                    style={{
                      backgroundColor: "#fafafa",
                      border: "1px solid #e0e0e0",
                      borderRadius: "7px",
                    }}
                  >
                    <div
                      className="d-flex align-items-center"
                      style={{ height: "60px", display: "flex", textAlign: "center" }}
                    >
                      <img
                        width="40px"
                        src="UPI.png"
                        alt=""
                        style={{
                          marginLeft: "7px",
                          paddingBottom: "10px",
                          paddingLeft: "3px",
                          paddingTop: "5px",
                        }}
                      />
                    </div>
                    <div className="d-flex justify-content-center flex-column ml-4">
                      <div className="jss30">
                        <strong>Paynow</strong>
                      </div>
                      <div className="jss31"></div>
                    </div>
                  </div>
                  
                </div> }

                

                {Boolean(isRazorPayActive) &&
                  <div
                    onClick={() => { method.current = 'upipay'; displayRazorpayPaymentSdk("link", "upi", 'upipay', 'razorpay') }}
                    className="add-fund-box mt-3" style={{ paddingTop: "0px", height: "60px" }}>
                    <div
                      className="d-flex align-items-center"
                      style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #e0e0e0",
                        borderRadius: "7px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center"
                        style={{ height: "60px", display: "flex", textAlign: "center" }}
                      >
                        <img
                          width="40px"
                          src="UPI.png"
                          alt=""
                          style={{
                            marginLeft: "7px",
                            paddingBottom: "10px",
                            paddingLeft: "3px",
                            paddingTop: "5px",
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-center flex-column ml-4">
                        <div className="jss30">
                          <strong>Deposit Here</strong>
                        </div>
                        <div className="jss31"></div>
                      </div>
                    </div>

                  </div>}
                  
                  
                {Boolean(isMypayActive) &&
                  <div
                    onClick={() => { method.current = 'upipay'; myPayDepositeUpi("link", "upi", 'upipay', 'mypayapi') }}
                    className="add-fund-box mt-3" style={{ paddingTop: "0px", height: "60px" }}>
                    <div
                      className="d-flex align-items-center"
                      style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #e0e0e0",
                        borderRadius: "7px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center"
                        style={{ height: "60px", display: "flex", textAlign: "center" }}
                      >
                        <img
                          width="40px"
                          src="UPI.png"
                          alt=""
                          style={{
                            marginLeft: "7px",
                            paddingBottom: "10px",
                            paddingLeft: "3px",
                            paddingTop: "5px",
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-center flex-column ml-4">
                        <div className="jss30">
                          <strong>Add Wallet (K)</strong>
                        </div>
                        <div className="jss31"></div>
                      </div>
                    </div>

                  </div>}

                {Boolean(isPhonePeActive) &&
                  <div
                    onClick={() => { method.current = 'upipay'; phonePeDepositeUpi("link", "upi", 'upipay', 'Phonepe') }}
                    className="add-fund-box mt-3" style={{ paddingTop: "0px", height: "60px" }}>
                    <div
                      className="d-flex align-items-center"
                      style={{
                        background: "var(--main-bg)",
                        border: "1px solid #e0e0e0",
                        borderRadius: "7px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center"
                        style={{ height: "60px", display: "flex", textAlign: "center" }}
                      >
                        <img
                          height="50px"
                          src="Images/kd_ludo/phonepay.png"
                          alt=""
                          style={{
                            marginLeft: "7px",
                            paddingBottom: "10px",
                            paddingLeft: "0.5rem",
                            paddingTop: "0.5rem",
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-center flex-column " >
                        <div className="jss30">
                          <strong style={{color: '#ffffff', fontSize: '1.5rem', paddingLeft: '1rem'}}>Deposit</strong>
                        </div>
                        <div className="jss31"></div>
                      </div>
                    </div>

                  </div>}

                {Boolean(isDecentroActive) &&
                  <div
                    onClick={() => { method.current = 'upipay'; decentroDepositeUpi("link", "upi", 'upipay', 'decentropay') }}
                    className="add-fund-box mt-3" style={{ paddingTop: "0px", height: "60px" }}>
                    <div
                      className="d-flex align-items-center"
                      style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #e0e0e0",
                        borderRadius: "7px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center"
                        style={{ height: "60px", display: "flex", textAlign: "center" }}
                      >
                        <img
                          width="40px"
                          src="UPI.png"
                          alt=""
                          style={{
                            marginLeft: "7px",
                            paddingBottom: "10px",
                            paddingLeft: "3px",
                            paddingTop: "5px",
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-center flex-column ml-4 mb-5">
                        <div className="jss30">
                          <strong>Desposit Now</strong>
                        </div>
                        <div className="jss31"></div>
                      </div>
                    </div>


                  </div>}


                  {Boolean(isManualPaymentActive) &&
                  <div className="m-2">
                  
                  <div className={`refferal_code text-center`}>
                  Copy UPI ID: {isManualUPIid}
                  
    
    
                  <i class="fa-solid fa-paste" onClick={(e) => copyCode(e)}></i>
                </div>
            
                  
                    <img
                      src={baseUrl + isManualUPIQR}
                      style={{ width: "100%", }} alt="img"
                    />
                  </div>
                }
                {Boolean(isManualPaymentActive) &&

                  <form
                    onSubmit={ManualPayment}
                    method="POST"
                    encType="multipart/form-data"
                  >

                <label htmlFor="username " className="mr-5">
                  <i className="far fa-bank mr-2"></i>Enter UTR Number
                </label>
                <div className="col-12 mb-3 p-0">
                  <input
                    type="text"
                    className="form-control"
                    id="referenceId"
                    placeholder="Enter UTR Number"
                    name="referenceId"
                    value={upiUtrNum}
                    onChange={(e) => setupiUtrNum(e.target.value)}
                    required
                  />
                </div>

                    <div className="add-fund-box mt-3" style={{ paddingTop: "0px", height: "60px" }}>
                      <div className="d-flex align-items-center"
                        style={{
                          backgroundColor: "#fafafa",
                          border: "1px solid #e0e0e0",
                          borderRadius: "7px",
                        }} >

                        
                        <div className="d-flex align-items-center" style={{   textAlign: "center" }} >
                          <img width="40px"src="UPI.png"alt=""style={{marginLeft: "7px",paddingBottom: "10px",paddingLeft: "3px",paddingTop: "5px",}} />
                        </div>
                        <div className="d-flex justify-content-center flex-column ml-4">
                          <div className="jss30">
                            <strong>Upload Screenshot</strong>
                          </div>
                          <div className="jss31">
                            <input type="file" name="Screenshot" onChange={handleChange} accept="image/*"  />
                          </div>
                        </div>
                      </div>
                      
                    </div>

                    <div className=" m-2 text-center">
                      <button type="submit" className="btn btn-success">Submit</button>
                    </div>

                    <div style={{ width: "100%", height:"400px" }}>
                        <img src={scrnshot1} style={{ width: "100%" }} />
                      </div>
                  </form>}


                {Boolean(isMobile) && Boolean(isCashFreeActive) && <div>
                  <div
                    onClick={() => { method.current = 'gpay'; deposit("link", "upi", 'gpay') }}
                    className="add-fund-box mt-3" style={{ paddingTop: "0px", height: "60px" }}>
                    <div
                      className="d-flex align-items-center"
                      style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #e0e0e0",
                        borderRadius: "7px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center"
                        style={{ height: "60px", display: "flex", textAlign: "center" }}
                      >
                        <img
                          width="40px"
                          src="gpay-logo.png"
                          alt=""
                          style={{
                            marginLeft: "7px",
                            paddingBottom: "10px",
                            paddingLeft: "3px",
                            paddingTop: "5px",
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-center flex-column ml-4">
                        <div className="jss30">
                          <strong>G-Pay</strong>
                        </div>
                        <div className="jss31"></div>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => { method.current = 'phonepe'; deposit("link", "upi", "phonepe") }}
                    className="add-fund-box mt-3" style={{ paddingTop: "0px", height: "60px" }}>
                    <div
                      className="d-flex align-items-center"
                      style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #e0e0e0",
                        borderRadius: "7px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center"
                        style={{ height: "60px", display: "flex", textAlign: "center" }}
                      >
                        <img
                          width="40px"
                          src="/phonepe-logo.png"
                          alt=""
                          style={{
                            marginLeft: "7px",
                            paddingBottom: "10px",
                            paddingLeft: "3px",
                            paddingTop: "5px",
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-center flex-column ml-4">
                        <div className="jss30">
                          <strong>PhonePe</strong>
                        </div>
                        <div className="jss31"></div>
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => { method.current = 'paytm'; deposit("link", "upi", "paytm") }}
                    className="add-fund-box mt-3" style={{ paddingTop: "0px", height: "60px" }}>
                    <div
                      className="d-flex align-items-center"
                      style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #e0e0e0",
                        borderRadius: "7px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center"
                        style={{ height: "60px", display: "flex", textAlign: "center" }}
                      >
                        <img
                          width="40px"
                          src="/paytm-logo.png"
                          alt=""
                          style={{
                            marginLeft: "7px",
                            paddingBottom: "10px",
                            paddingLeft: "3px",
                            paddingTop: "5px",
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-center flex-column ml-4">
                        <div className="jss30">
                          <strong>Paytm UPI</strong>
                        </div>
                        <div className="jss31"></div>
                      </div>
                    </div>
                  </div>
                </div>}
                {Boolean(!isMobile) && Boolean(isCashFreeActive) && <div className="add-fund-box mt-3"
                  onClick={() => { deposit("qrcode", "upi") }}
                  style={{ paddingTop: "0px", height: "60px" }}>
                  <div
                    className="d-flex align-items-center"
                    style={{
                      backgroundColor: "#fafafa",
                      border: "1px solid #e0e0e0",
                      borderRadius: "7px",
                    }}
                  >
                    <div className="d-flex align-items-center" style={{ height: "60px" }}>
                      <img
                        width="45px"
                        src="/qr-scan.png"
                        alt=""
                        style={{
                          marginLeft: "7px",
                          paddingLeft: "3px",
                        }}
                      />
                    </div>
                    <div className="d-flex justify-content-center flex-column ml-4">
                      <div className="jss30">
                        <strong>Scan QR Code</strong>
                      </div>
                      <div className="jss31"></div>
                    </div>
                  </div>
                </div>
                }
                {Boolean(isCashFreeActive) &&
                  <div className="games-section-title mt-3">Other Options</div>}

                {Boolean(isCashFreeActive) &&
                  <div className="add-fund-box mt-3" onClick={() => { setNext(4) }} style={{ paddingTop: "0px", height: "60px" }}>
                    <div
                      className="d-flex align-items-center"
                      style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #e0e0e0",
                        borderRadius: "7px",
                      }}
                    >
                      <div className="d-flex align-items-center" style={{ height: "60px" }}>
                        <img
                          width="45px"
                          src="all-wallets.png"
                          alt=""
                          style={{
                            marginLeft: "7px",
                            paddingBottom: "10px",
                            paddingLeft: "3px",
                            paddingTop: "5px",
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-center flex-column ml-4">
                        <div className="jss30">
                          <strong>Other Wallets</strong>
                        </div>
                        <div className="jss31"></div>
                      </div>
                    </div>
                  </div>}
                {Boolean(isCashFreeActive) &&
                  <div className="add-fund-box mt-3" onClick={() => { setNext(5) }} style={{ paddingTop: "0px", height: "60px" }}>
                    <div
                      className="d-flex align-items-center"
                      style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #e0e0e0",
                        borderRadius: "7px",
                      }}
                    >
                      <div className="d-flex align-items-center" style={{ height: "60px" }}>
                        <img
                          width="45px"
                          src="/bank1.png"
                          alt=""
                          style={{
                            marginLeft: "7px",
                            paddingBottom: "10px",
                            paddingLeft: "3px",
                            paddingTop: "5px",
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-center flex-column ml-4">
                        <div className="jss30">
                          <strong>Net Banking</strong>
                        </div>
                        <div className="jss31"></div>
                      </div>
                    </div>
                  </div>}

              </div>
            </div>}
          </div>}
          {Boolean(next === 3) && <div className="d-flex justify-content-center align-items-center mt-5">
            <img src={qrCode} alt="img" />
          </div>
          }
          {Boolean(next === 4) && <div className="px-4 py-3">
            <div className="pb-3">
              <div className={`${css.games_section}`}>
                <div className="d-flex position-relative align-items-center justify-content-between">
                  <div className={`${css.games_section_title}`} style={{ fontSize: '1.1em' }}>
                    Amount to be added ₹<span>{global}</span>
                  </div>
                  <button type="button" onClick={() => setNext(1)} className="btn btn-info text-white font-weight-bold text-uppercase px-2 py-1">Edit</button>
                </div>
              </div>
            </div>
            <div style={{ "background": "rgb(241, 241, 241)", "width": "100%", "height": "10px", "position": "absolute", "left": "0", "right": "0" }}></div>
            <div className="d-flex flex-column mt-4">
              <div className="games-section-title">Pay Through</div>
              <div className="add-fund-box mt-3" style={{ paddingTop: "0px", height: "60px" }}>
                <div
                  className="d-flex align-items-center"
                  style={{
                    backgroundColor: "#fafafa",
                    border: "1px solid #e0e0e0",
                    borderRadius: "7px",
                  }}
                >
                  <div className="d-flex align-items-center" style={{ height: "60px" }}>
                    <img
                      width="45px"
                      src="all-wallets.png"
                      alt=""
                      style={{
                        marginLeft: "7px",
                        paddingLeft: "3px",
                      }}
                    />
                  </div>
                  <div className="d-flex justify-content-center flex-column ml-4">
                    <div className="jss30">
                      <strong>Other Wallets</strong>
                    </div>
                    <div className="jss31"></div>
                  </div>
                  <div className="d-flex justify-content-center ml-auto mr-3">
                    <button type="button" onClick={() => setNext(2)} className="btn btn-info text-white font-weight-bold text-uppercase px-2 py-1">Edit</button>
                  </div>
                </div>
              </div>
            </div>
            <select className="form-control mt-4" style={{ "border": "1px solid rgb(224, 224, 224)", "outline": "none", "borderRadius": "5px", "background": "rgb(250, 250, 250)", "height": "3rem" }} onChange={(e) => { setWalletOption(e.target.value) }} >
              <option value="airtel">Airtel Money</option>
              <option value="freecharge">Freecharge</option>
              <option value="mobikwik">Mobikwik</option>
              <option value="ola">Ola Money</option>
              <option value="jio">Reliance Jio Money</option>
            </select>
            <div className={`${css.refer_footer}`}>
              <div className="d-grid gap-2 col-12 mx-auto">

                <button type="button" className={`${css.block} bg-primary rounded text-white font-weight-bold text-uppercase`} onClick={() => { deposit("link", "app") }}>Add</button>

              </div>
            </div>
          </div>
          }
          {Boolean(next === 5) && <div className="px-4 py-3">
            <div className="pb-3">
              <div className={`${css.games_section}`}>
                <div className="d-flex position-relative align-items-center justify-content-between">
                  <div className={`${css.games_section_title}`} style={{ fontSize: '1.1em' }}>
                    Amount to be added ₹<span>{global}</span>
                  </div>
                  <button type="button" onClick={() => setNext(1)} className="btn btn-info text-white font-weight-bold text-uppercase px-2 py-1">Edit</button>
                </div>
              </div>
            </div>
            <div style={{ "background": "rgb(241, 241, 241)", "width": "100%", "height": "10px", "position": "absolute", "left": "0", "right": "0" }}></div>
            <div className="d-flex flex-column mt-4">
              <div className="games-section-title">Pay Through</div>
              <div className="add-fund-box mt-3" style={{ paddingTop: "0px", height: "60px" }}>
                <div
                  className="d-flex align-items-center"
                  style={{
                    backgroundColor: "#fafafa",
                    border: "1px solid #e0e0e0",
                    borderRadius: "7px",
                  }}
                >
                  <div className="d-flex align-items-center" style={{ height: "60px" }}>
                    <img
                      width="45px"
                      src="/bank1.png"
                      alt=""
                      style={{
                        marginLeft: "7px",
                        paddingLeft: "3px",
                      }}
                    />
                  </div>
                  <div className="d-flex justify-content-center flex-column ml-4">
                    <div className="jss30">
                      <strong>Net Banking</strong>
                    </div>
                    <div className="jss31"></div>
                  </div>
                  <div className="d-flex justify-content-center ml-auto mr-3">
                    <button type="button" onClick={() => setNext(2)} className="btn btn-info text-white font-weight-bold text-uppercase px-2 py-1">Edit</button>
                  </div>
                </div>
              </div>
            </div>
            <select className="form-control mt-4" style={{ "border": "1px solid rgb(224, 224, 224)", "outline": "none", "borderRadius": "5px", "background": "rgb(250, 250, 250)", "height": "3rem" }} onChange={(e) => { setBankCode(e.target.value) }} >
              <option value="3003">Axis Bank</option>
              <option value="3005">Bank of Baroda - Retail Banking</option>
              <option value="3006">Bank of India</option>
              <option value="3007">Bank of Maharashtra</option>
              <option value="3009">Canara Bank</option>
              <option value="3010">Catholic Syrian Bank</option>
              <option value="3011">Central Bank of India</option>
              <option value="3012">City Union Bank</option>
              <option value="3016">Deutsche Bank</option>
              <option value="3017">DBS Bank Ltd</option>
              <option value="3018">DCB Bank - Personal</option>
              <option value="3019">Dhanlakshmi Bank</option>
              <option value="3020">Federal Bank</option>
              <option value="3021">HDFC Bank</option>
              <option value="3022">ICICI Bank</option>
              <option value="3023">IDBI Bank</option>
              <option value="3024">IDFC FIRST Bank</option>
              <option value="3026">Indian Bank</option>
              <option value="3027">Indian Overseas Bank</option>
              <option value="3028">IndusInd Bank</option>
              <option value="3029">Jammu and Kashmir Bank</option>
              <option value="3030">Karnataka Bank Ltd</option>
              <option value="3031">Karur Vysya Bank</option>
              <option value="3032">Kotak Mahindra Bank</option>
              <option value="3033">Laxmi Vilas Bank - Retail Net Banking</option>
              <option value="3037">Punjab & Sind Bank</option>
              <option value="3038">Punjab National Bank - Retail Net Banking</option>
              <option value="3039">RBL Bank</option>
              <option value="3040">Saraswat Bank</option>
              <option value="3042">South Indian Bank</option>
              <option value="3043">Standard Chartered Bank</option>
              <option value="3044">State Bank Of India</option>
              <option value="3052">Tamilnad Mercantile Bank Ltd</option>
              <option value="3054">UCO Bank</option>
              <option value="3055">Union Bank of India</option>
              <option value="3058">Yes Bank Ltd</option>
              <option value="3060">Bank of Baroda - Corporate</option>
              <option value="3061">Bank of India - Corporate</option>
              <option value="3062">DCB Bank - Corporate</option>
              <option value="3064">Lakshmi Vilas Bank - Corporate</option>
              <option value="3065">Punjab National Bank - Corporate</option>
              <option value="3066">State Bank of India - Corporate</option>
              <option value="3067">Union Bank of India - Corporate</option>
              <option value="3071">Axis Bank Corporate</option>
              <option value="3072">Dhanlaxmi Bank Corporate</option>
              <option value="3073">ICICI Corporate Netbanking</option>
              <option value="3074">Ratnakar Corporate Banking</option>
              <option value="3075">Shamrao Vithal Bank Corporate</option>
              <option value="3076">Equitas Small Finance Bank</option>
              <option value="3077">Yes Bank Corporate</option>
              <option value="3079">Bandhan Bank- Corporate banking</option>
              <option value="3080">Barclays Corporate- Corporate Banking - Corporate</option>
              <option value="3081">Indian Overseas Bank Corporate</option>
              <option value="3083">City Union Bank of Corporate</option>
              <option value="3084">HDFC Corporate</option>
              <option value="3086">Shivalik Bank</option>
              <option value="3087">AU Small Finance</option>
              <option value="3088">Bandhan Bank - Retail Net Banking</option>
              <option value="3041">Shamrao Vitthal Co-operative Bank</option>
              <option value="3051">Tamil Nadu State Co-operative Bank</option>
              <option value="3089">Utkarsh Small Finance Bank</option>
              <option value="3090">The Surat People’s Co-operative Bank Limited</option>
              <option value="3091">Gujarat State Co-operative Bank Limited</option>
              <option value="3092">HSBC Retail Netbanking</option>
              <option value="3102">Jana Small Finance Bank</option>
            </select>
            <div className={`${css.refer_footer}`}>
              <div className="d-grid gap-2 col-12 mx-auto">

                <button type="button" className={`${css.block} bg-primary rounded text-white font-weight-bold text-uppercase`} onClick={() => { deposit("link", "netbanking") }}>Add</button>

              </div>
            </div>
          </div>
          }
          {Boolean(process) &&
            <div className="loaderReturn" style={{ zIndex: '99' }}>
              <img
                src="/Images/LandingPage_img/loader1.gif"
                style={{ width: "100%", }} alt="img"
              />
            </div>
          }
          
          { WebSitesettings.depositMsg &&
            <div className="kyc_banner" style={{background:'linear-gradient(90deg, #420808, #a40909 47%, #8c0a0a) !important'}}>
                ◉ {WebSitesettings.depositMsg}
            </div>
          }
                  
        </div>}
        
       {/*
       <div className="leftContainer" style={{ minHeight: '100vh', height: '100%' }}>

        <div className="container px-3 mt-5 py-5" style={{ height: "10px" }}>
          <div className="row">

            <div className="col mx-auto">
              <div className="card text-center mt-3">

                {userAllData && userAllData.verified === 'unverified' && <div style={{ height: "100px" }}>
                  <Link to='/Kyc2'>

                    <picture className="ml-3">
                      <img src="/images/alert.svg" alt="" width="32px" className="mt-4" />
                    </picture>
                    <div className="ml-1 mt-2 mytext text-muted ">
                      Complete KYC to Deposit Amount
                    </div>
                  </Link>
                </div>}
                {userAllData && userAllData.verified === 'pending' && <div style={{ height: "100px" }}>
                  <picture className="ml-3">
                    <img src="/images/alert.svg" alt="" width="32px" className="mt-4" />
                  </picture>
                  <div className="ml-1 mt-2 mytext text-muted ">
                    Please wait your kyc under process
                  </div>
                </div>}

              </div>
            </div>
          </div>
        </div>
      </div> */}

    </>
  );
};
export default Addcase;