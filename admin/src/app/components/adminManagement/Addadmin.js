import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

export default function Addadmin() {

    const history = useHistory()
    const [Name, setName] = useState()
    const [Phone, setPhone] = useState()
    const [Password, setPassword] = useState()
    const [cPassword, setCPassword] = useState()
    const [type, setType] = useState("Admin")
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

        if (Password !== cPassword) {
            alert("Passwords don't match");
        } else {
            const data = await axios.post(baseUrl+"admin/register", {
                Name,
                Phone,
                Password,
                user_type:type
            }).then((res) => {
                console.log(res);
                history.push("/admin/alladmins")
            }).catch((err)=>alert(err));
        }
    }

    return (
        <div>
        <h4 className='text-uppercase font-weight-bold my-3 text-light'>Add New Admin</h4>

        <form id="add_admin_form text-white" action="" method="post" style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
            <div className="form-row">
                <div className="form-group col-md-4">
                    <label htmlFor="name">Name</label>
                    <input type="text" className="form-control" id="name" name="name" placeholder="Name" onChange={(e) => {
                        setName(e.target.value)
                    }} />
                </div>
                <div className="form-group col-md-4">
                    <label htmlFor="mobile">Mobile</label>
                    <input type="text" className="form-control form-control" maxLength={10} id="mobile" name="mobile" placeholder="MObile" onChange={(e) => setPhone(e.target.value)} />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group col-md-4">
                    <label htmlFor="passowrd">Type</label>
                    <select class="form-control" name="" id="" onChange={(e)=>setType(e.target.value)}>
                        <option value="Admin">Admin</option>
                        <option value="Agent">Agent</option>
                    </select>
                </div>
                <div className="form-group col-md-4">
                    <label htmlFor="passowrd">Password</label>
                    <input type="password" className="form-control" id="password" name="password" placeholder="Passowrd" onChange={(e) => {
                        setPassword(e.target.value)
                    }} />
                </div>
                <div className="form-group col-md-4">
                    <label htmlFor="mobile">Confirm Password</label>
                    <input type="password" className="form-control" id="confirm_password" name="confirm_password" placeholder="Confirm Passowrd" onChange={(e) => setCPassword(e.target.value)} />
                </div>
                <div className="form-group col-md-8">
                    <button type="submit" className="btn btn-success float-right" onClick={(e) => addAdmin(e)}>ADD ADMIN</button>
                </div>
            </div>

        </form>

    </div>
)
}
