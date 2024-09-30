import axios from 'axios';
import React, { Component, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

const Register = () => {
  const history = useHistory()

  const [Name, setName] = useState()
  const [Phone, setPhone] = useState()
  const [Password, setPassword] = useState()
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }



  const handleClick = async (e) => {
    e.preventDefault()

    const { data } = await axios.post(baseUrl+`admin`, {
      Name,
      Phone,
      Password,

    }).then((res) => {
      const token = res.data.data;
      localStorage.setItem("token", token)


      history.push("/dashboard")
    })
  }

  return (
    <div>
      <div className="d-flex align-items-center auth px-0 h-100">
        <div className="row w-100 mx-0">
          <div className="col-lg-4 mx-auto">
            <div className="card text-left py-5 px-4 px-sm-5">
              <div className="brand-logo">
                <img src={require("../../assets/images/logo.svg")} alt="logo" />
              </div>
              <h4>New here?</h4>
              <h6 className="font-weight-light">Signing up is easy. It only takes a few steps</h6>
              <form className="pt-3">
                <div className="form-group">
                  <input type="text" className="form-control form-control-lg" id="exampleInputUsername1" placeholder="Username"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input type="email" className="form-control form-control-lg" id="exampleInputEmail1" placeholder="Email"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input type="password" className="form-control form-control-lg" id="exampleInputPassword1" placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="mb-4">
                  <div className="form-check">
                    <label className="form-check-label text-muted">
                      <input type="checkbox" className="form-check-input" />
                      <i className="input-helper"></i>
                      I agree to all Terms & Conditions
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                  <Link className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn" to="/dashboard">SIGN UP</Link>
                </div>
                <div className="text-center mt-4 font-weight-light">
                  Already have an account? <Link to="/user-pages/login" className="text-primary">Login</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
