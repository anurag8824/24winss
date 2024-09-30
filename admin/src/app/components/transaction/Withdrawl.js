import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const $ = require("jquery")
$.Datatable = require("datatables.net");

const Withdrawl = () => {

  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }


  const [user, setUser] = useState()
  const [mount, setMount] = useState(false);

  const profle = () => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.get(baseUrl+`temp/withdraw/all/pending`, { headers })
      .then((res) => {
          console.log(res)
        setUser(res.data)
        $('table').dataTable();

        console.log(user)
      })
  }

  // const checkStatus = async (id) => {
  //   setMount(true)
  //   const access_token = localStorage.getItem("token")
  //   const headers = {
  //     Authorization: `Bearer ${access_token}`
  //   }
  //   axios.get(baseUrl+`withdrawlstatus/${id}`,
  //     { headers })
  //     .then((res) => {
  //       setMount(false)
  //       console.log(res.data)
  //       Swal.fire({
  //         title: res.data.message,
  //         icon: "info",
  //         confirmButtonText: "OK",
  //       });
  //       profle()
  //     }).catch((e) => {
  //       setMount(false)
  //       profle()
  //       console.log(e);
  //     })
  // }



  const update = async (amount, type, userID, txnID, reqID) => {
    setMount(true)
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    //bank
    if(type=='upi'){
      var pathUrl = baseUrl+`withdraw/razorpay/adminmanual`;
    }else if(type=='mypayupi'){
        var pathUrl = baseUrl+`withdraw/mypapayout/adminmanual`;
    
    }else if(type=='mypaybank'){
        var pathUrl = baseUrl+`withdraw/mypaybankpayout/adminmanual`;
    }
    else{
      var pathUrl = baseUrl+`withdraw/decentro/adminmanual`;
    }
    axios.post(pathUrl,
      {
        amount: amount, type: type, userID: userID, txnID: txnID, reqID: reqID
      },
      { headers })
      .then((res) => {
        setMount(false);
        if (res.data.subCode === '200') {
          console.log('cash res', res);
          Swal.fire({
            title: res.data.message,
            icon: "success",
            confirmButtonText: "OK",
          });
          setTimeout(() => {
            profle()
          }, 1000);
        }
        else {
          Swal.fire({
            title: res.data.message,
            icon: "danger",
            confirmButtonText: "OK",
          });
           setTimeout(() => {
            profle()
          }, 1000);
        }
      }).catch((e) => {
        setMount(false)
        Swal.fire({
          title: 'Error! try after sometime.',
          icon: "error",
          confirmButtonText: "OK",
        });
        console.log(e);
         setTimeout(() => {
            profle()
          }, 1000);
      })
  }
  const reject = async (id) => {
    setMount(true)
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.patch(baseUrl+`temp/withdraw/reject/${id}`,
      {
        status: "reject"
      },
      { headers })
      .then((res) => {
        setMount(false)
        if(res.data.error)
        {
          Swal.fire({
            title: res.data.message,
            icon: "danger",
            confirmButtonText: "OK",
          });
        }
        profle()
      }).catch((e) => {
        setMount(false)
        profle()
        console.log(e);
      })
  }


  useEffect(() => {
    profle()
  }, [])


  if (user == undefined) {
    return null
  }


  return (
    mount ?
      <div className="" style={{ "height":"100%","display": "flex", "alignItems": "center", "justifyContent": "center", "top": "0", "left": "0", "right": "0", "bottom": "0", "zIndex": "9999", "backgroundColor": "rgb(255, 255, 255)" }}>
        <img
          src={'/Loader1.gif'}
          style={{ width: "150px", height: "80px" }}
        />
      </div> :
      <div className="row ">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title"> Withdrawl Request</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th> ID</th>
                      <th> Phone no.</th>
                      <th> Username</th>
                      <th> Amount </th>
                      <th> Withdraw type </th>
                      <th> Action </th>
                    </tr>
                  </thead>

                  <tbody>
                    {user && user.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item._id}</td>
                        <td>{item.user && item.user.Phone}</td>
                        <td>{item.user && <Link className="btn btn-sm btn-outline-info" to={`/user/view_user/${item.user._id}`} >{item.user?.Name}</Link>}</td>
                        <td>{item.amount}</td>
                        <td>
                          {item.type}
                        </td>
                        <td>
                          {!mount && item.status == "Pending" && <> <button className="btn btn-primary mr-2" onClick={() => update(item.amount, item.type, item.user._id, item.txn_id, item._id)} >Approve</button> <button className="btn btn-danger mr-2" onClick={() => reject(item._id)} >reject</button></>}
                          {/* <button type="button" class="btn btn-primary" onClick={() => checkStatus(item._id)}><i class="fa fa-eye" aria-hidden="true"></i> status</button> */}
                        </td>
                        {/* <td> */}
                      </tr>

                    ))
                    }
                  </tbody>

                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

  );
};

export default Withdrawl;