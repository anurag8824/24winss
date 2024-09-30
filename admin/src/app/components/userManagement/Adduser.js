import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

export default function Adduser() {

    const history = useHistory()

    const [Name, setName] = useState()
    const [Phone, setPhone] = useState()
    const [Email, setEmail] = useState()
    const [Password, setPassword] = useState()
    const [cPassword, setCPassword] = useState()
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }


    const addUser1 = async (e) => {
        e.preventDefault()
        if (Password == cPassword) {
            axios.post(baseUrl+`register`, {
                Name,
                Phone,
                Email,
                Password,
                cPassword,

            }).then((res) => {
                history.push("/user/allusers")
            })
        } else {
            alert("Some thing wrong ! confirm password and Password didn't match !")
        }

    }


    const location = useLocation();
    const path = location.pathname.split("/")[3];

    // const [user, setProduct] = useState()


    const getPost = async () => {
        // alert(Name)
        const access_token = localStorage.getItem("token")
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        const data = await axios.patch(baseUrl+`admin/edit/user/${path}`, {
            Name,
            Phone,
            Email,
        }, { headers })
            .then((res) => {
                // console.log(res.data)
                setName(res.data.Name)
                setEmail(res.data.Email)
                setPhone(res.data.Phone)



            })
        .catch((e) => alert("Add new user Here"))


    }

    useEffect(() => {
        getPost()
    }, [path])




    if (path == undefined) {
        return (
            <div>
                <h4 className='font-weight-bold my-3'>ADD NEW USER</h4>
                <form id="add_user_form" action="" style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
                    <div className="form-row">
                        <div className="form-group col-md-4">
                            <label htmlFor="name">Name</label>
                            <input type="text" className="form-control" id="name" name="name" placeholder="Name" onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="form-group col-md-4">
                            <label htmlFor="mobile">Mobile</label>
                            <input type="text" className="form-control form-control" maxLength={10} id="mobile" name="mobile" placeholder="MObile" onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div className="form-group col-md-4">
                            <label htmlFor="email">Email</label>
                            <input type="email" className="form-control" id="email" name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="passowrd">Password</label>
                            <input type="password" className="form-control" id="password" name="password" placeholder="Passowrd" onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="mobile">Confirm Password</label>
                            <input type="password" className="form-control" id="confirm_password" name="confirm_password" placeholder="Confirm Passowrd" onChange={(e) => setCPassword(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="verificationrequired" name="verificationrequired" defaultChecked />
                            <label className="form-check-label" htmlFor="verificationrequired">
                                OTP Verification required during first time login.
                            </label>
                        </div>
                    </div>
                    <button className="btn btn-success float-right" onClick={(e) => addUser1(e)} > Add User</button>
                </form>

            </div >
        )
    }
    else {
        return (
            <div>

                <h4 className='font-weight-bold my-3'>Update User</h4>
                <div id="add_user_form" >
                    <div className="form-row">
                        <div className="form-group col-md-4">
                            <label htmlFor="name">Name</label>
                            <input type="text" className="form-control" id="name" name="name" placeholder="Name" onChange={(e) => setName(e.target.value)} value={Name} />
                        </div>
                        <div className="form-group col-md-4">
                            <label htmlFor="mobile">Mobile</label>
                            <input type="text" className="form-control form-control" maxLength={10} id="mobile" name="mobile" placeholder="MObile" onChange={(e) => setPhone(e.target.value)} value={Phone} />
                        </div>
                        <div className="form-group col-md-4">
                            <label htmlFor="email">Email</label>
                            <input type="email" className="form-control" id="email" name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={Email} />
                        </div>
                    </div>
                    {/* <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="passowrd">Password</label>
                            <input type="password" className="form-control" id="password" name="password" placeholder="Passowrd" />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="mobile">Confirm Password</label>
                            <input type="password" className="form-control" id="confirm_password" name="confirm_password" placeholder="Confirm Passowrd" />
                        </div>
                    </div> */}

                    <button className="btn btn-success float-right" onClick={(e) => getPost(e)} > Update User</button>
                </div>

            </div >
        )
    }

}

