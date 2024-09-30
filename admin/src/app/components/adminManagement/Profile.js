import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

export default function Profile() {

    const history = useHistory()

    const [Name, setName] = useState()
    const [Phone, setPhone] = useState()
    // const [user, setProfile] = useState()
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




        const data = await axios.patch(baseUrl+"user/edit", {
            Name,
            Phone
        },
            { headers }).then((res) => {

                history.push("/dashboard")
            })

    }




    return (
        <div>
            <h4 className='text-uppercase font-weight-bold my-3'>Update Admin Profile</h4>

            <form id="add_admin_form" onSubmit={(e) => addAdmin(e)}>
                <div className="form-row">
                    <div className="form-group col-md-4">
                        <label htmlFor="passowrd">Name</label>
                        <input type="name" className="form-control" id="name" name="password" placeholder="name" onChange={(e) => {
                            setName(e.target.value)
                        }} required value={Name && Name} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-4">
                        <label htmlFor="passowrd">Mobile</label>
                        <input type="tel" className="form-control" id="Phone" name="password" placeholder="phone" onChange={(e) => {
                            setPhone(e.target.value)
                        }} required value={Phone && Phone} />
                    </div>

                </div>

                <button type="submit" className='btn btn-success'>submit</button>

            </form>

        </div>
    )
}