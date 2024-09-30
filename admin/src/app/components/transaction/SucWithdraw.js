import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
const $ = require("jquery")
$.Datatable = require("datatables.net");

const SucWithdraw = () => {

    const [user, setUser] = useState()
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
        var baseUrl = beckendLocalApiUrl;
    } else {
        baseUrl = beckendLiveApiUrl;
    }


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

    //react paginate..
    const handlePageClick = async (data) => {
        let currentPage = data.selected + 1;
        setPageNumber(currentPage);
        // scroll to the top
        //window.scrollTo(0, 0)
    };

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

    const profle = () => {

        const access_token = localStorage.getItem("token")
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.get(baseUrl + `txn/withdraw/all?page=${pageNumber}&_limit=${limit}&_q=${searchList}&_stype=${searchType}&_status=${findByStatus}`, { headers })
            .then((res) => {
                console.log(res);
                setUser(res.data.data)
                setNumberOfPages(res.data.totalPages)
                //$('table').dataTable();
                //console.log(res.data.data)
            })
    }

    const [withdrawSuccess, setWithdrawSuccess] = useState();
    const [withdrawFail, setWithdrawFail] = useState();

    const withdrowPass = (id) => {
        const confirm = window.confirm("Are you sure, you want to update to success this payout?")
        if (confirm) {
            const access_token = localStorage.getItem("token")
            const headers = {
                Authorization: `Bearer ${access_token}`
            }

            axios.post(baseUrl + `userwithdrawupdate/${id}`,
                {
                    status: "SUCCESS"
                },
                { headers })
                .then((res) => {
                    profle();
                    alert('Payout successfully done');
                }).catch((e) => {
                    //console.log(e);
                })
        }
    }


    const withdrowFail = (id) => {
        const confirm = window.confirm("Are you sure, you want to update to failed this payout?")
        if (confirm) {
            const access_token = localStorage.getItem("token")
            const headers = {
                Authorization: `Bearer ${access_token}`
            }

            axios.post(baseUrl + `userwithdrawupdate/${id}`,
                {
                    status: "FAILED"
                },
                { headers })
                .then((res) => {
                    profle();
                    alert('Payout successfully reject');
                    //console.log(res);
                }).catch((e) => {
                    //console.log(e);
                })
        }
    }

    const universalCheckPayout = (payment_gatway, txn_id, referenceId) => {
        //alert(payment_gatway);
        if(!referenceId){
            alert('Payout txn id not found')
        }
        if (payment_gatway == 'razorpay') {
            checkrazorpaypayout(txn_id, referenceId)
        }
        else if (payment_gatway == 'decentro') {
            checkpayout(txn_id, referenceId)
        }
        else if (payment_gatway == 'pinelab') {
            //checkPinelabpayout(txn_id, referenceId)
        } else {
            checkHaodapayout(txn_id, referenceId)
            
            alert('Nothing found');
        }
    }


    const checkpayout = (txn_id, referenceId) => {

        const access_token = localStorage.getItem("token")
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.post(baseUrl + `decentropayout/response`, { txn_id, referenceId }, { headers })
            .then((res) => {
                const icon = res.data.status == "SUCCESS" ? "success" : "danger";
                const title = res.data.status == "SUCCESS" ? "Withdraw successfully" : "Transaction Proccessing or Failed";

                profle();
                Swal.fire({
                    title: title,
                    icon: icon,
                    confirmButtonText: "OK",
                });

            })
            .catch((e) => {
                if (e.response.status == 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('token');
                    window.location.reload()
                }
            })
    }

    const checkHaodapayout = (txn_id, referenceId) => {

        const access_token = localStorage.getItem("token")
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.post(baseUrl + `withdraw/haoda/adminmanual`, { txn_id, referenceId }, { headers })
            .then((res) => {
                console.log("hhhh",res);
                const icon = res.data.status == "SUCCESS" ? "success" : "danger";
                const title = res.data.status == "SUCCESS" ? "Withdraw successfully" : "Transaction Proccessing or Failed";

                profle();
                Swal.fire({
                    title: title,
                    icon: icon,
                    confirmButtonText: "OK",
                });

            })
            .catch((e) => {
                if (e.response.status == 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('token');
                    window.location.reload()
                }
            })
    }
    
    const checkrazorpaypayout = (txn_id, referenceId) => {

        const access_token = localStorage.getItem("token")
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.post(baseUrl + `razorpaypayoutscheck/response`, { txn_id, referenceId }, { headers })
            .then((res) => {
                const icon = res.data.status == "SUCCESS" ? "success" : "danger";
                const title = res.data.status == "SUCCESS" ? "Withdraw successfully" : "Transaction Proccessing or Failed";

                profle();
                Swal.fire({
                    title: title,
                    icon: icon,
                    confirmButtonText: "OK",
                });

            })
            .catch((e) => {
                if (e.response.status == 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('token');
                    window.location.reload()
                }
            })
    }


    const dateFormat = (e) => {

        const date = new Date(e);
        const newDate = date.toLocaleString('default', { month: 'long', day: 'numeric', hour: 'numeric', hour12: true, minute: 'numeric' });
        return newDate;
    }

    let currentTime = Date.now();

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
                    <div className="card">
                        <div className="card-body text-light" style={{ backgroundColor: "rgba(0, 27, 11, 0.734)" }}>
                            <h4 className="card-title">withdrawal History and Manual Requests</h4>
                            <select className='form-control col-sm-1 m-1 bg-dark text-light' id='pagelimit' name='pagelimit' onChange={setpageLimit}>
                                <option value="10">Set limit</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>

                            {/* searching */}
                            <div className='row'>
                                <select className='form-control col-sm-3 m-2' id='searchType' name='searchtype' onChange={(e) => setSearchType(e.target.value)}>
                                    <option value="0">Select Search by</option>
                                    <option value="Name">Name</option>
                                    <option value="Phone">Phone</option>
                                </select>
                                <input type='text' placeholder='Search...' className='form-control col-sm-4 m-2' onChange={searchHandler} />
                                <h5>Or</h5>
                                <select className='form-control col-sm-3 m-2' id='findByStatus' name='findByStatus' onChange={searchByStatus}>
                                    <option value="0">Search Status</option>
                                    <option value="SUCCESS">Success</option>
                                    <option value="Pending">Pending</option>
                                    <option value="pending">pending</option>
                                    <option value="none">Proccessing</option>
                                    <option value="reject">Reject</option>
                                    <option value="FAILED">Failed</option>
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
                                            <th> type</th>
                                            <th> Account Details</th>
                                            <th> Amount </th>
                                            <th> Status </th>
                                            <th> Action </th>
                                            <th> Time </th>

                                        </tr>
                                    </thead>

                                    <tbody>
                                        {user && user.map((data, key) => {
                                            let currentTime = Date.now();
                                            let gameCreatedAt = new Date(data.createdAt).getTime();
                                            return (
                                                <tr>
                                                    <td>{key + 1}</td>
                                                    <td>{data._id}</td>
                                                    <td>
                                                        <span className="pl-2">{data.User_id ? data.User_id.Phone : ''}</span>
                                                    </td>
                                                    <td>{data.User_id && <Link className="btn btn-sm btn-outline-info" to={`/user/view_user/${data.User_id._id}`} >{data.User_id.Name}</Link>}</td>
                                                    <td>
                                                        <span className="pl-2">{data.Withdraw_type}</span>
                                                    </td>
                                                    <td>
                                                    {(data.Withdraw_type === 'UPI' || data.Withdraw_type === 'manualupi') &&
                                                    <p>
                                                        <span className="pl-2">UPI Id {data.User_id.upi_id}</span>
                                                    </p>
                                                    }
                                                    {data.Withdraw_type === 'upi'  &&
                                                    <p>
                                                        <span className="pl-2">UPI Id {data.User_id.upi_id}</span>
                                                    </p>
                                                    }
                                                        {(data.Withdraw_type == 'banktransfer' || data.Withdraw_type === 'mypaybank') &&
                                                        <p>
                                                        <br></br>
                                                        <span className="pl-2">Account Holder Name: <strong> {data.User_id?.holder_name} </strong></span>
                                                        <br></br>
                                                        <span className="pl-2">Account Number: <strong> {data.User_id?.account_number} </strong></span>
                                                        <br></br>
                                                        <span className="pl-2">Account IFSC: <strong> {data.User_id?.ifsc_code} </strong></span>
                                                        </p>
                                                        }
                                                    </td>
                                                    <td>{data.amount}</td>
                                                    <td className='font-weight-bold text-success'>{(data.status === "none") ? 'Proccessing' : data.status}</td>
                                                    <td>

                                                        { //data.Withdraw_type === 'mypaybank' && data.status != 'Pending' &&
                                                            //(data.status != 'SUCCESS' && data.status != 'FAILED') ? <button className="btn btn-danger" onClick={() => universalCheckPayout(data.payment_gatway, data._id, data.referenceId)} >Check {data.payment_gatway}</button> : 'Checked All or Wait'
                                                        }



                                                        { (data.Withdraw_type === 'UPI' || data.Withdraw_type === 'manualupi' || data.Withdraw_type == 'banktransfer') &&
                                                            (data.status != "SUCCESS" && data.status != "FAILED" && data.status!="reject")? <button className="mr-1 btn btn-sm btn-danger" onClick={() => withdrowFail(data._id)}>Fail</button> :''
                                                        }

                                                        { (data.Withdraw_type === 'UPI' || data.Withdraw_type === 'manualupi' ||  data.Withdraw_type == 'banktransfer') &&
                                                            (data.status != "SUCCESS" && data.status != "FAILED" && data.status!="reject")? <button className="ml-1 btn btn-sm btn-warning" onClick={() => withdrowPass(data._id)}>Success</button>:''
                                                        }


                                                    </td>
                                                    <td>{dateFormat(data.createdAt).split(',')[0]}</td>

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

export default SucWithdraw
