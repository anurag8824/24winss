import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation,Link } from 'react-router-dom'

export default function ViewKyc() {
    
    const [data, setData] = useState()
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }

     
  useEffect(() => {
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.get(baseUrl+`aadharcard/all/all/all`, { headers })
      .then((res) => {
        setData(res.data)
        console.log(res.data)
      })
  },[])

if(data==undefined){
    return null
}

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h4>View KYC</h4>
                        </div>
                        
                        
                      
                        <div className="card-body">
                            <div className="row" style={{ marginBottom: '-2rem' }}>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input type="text" className="form-control" value={data.Name} disabled />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input type="text" className="form-control" value={data.phone} disabled />
                                    </div>
                                </div>
                            </div>
                            <div className="row" style={{ marginBottom: '-2rem' }}>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label>Document Type</label>
                                        <input type="text" className="form-control" value={data.DocumentType} disabled />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <img src={data.Document} alt="Document" />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>KYC Status Date</label>
                                        <input type="text" className="form-control" value={data.KYCStatusDate} disabled />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-9">
                                    <div className="form-group">
                                        <Link to="/user/UserKyc" className="btn btn-primary">Back</Link>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <Link to="/user/UserKyc" className="btn btn-primary">Reject</Link>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <Link to="/user/UserKyc" className="btn btn-primary">Accept</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                         
                    </div>
                </div>
            </div>
        </div>
    )


}