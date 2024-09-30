import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
const $ = require("jquery")
$.Datatable = require("datatables.net");
export default function Allusers() {

    const [user, setUser] = useState(false)
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }

    const getUser = async () => {
        const access_token = localStorage.getItem("token")
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        const data = await axios.get(baseUrl+`User/all`, { headers })
            .then((res) => {
                setUser(res.data)
            $('table').dataTable();
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
    }, [])




    return (
        user && <div>
            <h4 className='font-weight-bold my-3'>All USER LIST</h4>
            <div className="row ">
                <div className="col-12 grid-margin">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Order Status</h4>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th> ID</th>
                                            <th> Name</th>
                                            <th> Mobile </th>
                                            <th> Balance </th>
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
                                                <td className='text-success'>{user.Phone}</td>
                                                <td>₹{user.Wallet_balance}</td>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}