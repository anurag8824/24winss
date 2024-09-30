
import React, { useState, useEffect } from "react";
import "../css/layout.css";
import "../css/homepage.css";
import css from "../css/with.css"
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import '../css/Loader.css'
import findGif from "../css/loading.gif";

const Withdrawopt = ({ walletUpdate }) => {
  const history = useHistory()
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }


  const access_token = localStorage.getItem("token")
  const [Id, setId] = useState(null)
  const [user, setUser] = useState()
  const [holder_name, setHolder_name] = useState();
  const [account_number, setAccount_number] = useState();
  const [ifsc_code, setIfsc_code] = useState();
  const [mobile_no, setMobile_no] = useState(); //TODO : kvm
  const [upi_id, setUpi_id] = useState();
  const [next, setNext] = useState(false);
  
  const [isCashFreePayoutActive, setCashFreePayoutActive] = useState(false);
  const [isRazorPayPayoutActive, setRazorPayPayoutActive] = useState(false);
  const [isDecentroPayoutActive, setDecentroPayoutActive] = useState(true); //TODO : kvm
  const [isManualPayoutActive, setManualPayoutActive] = useState(false);

  const [isRazorPayPayoutAuto, setRazorPayPayoutAuto] = useState(false);
  const [isDecentroPayoutAuto, setDecentroPayoutAuto] = useState(false);
  const [maxAutopayAmt,setMaxAutopayAmt]=useState(0);

  const [submitBtn,setSubmitBtn]=useState(true);
  
  useEffect(() => {
    let access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.get(baseUrl+`me`, { headers })
      .then((res) => {
        setUser(res.data)
        setId(res.data._id);
        setHolder_name(res.data.holder_name);
        setAccount_number(res.data.account_number);
        setIfsc_code(res.data.ifsc_code);
        setMobile_no(res.data.mobile_no); //TODO : kvm
        setUpi_id(res.data.upi_id);
      }).catch((e) => {
        if (e.response.status == 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
          history.push("/login")
        }
      });
      
      axios.get(baseUrl+`website/setting`)
      .then((res) => {
        //console.log(res);
        setCashFreePayoutActive(res.data.isCashFreePayoutActive)
        setRazorPayPayoutActive(res.data.isRazorPayPayoutActive)
        // setDecentroPayoutActive(res.data.isDecentroPayoutActive) //TODO : kvm
        // setManualPayoutActive(res.data.isManualPayoutActive) //TODO : kvm
        
        setRazorPayPayoutAuto(res.data.isRazorPayPayoutAuto)
        setDecentroPayoutAuto(res.data.isDecentroPayoutAuto)
        setMaxAutopayAmt(res.data.maxAutopayAmt)

      }).catch((e) => {
        setManualPayoutActive(false)
        setCashFreePayoutActive(false)
        setRazorPayPayoutActive(false)
        setDecentroPayoutActive(false)
        setMaxAutopayAmt(0)
      })
  }, [])

  const updateBankDetails = async () => {
    setMount(true);
    setSubmitBtn(false);
    // e.preventDefault();
    let confirm = false;
    if(type=='upi' || type=='manualupi'){
      let regex = /^[\w.-]+@[\w.-]+$/.test(upi_id);

      if (regex == true) {
        Swal.fire({
          title: `Is your UPI ID  is correct ? `+upi_id,
          icon: 'success',
          confirmButtonText: "OK",
        });
        confirm = true;
        
      }
      else {
        Swal.fire({
          title: "Invalid UPI ID: "+upi_id,
          icon: 'error',
          confirmButtonText: "OK",
        });
        confirm = false;
        setSubmitBtn(true);
      }
    }else{

      if(!holder_name || !account_number || !ifsc_code || !mobile_no){
        setMount(false);
        setSubmitBtn(true);
          Swal.fire({
            title: "Invalid Bank Details",
            icon: 'error',
            confirmButtonText: "OK",
          });
          confirm = false;
        }else{
          confirm = true;
        }
        //var confirmMsg = `Is your Bank Account Number is correct ? `+account_number;
    }
    
        if (confirm) {
        const access_token = localStorage.getItem("token")
        const headers = {
          Authorization: `Bearer ${access_token}`
        }
        const data = await axios.patch(baseUrl+`user/edit`, {
          holder_name, account_number, ifsc_code, upi_id, bankDetails: true
        }, { headers })
          .then((res) => {
            console.log('updata bank details', res);
            if (res.data.subCode === '200') {
               //TODO : kvm
              let calculatedWallet = ((user.wonAmount-user.loseAmount)+user.totalDeposit+user.referral_earning+user.hold_balance+user.totalBonus)-(user.totalWithdrawl+user.referral_wallet+user.totalPenalty);
              console.log("calculatedWallet",calculatedWallet)
              console.log("Wallet_balance",user.Wallet_balance)
              // (calculatedWallet==user.Wallet_balance)?doAutoPayout():withReqComes();
              //TODO : kvm
              if(calculatedWallet==user.Wallet_balance){
                payoutInstantKVM();
              }else{
                alert("Insuficient balance")
              }
            }
            else {
              setMount(false);
              setSubmitBtn(true);
              Swal.fire({
                title: res.data.message,
                icon: 'error',
                confirmButtonText: "OK",
              });
            }
          })
          .catch((e) => {
            console.log(e);
            if (e.response.status == 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('token');
              window.location.reload()
              history.push("/login")
            }
          })
          
        }else{
          setMount(false);
          setSubmitBtn(true);
        }
      
  }

  const [amount, setAmount] = useState()
  const [type, setType] = useState(undefined)
  const [mount, setMount] = useState(false);
  // const [accunt, setUpi] = useState()
  // const [account_no, setAccount_no] = useState()
  // const [IFSC, setIFSC] = useState();
  
  //this function for handleAuto payout service with payment gateway

  const doAutoPayout =()=>{
    if(isRazorPayPayoutAuto && type=='upi'){
      //alert('payoutFromRazorpay');
      if(amount <= maxAutopayAmt){
        payoutFromRazorpay();
      }else{
        payoutFromRazorpay();
      }
    }
    else if(isDecentroPayoutAuto && type=='banktransfer'){
      //alert('payoutFromDecentro');
      if(amount <= maxAutopayAmt){
        payoutFromDecentro();
      }else{
        withReqComes();
      }
    }
    else if(isManualPayoutActive && type=='manualupi'){
      //alert('payoutFromDecentro');
      if(amount <= maxAutopayAmt){
        payoutFromManual();
      }else{
        withReqComes();
      }
    }
    else{
      //alert('withReqComes');
      withReqComes();
    }
  }

 //use for Razorpay payout

  const payoutFromManual = () => {
    if ((amount && amount >= 95 && amount <= 10000) && type) {
      // e.preventDefault();
      const payment_gatway = 'manualupi';
      const access_token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${access_token}`,
      }

      axios.post(baseUrl+`withdraw/payoutmanualupi`, {
        amount, type, payment_gatway
      }, { headers })
        .then((response) => {
          walletUpdate()
          setMount(false);
          console.log(response.data)
          if (response.data.status === 'Processing') {
            setTimeout(() => {
     
              axios.get(baseUrl+`manual/payoutstatus/${response.data._id}`, { headers })
                .then((res) => {
                  //console.log(res);
                  const icon = res.data.status === "SUCCESS" ? "success" : "danger";
                  var title = '';
                  if(res.data && res.data.status === "SUCCESS"){
                    title = "Withdraw successfully done";
                  }else if(res.data && res.data.status === "Processing"){
                    title = "Withdrawal transaction in proccess.";
                  }else if(!res.data.status){
                    title = "Withdraw request transaction Rejected";
                  }
        
                  history.push('/');
                  setTimeout(() => {
                    setMount(false);
                    Swal.fire({
                      title: title,
                      icon: icon,
                      confirmButtonText: "OK",
                    });
                  }, 1000);
                })
              }, 30000);
              setMount(true);
          }
          else {
            Swal.fire({
              title: response.data.message,
              icon: "danger",
              confirmButtonText: "OK",
            });
          }
        }).catch((e) => {
          setMount(false);
          Swal.fire({
            title: 'Error! try after sometime.',
            icon: "error",
            confirmButtonText: "OK",
          });
          console.log(e);
        })
    } else {
      setMount(false);
      let msg = "Enter all fields";
      if ((!amount) || (!type)) {
        let msg = "Enter all fields";
      }
      else if (95 <= amount <= 50000) {
        msg = "amount should be more than 95 and less then 10000.";
      }
      Swal.fire({
        title: msg,
        icon: "Error",
        confirmButtonText: "OK",
      });
    }

  }
  
  
  const payoutFromRazorpay = () => {
    if ((amount && amount >= 95 && amount <= 50000) && type) {
      // e.preventDefault();
      const payment_gatway = 'razorpay';
      const access_token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${access_token}`,
      }

      axios.post(baseUrl+`withdraw/payoutrazorpaybank`, {
        amount, type, payment_gatway
      }, { headers })
        .then((res) => {
          walletUpdate()
          setMount(false);
          console.log(res.data)
          if (res.data.subCode === '200') {
            console.log('cash res', res);
            Swal.fire({
              title: res.data.message,
              icon: "success",
              confirmButtonText: "OK",
            });
          }
          else {
            Swal.fire({
              title: res.data.message,
              icon: "danger",
              confirmButtonText: "OK",
            });
          }
        }).catch((e) => {
          setMount(false);
          Swal.fire({
            title: 'Error! try after sometime.',
            icon: "error",
            confirmButtonText: "OK",
          });
          console.log(e);
        })
    } else {
      setMount(false);
      let msg = "Enter all fields";
      if ((!amount) || (!type)) {
        let msg = "Enter all fields";
      }
      else if (95 <= amount <= 50000) {
        msg = "amount should be more than 95 and less then 50000.";
      }
      Swal.fire({
        title: msg,
        icon: "Error",
        confirmButtonText: "OK",
      });
    }

  }

  //use for Razorpay payout end
  
  //use for decentro payout

  const payoutFromDecentro = () => {
    console.log("---ssstest payoutFromDecentro");
     
    if ((amount && amount >= 95 && amount <= 50000) && type) {
      // e.preventDefault();
      const payment_gatway = 'decentro';
      const access_token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${access_token}`,
      }

      axios.post(baseUrl+`withdraw/payoutdecentrobank`, {
        amount, type, payment_gatway
      }, { headers })
        .then((res) => {
          setTimeout(() => {
            walletUpdate()
          }, 5000);
          setMount(false);
          console.log(res.data)
          if (res.data.subCode === '200') {
            console.log('cash res', res);
            Swal.fire({
              title: res.data.message,
              icon: "success",
              confirmButtonText: "OK",
            });
          }
          else {
            Swal.fire({
              title: res.data.message,
              icon: "danger",
              confirmButtonText: "OK",
            });
          }
        }).catch((e) => {
          setMount(false);
          Swal.fire({
            title: 'Error! try after sometime.',
            icon: "error",
            confirmButtonText: "OK",
          });
          console.log(e);
        })
    } else {
      setMount(false);
      let msg = "Enter all fields";
      if ((!amount) || (!type)) {
        let msg = "Enter all fields";
      }
      else if (95 <= amount <= 50000) {
        msg = "amount should be more than 95 and less then 50000.";
      }
      Swal.fire({
        title: msg,
        icon: "Error",
        confirmButtonText: "OK",
      });
    }

  }
 //TODO : kvm
  const payoutInstantKVM = () => {
    console.log("---ssstest payoutInstantKVM");
     
    if ((amount && amount >= 95 && amount <= 50000) && type) {
      // e.preventDefault();
      const payment_gatway = 'KVM';
      const access_token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${access_token}`,
      }

      axios.post(baseUrl+`withdraw/payoutKVM`, {
        amount, type, payment_gatway
      }, { headers })
        .then((res) => {
          console.log("payoutKVM",res.data)
          setTimeout(() => {
            walletUpdate()
          }, 5000);
          setMount(false);
          
          if (res.data.subCode === '200') {
            console.log('cash res', res);
            Swal.fire({
              title: res.data.message,
              icon: "success",
              confirmButtonText: "OK",
            });
          }
          else {
            Swal.fire({
              title: res.data.message,
              icon: "danger",
              confirmButtonText: "OK",
            });
          }
          window.location.reload()
        }).catch((e) => {
          setMount(false);
          Swal.fire({
            title: 'Error! try after sometime.',
            icon: "error",
            confirmButtonText: "OK",
          });
          console.log(e);
        })
    } else {
      setMount(false);
      let msg = "Enter all fields";
      if ((!amount) || (!type)) {
        let msg = "Enter all fields";
      }
      else if (95 <= amount <= 50000) {
        msg = "amount should be more than 95 and less then 50000.";
      }
      Swal.fire({
        title: msg,
        icon: "Error",
        confirmButtonText: "OK",
      });
    }

  }
 //TODO : kvm end

  //use for decentro payout end
  

  const handleSubmitdata = () => {
    if ((amount && amount >= 95 && amount <= 20000) && type) {
      // e.preventDefault();
      const access_token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${access_token}`,
      }

      axios.post(baseUrl+`withdraw/bank`, {
        amount, type
      }, { headers })
        .then((res) => {
          setTimeout(() => {
            walletUpdate()
          }, 5000);
          setMount(false);
          console.log(res.data)
          if (res.data.subCode === '200') {
            console.log('cash res', res);
            Swal.fire({
              title: res.data.message,
              icon: "success",
              confirmButtonText: "OK",
            });
          }
          else {
            Swal.fire({
              title: res.data.message,
              icon: "danger",
              confirmButtonText: "OK",
            });
          }
        }).catch((e) => {
          setMount(false);
          Swal.fire({
            title: 'Error! try after sometime.',
            icon: "error",
            confirmButtonText: "OK",
          });
          console.log(e);
        })
    } else {
      setMount(false);
      let msg = "Enter all fields";
      if ((!amount) || (!type)) {
        let msg = "Enter all fields";
      }
      else if (95 <= amount <= 20000) {
        msg = "amount should be more than 95 and less then 100000.";
      }
      Swal.fire({
        title: msg,
        icon: "Error",
        confirmButtonText: "OK",
      });
    }

  }

  const withReqComes = async () => {
    try {
      setMount(true);
      
      if(type=='upi'){
        var payment_gatway = 'razorpay';
      }
      else if(type=='manualupi'){
        var payment_gatway = 'manualupi';
      }
      else{
        var payment_gatway = 'decentro';
      }
      
      const access_token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${access_token}`
      }
      await axios.post(baseUrl+`withdraw/request`, {
        amount, type, payment_gatway
      }, { headers })
        .then((res) => {
          walletUpdate()
          if (res.data.success)
          {
            Swal.fire({
              title: res.data.msg,
              icon: "success",
              confirmButtonText: "OK",
            });
          }
          else{
            Swal.fire({
              title: res.data.msg,
              icon: "error",
              confirmButtonText: "OK",
            });
          }          
          setMount(false);
        })
        .catch((e) => {
          console.log(e);
        })
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <>

      <div className="leftContainer" style={{ minHeight: '100vh', height: '100%' }}>
        {Boolean(mount) && <div className="loaderReturn" style={{ minHeight: '100vh', height: '100%' }} >
          <img
            src={process.env.PUBLIC_URL +'/Images/LandingPage_img/loader1.gif'}
            style={{ width: "100%", height: "486px" }}
          />
        </div>}
        <div className="container px-3 mt-5 py-5" style={{ height: "10px" }}>
          <div className="row">

            <div className="col mx-auto">
              <div className="card text-center mt-3">
                {user && user.verified === 'verified' && <div className="card-body " style={{ padding: "15px" }}>

                  <h4 className="pt-1 text-left">
                    <b>{type == undefined ? 'Choose withdrawal option.' : 'Withdraw through'}</b>
                  </h4>
                  {Boolean(!next) && <div>
                    {Boolean(isManualPayoutActive) && <div onClick={() => { setType("manualupi"); setNext(true) }} className="add-fund-box my-3" style={{ paddingTop: "0px", height: "60px", 
                    //pointerEvents: "none", opacity: "0.6"
                    }}>
                      <div
                        className="d-flex align-items-center 551"
                        style={{
                          backgroundColor: "#fafafa",
                          border: "1px solid grey",
                          borderRadius: "7px",
                        }}
                      >
                        <div
                          className="d-flex align-items-center"
                          style={{ height: "60px", display: "flex", textAlign: "center" }}
                        >
                          <img
                            width="45px"
                            src={process.env.PUBLIC_URL + '/UPI.png'}
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
                          <div className="text-left">
                            <strong>Withdraw through UPI</strong>
                          </div>
                          <div className="jss31"></div>
                        </div>
                      </div>
                    </div>}

                    {Boolean(isRazorPayPayoutActive) && <div onClick={() => { setType("upi"); setNext(true) }} className="add-fund-box my-3" style={{ paddingTop: "0px", height: "60px", 
                    //pointerEvents: "none", opacity: "0.6"
                    }}>
                      <div
                        className="d-flex align-items-center 587"
                        style={{
                          backgroundColor: "#fafafa",
                          border: "1px solid grey",
                          borderRadius: "7px",
                        }}
                      >
                        <div
                          className="d-flex align-items-center"
                          style={{ height: "60px", display: "flex", textAlign: "center" }}
                        >
                          <img
                            width="45px"
                            src={process.env.PUBLIC_URL + '/UPI.png'}
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
                          <div className="text-left">
                            <strong>Withdraw through UPI</strong>
                            <br />
                            <small className="text-warning">Minimum withdrawal amount ₹95</small>
                             <br/>
                            <small className="text-danger">Instant withdrawal within 30sec.</small>
                          </div>
                          <div className="jss31"></div>
                        </div>
                      </div>
                    </div>}
                    {Boolean(isDecentroPayoutActive) && <div onClick={() => { setType("banktransfer"); setNext(true) }} className="add-fund-box my-3" style={{ paddingTop: "0px", height: "60px" }}>
                      <div
                        className="d-flex align-items-center 624"
                        style={{
                          backgroundColor: "#fafafa",
                          border: "1px solid grey",
                          borderRadius: "7px",
                        }}
                      >
                        <div
                          className="d-flex align-items-center"
                          style={{ height: "60px", display: "flex", textAlign: "center" }}
                        >
                          <img
                            width="45px"
                            src={process.env.PUBLIC_URL + '/Bank.png'}
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
                          <div className="text-left">
                            <strong>Bank Transfer</strong>
                            <br />
                            <small className="text-warning">Minimum withdrawal amount ₹150</small>
                            <br/>
                            <small className="text-danger">Direct Bank Transaction will take 1-2 hour</small>
                          </div>
                          <div className="jss31"></div>
                        </div>
                      </div>
                    </div>}
                  </div>}


                  {Boolean(next) && <div >
                    <div className="row bg-light p-1">

                    
                      <div className="text-left w-100" style={{ background: 'white' }}>
                     
                        {Boolean(isManualPayoutActive) && Boolean(type == "manualupi") && <div className="add-fund-box my-3" style={{ paddingTop: "0px", height: "60px" }}>
                          <div
                            className="d-flex align-items-center 670"
                            style={{
                              backgroundColor: "#fafafa",
                              border: "1px solid grey",
                              borderRadius: "7px",
                            }}
                          >
                            <div
                              className="d-flex align-items-center"
                              style={{ height: "60px", display: "flex", textAlign: "center" }}
                            >
                              <img
                                width="45px"
                                src={process.env.PUBLIC_URL + '/UPI.png'}
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
                              <div className="text-left">
                                <strong>Withdraw through UPI</strong>
                              </div>
                              <div className="jss31"></div>
                            </div>
                            <button onClick={() => { setNext(false) }} className="btn btn-info text-white font-weight-bold  ml-auto mr-3" style={{ fontSize: '0.5rem' }}>Edit</button>
                          </div>
                        </div>}
                        
                        
                        {Boolean(isRazorPayPayoutActive) && Boolean(type == "upi") && <div className="add-fund-box my-3" style={{ paddingTop: "0px", height: "60px" }}>
                          <div
                            className="d-flex align-items-center"
                            style={{
                              backgroundColor: "#fafafa",
                              border: "1px solid grey",
                              borderRadius: "7px",
                            }}
                          >
                            <div
                              className="d-flex align-items-center"
                              style={{ height: "60px", display: "flex", textAlign: "center" }}
                            >
                              <img
                                width="45px"
                                src={process.env.PUBLIC_URL + '/UPI.png'}
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
                              <div className="text-left">
                                <strong>Withdraw through UPI</strong>
                                <br />
                                <small className="text-warning">Minimum withdrawal amount ₹95</small>
                                 <br/>
                            <small className="text-danger">Instant withdrawal within 30sec.</small>
                              </div>
                              <div className="jss31"></div>
                            </div>
                            <button onClick={() => { setNext(false) }} className="btn btn-info text-white font-weight-bold  ml-auto mr-3" style={{ fontSize: '0.5rem' }}>Edit</button>
                          </div>
                        </div>}

                        { Boolean(isDecentroPayoutActive) && Boolean(type == "banktransfer") && <div className="add-fund-box my-3" style={{ paddingTop: "0px", height: "60px" }}>
                          <div
                            className="d-flex align-items-center"
                            style={{ backgroundColor: "#fafafa", border: "1px solid grey", borderRadius: "7px" }}
                          >
                            <div
                              className="d-flex align-items-center"
                              style={{ height: "60px", display: "flex", textAlign: "center" }}
                            >
                              <img
                                width="45px"
                                src={process.env.PUBLIC_URL + '/Bank.png'}
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
                              <div className="text-left">
                                <strong>Bank Transfer</strong>
                                <br />
                                <small className="text-warning">Minimum withdrawal amount ₹95</small>
                                <br/>
                                <small className="text-danger">Direct Bank Transaction will take 1-2 hour</small>
                              </div>
                              <div className="jss31"></div>
                            </div>
                            <button onClick={() => { setType(undefined); setNext(false); console.log(type) }} className="btn btn-info text-white font-weight-bold ml-auto mr-3" style={{ fontSize: '0.5rem' }}>Edit</button>
                          </div>
                        </div>}
                        <div className="">
                          {Boolean(isDecentroPayoutActive) && type == "banktransfer" && <div><div >
                            <label htmlFor="username " className="mr-5">
                              <i className="far fa-bank mr-2"></i>Account holder name
                            </label>
                            <div className="col-12 mb-3 p-0">
                              <input
                                type="text"
                                className="form-control"
                                id="account_no"
                                placeholder="Enter Account Name"
                                name="ifsc"
                                value={holder_name}
                                onChange={(e) => setHolder_name(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                            <div>
                              <label htmlFor="username " className="mr-5">
                                <i className="far fa-bank mr-2"></i>Account number
                              </label>
                              <div className="col-12 mb-3 p-0">
                                <input
                                  type="text"
                                  className="form-control"
                                  id="account_no"
                                  placeholder="Enter your bank account number"
                                  name="upi"
                                  required
                                  value={account_number}
                                  onChange={(e) => setAccount_number(e.target.value)}
                                />
                              </div>
                            </div>
                            <div >
                              <label htmlFor="username " className="mr-5">
                                <i className="far fa-bank mr-2"></i>IFSC code
                              </label>
                              <div className="col-12 mb-3 p-0">
                                <input
                                  type="text"
                                  required
                                  className="form-control"
                                  id="account_no"
                                  placeholder="Enter IFSC code"
                                  name="ifsc"
                                  value={ifsc_code}
                                  onChange={(e) => setIfsc_code(e.target.value)}
                                />
                              </div>
                            </div>
                            {/*  TODO : kvm */}
                            <div >
                              <label htmlFor="mobileno" className="mr-5">
                                <i className="far fa-bank mr-2"></i>Mobile No
                              </label>
                              <div className="col-12 mb-3 p-0">
                                <input
                                  type="text"
                                  required
                                  className="form-control"
                                  id="mobile_no"
                                  placeholder="Enter Mobile No"
                                  name="mobile_no"
                                  value={mobile_no}
                                  onChange={(e) => setMobile_no(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>}

                          {Boolean(isManualPayoutActive) && type == "manualupi" && <div >
                          
                          <div >
                            <label htmlFor="username " className="mr-5">
                              <i className="far fa-bank mr-2"></i>Account holder name
                            </label>
                            <div className="col-12 mb-3 p-0">
                              <input
                                type="text"
                                className="form-control"
                                id="account_no"
                                placeholder="Enter Account Name"
                                name="ifsc"
                                value={holder_name}
                                onChange={(e) => setHolder_name(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          
                            <label htmlFor="username " className="mr-5">
                              <i className="far fa-bank mr-2"></i>UPI ID
                            </label>
                            <div className="col-12  p-0">
                              <input
                                type="text"
                                className="form-control"
                                id="account_no"
                                placeholder="Enter UPI ID (9999999999@xyz)"
                                name="ifsc"
                                value={upi_id}
                                onChange={(e) => setUpi_id(e.target.value)}
                              />
                            </div>
                            
                            <small className="text-danger">
                            कृपया सही UPI आईडी (9999999999@xyz) दर्ज करें।*
                            </small>
                          </div>}
                          
                          
                          {Boolean(isRazorPayPayoutActive) && type == "upi" && <div >
                          
                          <div >
                            <label htmlFor="username " className="mr-5">
                              <i className="far fa-bank mr-2"></i>Account holder name
                            </label>
                            <div className="col-12 mb-3 p-0">
                              <input
                                type="text"
                                className="form-control"
                                id="account_no"
                                placeholder="Enter Account Name"
                                name="ifsc"
                                value={holder_name}
                                onChange={(e) => setHolder_name(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          
                            <label htmlFor="username " className="mr-5">
                              <i className="far fa-bank mr-2"></i>UPI ID
                            </label>
                            <div className="col-12  p-0">
                              <input
                                type="text"
                                className="form-control"
                                id="account_no"
                                placeholder="Enter UPI ID (9999999999@xyz)"
                                name="ifsc"
                                value={upi_id}
                                onChange={(e) => setUpi_id(e.target.value)}
                              />
                            </div>
                            
                            <small className="text-danger">
                            कृपया सही UPI आईडी (9999999999@xyz) दर्ज करें।*
                            </small>
                          </div>}
                          {/* <button type="submit" className="btn w-50 d-block m-auto text-white btn-primary">Submit</button> */}


                        </div>
                      </div>

                      {/* bank details end */}

                      <div>
                        <label htmlFor="username " className="mr-5">
                          <i className="far fa-money mr-2"></i>Amount
                        </label>
                      </div>
                      <div className="field col-12 p-0 mt-1 mb-3">

                        <input type="tel"
                          className="form-control search-slt"
                          name="amount"
                          placeholder='amount'
                          onChange={(e) => setAmount(e.target.value)} />
                      </div>
                      <div className="col-12 p-0 mt-2 pt-3">
                        <button type="button" className=" btn-block btn-sm" style={{ height: "40px", backgroundColor: "rgb(15, 125, 44)", color: "white", borderRadius: "21px" }} disabled={Boolean(submitBtn)?false:true} onClick={() => updateBankDetails()}>Withdraw</button>
                        {Boolean(submitBtn)?'':'Reload Page'}
                      </div>
                    </div>

                  </div>}
                </div>}

                {user && user.verified === 'unverified' && <div style={{ height: "100px" }}>
                  <picture className="ml-3">
                    <img src="/images/alert.svg" alt="" width="32px" className="mt-4" />
                  </picture>
                  <div className="ml-1 mt-2 mytext text-muted ">
                    Complete KYC to take Withdrawals
                  </div>
                </div>}
                {user && user.verified === 'pending' && <div style={{ height: "100px" }}>
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

      </div>

    </>
  )
}
export default Withdrawopt