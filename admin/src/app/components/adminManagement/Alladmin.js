import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Alladmin() {

    const [Admin, setAdmin] = useState([])
    const [agent, setAgent] = useState([])
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
      var baseUrl = beckendLocalApiUrl;
    } else {
      baseUrl = beckendLiveApiUrl;
    }

    useEffect(() => {
        const access_token = localStorage.getItem('token')
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.get(baseUrl+`admin/all`, { headers })
            .then((res) => {
                setAdmin(res.data)
                console.log(res.data);
            })
            .catch((e) => {
                console.log(e);
            })
        axios.get(baseUrl+`agent/all`, { headers })
            .then((res) => {
                setAgent(res.data)
                console.log(res.data);
            })
            .catch((e) => {
                console.log(e);
            })
    }, [])

    if (Admin === undefined) {
        return null
    }

    return (
        <>

            {/* <h4 className='text-uppercase font-weight-bold my-3'>all Admin list</h4> */}
            <div className="row bg-dark ">
                <div className="col-12 grid-margin">
                    <div className="card bg-dark">
                        <div className="card-body text-light" style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
                            <h4 className="card-title text-light">all Admin list</h4>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th> ID</th>
                                            <th> Name</th>
                                            <th> Mobile </th>
                                            <th> Verified </th>
                                        </tr>
                                    </thead>
                                    {Admin.map((admin, key) => (

                                        <tbody key={admin._id} >
                                            <tr>
                                                <td>{key + 1}</td>
                                                <td>{admin._id}</td>
                                                <td>
                                                    <span className="pl-2">{admin.Name}</span>
                                                </td>
                                                <td>{admin.Phone}</td>
                                                <td>
                                                    <div className="badge badge-outline-success">Verified</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    ))}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 grid-margin">
                    <div className="card bg-dark">
                        <div className="card-body text-light" style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
                            <h4 className="card-title text-light">All Agent List</h4>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th> ID</th>
                                            <th> Name</th>
                                            <th> Mobile </th>
                                            <th> Verified </th>
                                            <th> Permissions </th>
                                        </tr>
                                    </thead>
                                    {agent.map((admin, key) => (

                                        <tbody key={key} >
                                            <tr>
                                                <td>{key + 1}</td>
                                                <td>{admin._id}</td>
                                                <td>
                                                    <span className="pl-2">{admin.Name}</span>
                                                </td>
                                                <td>{admin.Phone}</td>
                                                <td>
                                                    <div className="badge badge-outline-success">Verified</div>
                                                </td>
                                                
                                                <td>
                                                    <Link to={`/agent/permissions/${admin._id}`} type="button" className="btn btn-outline-info ">Grant Permission</Link>
                                                </td>
                                                
                                            </tr>
                                        </tbody>
                                    ))}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
