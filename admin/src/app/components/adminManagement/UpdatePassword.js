import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

export default function UpdatePassword() {

    const history = useHistory()

    const [Password, setPassword] = useState()
    const [newPassword, setNewPassword] = useState()
    const [confirmNewPassword, setCPassword] = useState()
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
      var baseUrl = beckendLocalApiUrl;
    } else {
      baseUrl = beckendLiveApiUrl;
    }



    const addAdmin = async (e) => {

        e.preventDefault();

        const access_token = localStorage.getItem("token")

        const headers = {
            Authorization: `Bearer ${access_token}`
        }

        if (newPassword !== confirmNewPassword) {
            alert("Passwords don't match");
        } else {
            const data = await axios.post(baseUrl+"changepassword", {
                Password,
                newPassword,
                confirmNewPassword,
            },
                { headers }).then((res) => {

                    history.push("/admin/alladmins")
                })
        }
    }

    return (
        <div>
            <h4 className='text-uppercase font-weight-bold my-3'>Update Admin Passowrd</h4>

            <form id="add_admin_form" onSubmit={(e) => addAdmin(e)}>
                <div className="form-row">
                    <div className="form-group col-md-4">
                        <label htmlFor="passowrd">Password</label>
                        <input type="password" className="form-control" id="password" name="password" placeholder="Passowrd" onChange={(e) => {
                            setPassword(e.target.value)
                        }} required />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-4">
                        <label htmlFor="passowrd">New Password</label>
                        <input type="password" className="form-control" id="password" name="password" placeholder="Passowrd" onChange={(e) => {
                            setNewPassword(e.target.value)
                        }} required />
                    </div>

                </div>
                <div className="form-row">
                    <div className="form-group col-md-4">
                        <label htmlFor="passowrd">cPassword</label>
                        <input type="password" className="form-control" id="password" name="password" placeholder="Passowrd" onChange={(e) => {
                            setCPassword(e.target.value)
                        }} required />
                    </div>

                </div>
                <div>
                    <button type="submit" className='btn  btn-success' >update</button>
                </div>
            </form>

        </div>
    )
}
