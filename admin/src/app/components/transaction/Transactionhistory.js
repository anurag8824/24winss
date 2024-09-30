import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Swal from "sweetalert2";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import "./imageview.css";
const $ = require("jquery")
$.Datatable = require("datatables.net");

const Transactionhistory = () => {

  const [user, setUser] = useState()
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }


  //use for pagination..
  let [limit, setLimit] = useState(10);

  const setpageLimit = (event) => {
    let key = event.target.value
    setLimit(key);
  }
  const [pageNumber, setPageNumber] = useState(0);
  const [numberOfPages, setNumberOfPages] = useState(0);

  //user for searching..
  const [searchList, setSearchList] = useState(0);
  const [searchType, setSearchType] = useState(0);
  const [findByStatus, setFindByStatus] = useState(0);

  //   searching handler
  const searchHandler = (event) => {
    let key = event.target.value
    setSearchList(key);
  }
  //   search by status handler
  const searchByStatus = (event) => {
    let key = event.target.value
    setFindByStatus(key);
  }

  //react paginate..
  const handlePageClick = async (data) => {
    let currentPage = data.selected + 1;
    setPageNumber(currentPage);
    // scroll to the top
    //window.scrollTo(0, 0)
  };

  const profle = () => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.get(baseUrl + `txn/deposit/all?page=${pageNumber}&_limit=${limit}&_q=${searchList}&_stype=${searchType}&_status=${findByStatus}`, { headers })
      .then((res) => {
        setUser(res.data.admin)
        setNumberOfPages(res.data.totalPages)
        //$('table').dataTable();
        imageViewer();
      })
  }

  const checkdeposit = (order_id, order_token, pay_date) => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `depositupipay/response`, { order_id, order_token, pay_date }, { headers })
      .then((res) => {
        const icon = res.data.status == "PAID" ? "success" : "danger";
        const title = res.data.status == "PAID" ? "Deposit submited successfully" : "Transaction Failed";
        profle();

      })
      .catch((e) => {
        if (e.response.status == 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
        }
      })
  }

  const universalCheckDeposit = (payment_gatway, order_id, order_token, pay_date) => {
    //alert(payment_gatway);
    if(payment_gatway == 'razorpay'){
      checkrazorpayPayment(order_id, order_token, pay_date)
    }
    else if(payment_gatway == 'decentropay'){
      checkdecentroupipay(order_id, order_token, pay_date)
    }
    else if(payment_gatway == 'pinelab'){
      checkPinelabpay(order_id, order_token, pay_date)
    }
    else if(payment_gatway == 'Phonepe'){
      checkPhonepe(order_id, order_token, pay_date)
    }
    else if(payment_gatway == 'upigateway'){
      checkupigatewaypay(order_id, order_token, pay_date)
    }
    else if(!payment_gatway){
      withdrowFail(order_id)
    }else{
      alert('Nothing found');
    }
  }

  const checkrazorpayPayment = (order_id, order_token) => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `razorpaycheck/response`, { order_id, order_token }, { headers })
      .then((res) => {
        const icon = res.data.status == "PAID" ? "success" : "danger";
        const title = res.data.status == "PAID" ? "Deposit submited successfully" : "Transaction Failed";
        profle();

      })
      .catch((e) => {
        if (e.response.status == 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
        }
      })
  }

  const checkdecentroupipay = (order_id, order_token, pay_date) => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `decentroupipay/response`, { order_id, order_token }, { headers })
      .then((res) => {
        const icon = res.data.status == "PAID" ? "success" : "danger";
        const title = res.data.status == "PAID" ? "Deposit submited successfully" : "Transaction Failed";
        profle();

      })
      .catch((e) => {
        if (e.response.status == 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
        }
      })
  }
  
    const checkupigatewaypay = (order_id, order_token, pay_date) => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `depositupipay/response`, { order_id, order_token }, { headers })
      .then((res) => {
        const icon = res.data.status == "PAID" ? "success" : "danger";
        const title = res.data.status == "PAID" ? "Deposit submited successfully" : "Transaction Failed";
        profle();

      })
      .catch((e) => {
        if (e.response.status == 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
        }
      })
  }
  
  const checkPhonepe = (order_id, order_token, pay_date) => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `phonepestatus/response`, { order_id, order_token }, { headers })
      .then((res) => {
        const icon = res.data.status == "PAID" ? "success" : "danger";
        const title = res.data.status == "PAID" ? "Deposit submited successfully" : "Transaction Failed";
        profle();

      })
      .catch((e) => {
        if (e.response.status == 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
        }
      })
  }

  const checkPinelabpay = (order_id, order_token, pay_date) => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl + `pinelabdesposit/response`, { order_id, order_token }, { headers })
      .then((res) => {
        const icon = res.data.status == "PAID" ? "success" : "danger";
        const title = res.data.status == "PAID" ? "Deposit submited successfully" : "Transaction Failed";
        profle();

      })
      .catch((e) => {
        if (e.response.status == 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('token');
          window.location.reload()
        }
      })
  }


  const withdrowPass = (id) => {
    const confirm = window.confirm("Are you sure, you want to update to success this deposit?")
    if (confirm) {
      const access_token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${access_token}`
      }

      axios.post(baseUrl + `userdipositupdate/${id}`,
        {
          status: "SUCCESS"
        },
        { headers })
        .then((res) => {
          profle();
          alert('deposit successfully done');
        }).catch((e) => {
          //console.log(e);
        })
    }
  }


  const withdrowFail = (id) => {
    const confirm = window.confirm("Are you sure, you want to update to failed this deposit?")
    if (confirm) {
      const access_token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${access_token}`
      }

      axios.post(baseUrl + `userdipositupdate/${id}`,
        {
          status: "FAILED"
        },
        { headers })
        .then((res) => {
          profle();
          alert('deposit successfully reject');
          //console.log(res);
        }).catch((e) => {
          //console.log(e);
        })
    }
  }


  const dateFormat = (e) => {
    const date = new Date(e);
    const newDate = date.toLocaleString('default', { month: 'long', day: 'numeric', hour: 'numeric', hour12: true, minute: 'numeric' });
    return newDate;
  }

  const newdateFormat = (e) => {

    let today = new Date(e);
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    today = dd + '-' + mm + '-' + yyyy;
    return today;
  }
  
  
  function imageViewer() {
    let imgs = document.getElementsByClassName("img"),
      out = document.getElementsByClassName("img-out")[0];
    for (let i = 0; i < imgs.length; i++) {

      if (!imgs[i].classList.contains("el")) {

        imgs[i].classList.add("el");
        imgs[i].addEventListener("click", lightImage);
        function lightImage() {
          let container = document.getElementsByClassName("img-panel")[i];
          container.classList.toggle("img-panel__selct");
        };

        imgs[i].addEventListener("click", openImage);
        function openImage() {
          let imgElement = document.createElement("img"),
            imgWrapper = document.createElement("div"),
            imgClose = document.createElement("div"),
            container = document.getElementsByClassName("img-panel")[i];
          container.classList.add("img-panel__selct");
          imgElement.setAttribute("class", "image__selected");
          imgElement.src = imgs[i].src;
          imgWrapper.setAttribute("class", "img-wrapper");
          imgClose.setAttribute("class", "img-close");
          imgWrapper.appendChild(imgElement);
          imgWrapper.appendChild(imgClose);


          setTimeout(
            function () {
              imgWrapper.classList.add("img-wrapper__initial");
              imgElement.classList.add("img-selected-initial");
            }, 50);

          out.appendChild(imgWrapper);
          imgClose.addEventListener("click", function () {
            container.classList.remove("img-panel__selct");
            out.removeChild(imgWrapper);
          });
        }
      }
    }
  }

  useEffect(() => {
    profle()
  }, [pageNumber, limit, searchList, searchType, findByStatus])


  if (user == undefined) {
    return null
  }
  return (
    <>
      {/* <h4 className='font-weight-bold my-3'>ALL CHALLANGES</h4> */}
      <div className="row ">
        <div className="col-12 grid-margin">
          <div className="card ">
            <div className="card-body text-light" style={{ backgroundColor: "rgba(0, 27, 11, 0.734)" }}>
              <h4 className="card-title">Deposit History</h4>


              {/* searching */}
              <div className='row'>
                <select className='form-control col-sm-3 m-2' id='searchType' name='searchtype' onChange={(e) => setSearchType(e.target.value)}>
                  <option value="0">Select Search by</option>
                  <option value="Name">Name</option>
                  <option value="Phone">Phone</option>
                  <option value="_id">TxnId</option>
                </select>
                <input type='text' placeholder='Search...' className='form-control col-sm-4 m-2' onChange={searchHandler} />
                <h5>Or</h5>
                <select className='form-control col-sm-3 m-2' id='findByStatus' name='findByStatus' onChange={searchByStatus}>
                  <option value="0">Search Status</option>
                  <option value="FAILED">FAILED</option>
                  <option value="Pending">Pending</option>
                  <option value="pending">pending</option>
                  <option value="PAID">PAID</option>
                  <option value="pending">pending</option>
                </select>
                <select className='form-control col-sm-1 m-1 bg-dark text-light' id='pagelimit' name='pagelimit' onChange={setpageLimit}>
                  <option value="10">Set limit</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="500">500</option>
                </select>
              </div>

              <div className="table-responsive">
                <table className="table text-light">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th> ID</th>
                      <th> Phone</th>
                      <th> User</th>
                      <th> R_orderId</th>
                      <th> Amount </th>
                      <th> Status </th>
                      <th> UTR Number </th>
                      <th> Screenshot </th>
                      <th> Action </th>
                      <th> Date </th>
                    </tr>
                  </thead>

                  <tbody>
                    {user && user.map((data, key) => {
                      var id = data._id.toString(), ctr = 0;
                      var timestamp = id.slice(ctr, (ctr += 8));
                      var machineID = id.slice(ctr, (ctr += 6));
                      var processID = id.slice(ctr, (ctr += 4));
                      var counter = id.slice(ctr, (ctr += 6));
                      //console.log("id:", id);
                      //console.log("timestamp:", parseInt(timestamp, 16));
                      //console.log("machineID:", parseInt(machineID, 16));
                      //console.log("processID:", parseInt(processID, 16));
                      var counterid = parseInt(timestamp, 16);
                      let currentTime = Date.now();
                      let gameCreatedAt = new Date(data.createdAt).getTime();
                      return (
                        <tr>
                          <td>{key + 1} | {counterid}</td>
                          <td>{data._id}</td>
                          <td>
                            <span className="pl-2">{data.User_id ? data.User_id.Phone : ''}</span>
                          </td>
                          <td>{data.User_id && <Link className="btn btn-sm btn-outline-info" to={`/user/view_user/${data.User_id._id}`} >{data.User_id.Name}</Link>}</td>

                          <td>
                            {data.order_token}
                          </td>
                          <td>{data.amount}</td>
                          <td className='font-weight-bold text-success'>{data.status}</td>
                          <td className='font-weight-bold text-success'>{data.referenceId}</td>
                          <td>
                            <div className="img-panel">
                            {data.Transaction_Screenshot &&
    
                              <img className="img" src={baseUrl + `${data.Transaction_Screenshot}`} style={{
                                borderRadius: '5px',
                                width: '4rem',
                                height: '4rem',
                              }}
                                id={`ss${key}`}
                              />
                            }
                            </div>
                          </td>
                          <td>
                            {
                            //&& (parseInt(gameCreatedAt) + 7200000) < currentTime
                              //(data.status != 'PAID' && data.status != 'FAILED' ) ? <button className="btn btn-danger" onClick={() => universalCheckDeposit(data.payment_gatway, data.order_id, data.order_token, newdateFormat(data.createdAt))} >Check {data.payment_gatway}</button> : 'Checked All'
                            }
                            
                            {
                                (data.status != "PAID" && data.status != "FAILED" && data.status!="reject")? <button className="mr-1 btn btn-sm btn-danger" onClick={() => withdrowFail(data._id)}>Fail</button> :''
                            }

                            {
                                (data.status != "PAID" && data.status != "FAILED" && data.status!="reject")? <button className="ml-1 btn btn-sm btn-warning" onClick={() => withdrowPass(data._id)}>Success</button>:''
                            }

                            {
                              //   <button className="ml-1 btn btn-sm btn-warning" onClick={() => withdrowPass(data._id)}>Success</button>
                            }
                          </td>
                          <td>{dateFormat(data.createdAt).split(',')[0]} </td>
                        </tr>
                      )
                    }
                    )}
                  </tbody>
                </table>
              </div>

              <div className='mt-4'>
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={numberOfPages}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={3}
                  onPageChange={handlePageClick}
                  containerClassName={"pagination justify-content-center"}
                  pageClassName={"page-item"}
                  pageLinkClassName={"page-link"}
                  previousClassName={"page-item"}
                  previousLinkClassName={"page-link"}
                  nextClassName={"page-item"}
                  nextLinkClassName={"page-link"}
                  breakClassName={"page-item"}
                  breakLinkClassName={"page-link"}
                  activeClassName={"active"}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Transactionhistory
