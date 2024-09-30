import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import axios from 'axios'


function Permissions() {
    let { id } = useParams();
    const [user, setUser] = useState();
    const [set, setSet] = useState();
    const access_token = localStorage.getItem("token")
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
      var baseUrl = beckendLocalApiUrl;
    } else {
      baseUrl = beckendLiveApiUrl;
    }

    const headers = {
        Authorization: `Bearer ${access_token}`
    }
    const getUser = () => {
        axios.get(baseUrl+`get_user/${id}`, { headers })
            .then((res) => {
                if (res.data.Permissions) {
                    if (res.data.Permissions.length) {
                        setSet(true);
                    }
                }
                setUser(res.data)
            }).catch((e) => {
                if (e.response.status == 401) {
                    localStorage.removeItem('token');
                }
            })
    }
    const grantAccess = () => {
        try {
            axios.patch(baseUrl+`agent/permission/${id}`, { headers })
                .then((res) => {
                    getUser();
                }).catch((e) => {
                    if (e.response.status == 401) {
                        localStorage.removeItem('token');
                    }
                })
        } catch (error) {
            console.log(error)
        }
    }
    const giveAccess = (Status,ID) => {
        try {
            axios.post(baseUrl+`agent/permission/nested/${ID}`,{
                Status
            }, { headers }) 
                .then((res) => {
                    getUser();
                }).catch((e) => {
                    if (e.response.status == 401) {
                        localStorage.removeItem('token');
                    }
                })
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        getUser();
    }, [])

    return (
        <div className="row ">
            <div className="col-12 grid-margin">
                {user && <div className="card">
                    {!Boolean(set) && <button type="button" className="btn btn-success btn-lg" onClick={grantAccess}>Grant Permissions</button>}
                    {Boolean(set) && <div className='card-body'>
                        <h4 className="card-title">Pages Permission</h4>
                        <ul className="list-group list-group-flush">
                            {user.Permissions.map((item, key) =>
                                <li key={key} className="list-group-item">
                                    <div>
                                        <div>
                                            {item.Permission}
                                        </div>
                                        <div>
                                            <div className="custom-control custom-switch">
                                                <input type="checkbox" checked={item.Status} onChange={(e)=>giveAccess(!(item.Status),item._id)} className="custom-control-input" id={item.Permission} />
                                                <label className="custom-control-label" htmlFor={item.Permission}>Allow to access</label>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>}
                </div>}
            </div>
        </div>
    )
}

export default Permissions