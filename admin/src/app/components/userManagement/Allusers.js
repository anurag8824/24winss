import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactPaginate from 'react-paginate'
const $ = require("jquery")
$.Datatable = require("datatables.net");
export default function Allusers() {
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
    const [findByuserStatus, setFindByuserStatus] = useState("");

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
   const searchByStatus = (event)=>{
    let key = event.target.value
    setFindByStatus(key);
    setFindByuserStatus(key);
    }

    const [user, setUser] = useState(false)
    const getUser = async () => {
        const access_token = localStorage.getItem("token")
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        const data = await axios.get(baseUrl+`User/all?page=${pageNumber}&_limit=${limit}&_q=${searchList}&_stype=${searchType}&_status=${findByStatus}&_Userstatus=${findByuserStatus}`, { headers })
            .then((res) => {
                setUser(res.data.admin)
                setNumberOfPages(res.data.totalPages)
                // $('table').dataTable();
            }).catch((e) => alert(e))
    }

    const blockPlayer = (player) => {
        const confirmBox = window.confirm(`are you sure block ${player.Name}`);
        if (confirmBox === true) {
            const access_token = localStorage.getItem("token")
            const headers = {
                Authorization: `Bearer ${access_token}`
            }
            const userType = player.user_type == 'Block' ? 'User' : 'Block';
            axios.post(baseUrl+`block/user/${player._id}`, { user_type: userType }, { headers })
                .then((res) => {
                    getUser(res.data)
                    console.log(res.data);
                })
        }

    }

    useEffect(() => {
        getUser()
    }, [pageNumber, limit, searchList, searchType,findByStatus,findByuserStatus])


    return (
        user && <div>
            <h4 className='font-weight-bold my-3'>All USER LIST</h4>
            <div className="row">
                <div className="col-12 grid-margin">
                    <div className="card text-white">
                        <div className="card-body text-light" style={{backgroundColor:"rgb(4 54 24)"}}>
                            <h4 className="card-title">Users List</h4>

                            {/* searching */}
                            <div className='row'>
                                <select className='form-control col-sm-3 m-2' id='searchType' name='searchtype' onChange={(e) => setSearchType(e.target.value)}>
                                    <option value="0">Select Search by</option>
                                    <option value="Name">Name</option>
                                    <option value="Phone">Phone</option>
                                    <option value="_id">User Id</option>
                                </select>
                                <input type='text' placeholder='Search...' className='form-control col-sm-4 m-2' onChange={searchHandler} />
                            
                                <h5>Or</h5>
                            <select  className='form-control col-sm-3 m-2' id='findByStatus' name='findByStatus' onChange={searchByStatus}>
                                <option value="0">Search Status</option>
                                <option value="verified">verified</option>
                                <option value="unverified">unverified</option>
                                <option value="Block">Blocked</option>
                                <option value="hold_balance">Hold</option>
                            </select>

                            <select  className='form-control col-sm-1 m-1 bg-dark text-light' id='pagelimit' name='pagelimit' onChange={setpageLimit}>
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
                                            <th> Name</th>
                                            <th> Mobile </th>
                                            <th> Balance </th>
                                            <th> MissMatch</th>
                                            <th>Game hold</th>
                                            <th> Refer Code </th>
                                            <th> Reffered By </th>
                                            <th> Verified </th>
                                            <th> Action </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {user.map((user, key) => (
                                            <tr key={user._id}>
                                                <td>{key + 1}</td>
                                                <td>{user._id}</td>
                                                <td>
                                                    <span className="pl-2 text-primary">{user.Name}</span>
                                                </td>
                                                <td className='text-success'>
                                                <a className="cxy flex-column" href={`https://api.whatsapp.com/send?phone=+91${user.Phone}&text=Hello`}>
                                                {user.Phone}
                                                </a>
                                                </td>
                                                <td>₹{user.Wallet_balance}</td>



                                                <td className={`${((user.Wallet_balance - ((user.wonAmount + user.totalDeposit + user.referral_earning + user.totalBonus) - (user.loseAmount + user.totalWithdrawl + user.referral_wallet + user.withdraw_holdbalance + user.hold_balance + user.totalPenalty))) != 0) ? 'text-danger' : 'text-success'}`}>₹ {(user.Wallet_balance - ((user.wonAmount + user.totalDeposit + user.referral_earning + user.totalBonus) - (user.loseAmount + user.totalWithdrawl + user.referral_wallet + user.withdraw_holdbalance + user.hold_balance + user.totalPenalty)))}</td>
                                                <td>{user.hold_balance}</td>
                                                <td className='text-success'>{user.referral_code}</td>
                                                <td className='text-success'>{user.referral}</td>
                                                <td>
                                                    <div className="badge badge-outline-success">{user.verified}</div>
                                                </td>
                                                <td>
                                                    <button type='button' className={`btn  mx-1 ${user.user_type == 'Block' ? 'btn-success' : 'btn-danger'}`} onClick={() => { blockPlayer(user) }}>{
                                                        user.user_type == "Block" ? "Unblock" : "Block"
                                                    }</button>
                                                    <Link type='button' className="btn btn-info mx-1" to={`/user/adduser/${user._id}`}>Edit User</Link>
                                                    <Link type='button' className="btn btn-primary mx-1" to={`/user/view_user/${user._id}`}>View</Link>
                                                </td>
                                            </tr>
                                        ))}
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
        </div>
    )
}
