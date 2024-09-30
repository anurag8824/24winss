import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
const $ = require("jquery")
$.Datatable = require("datatables.net");



export default function Drop() {
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
      var baseUrl = beckendLocalApiUrl;
    } else {
      baseUrl = beckendLiveApiUrl;
    }

    const [challenge, setchallenge] = useState()

    const Allchallenge = async () => {
        const access_token = localStorage.getItem('token')
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.get(baseUrl+`challange/drop_challange`, { headers })
            .then((res) => {
                setchallenge(res.data)
                $('table').dataTable();
            })
    }

    const CancelGame = async (id) => {
        const confirm = window.confirm("are you sure to delete")

        if (confirm == true) {
            const access_token = localStorage.getItem('token')
            const headers = {
                Authorization: `Bearer ${access_token}`

            }
            axios.delete(baseUrl+`dropedchallange/delete/${id}`, { headers })
                .then((res) => {
                    console.log(res.data);
                    Allchallenge()
                })
        }
        else {
            window.alert("sorry try again")
        }
    }

    const dateFormat=(e)=>{
      
  const date = new Date(e); 
const newDate = date.toLocaleString('default', { month: 'long',day:'numeric',hour:'numeric',hour12:true,minute:'numeric' });
return newDate;
  }
  
  
    const [type, setType] = useState('running')
    const [bonus, setBonus] = useState('50')
    const update = (id) => {
        
        const access_token = localStorage.getItem("token")
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        if (type === "running") {
            const confirm = window.confirm("Are you sure, you want to running this game?")
            if (confirm) {
            axios.post(baseUrl + `challenge/runningon/${id}`,
                {
                    bonus: JSON.parse(bonus)
                },
                { headers })
                .then((res) => {
                    Allchallenge()
                })
            }
        } else {
            const confirm2 = window.confirm("Are you sure, you want to cancele this game?")
            if (confirm2) {
            axios.post(baseUrl + `challenge/cancelledon/${id}`,
                {
                    bonus: JSON.parse(bonus)
                },
                { headers })
                .then((res) => {
                    Allchallenge()
                })
            }
        }
    }
    
    useEffect(() => {
        Allchallenge()
    },[])

    if (challenge == undefined) {
        return null
    }

    return (
        <>
            {/* <h4 className='font-weight-bold my-3'>ALL CHALLANGES</h4> */}
            <div className="row ">
                <div className="col-12 grid-margin">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">DROP CHALLANGES</h4>
                            <div className="table-responsive">
                                <table className="table" >
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th> ID</th>
                                            <th> Creator</th>
                                            <th> Accepter</th>
                                            <th> Amount </th>
                                            <th> Status </th>
                                            <th> Action </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {challenge && challenge.map((game, key) => (
                                            <tr key={key}>
                                                <td>{key + 1}</td>
                                                <td>{game._id}</td>
                                                <td>
                                                    <span className="pl-2 ">{game.Created_by.Name}</span> | 
                                                    <span className="pl-2 ">{game.Created_by.Phone}</span>
                                                </td>
                                                
                                                <td>
                                                    <span className="pl-2">{game.Accepetd_By?game.Accepetd_By.Name:null}</span> | 
                                                    <span className="pl-2">{game.Accepetd_By?game.Accepetd_By.Phone:null}</span>
                                                </td>
                                                <td>{game.Game_Ammount}</td>
                                                <td className='text-primary font-weight-bold'>{game.Status}</td>
                                                <td>{game.Game_type}
                                                
                                                    <div className="row">
                                                        <div className="col-12 col-lg-5">
                                                            <input id="number" type="number" className="form-control input-sm" style={{ minWidth: '100px' }}
                                                                placeholder="Amount" onChange={(e) => setBonus(e.target.value)} />
                                                        </div>
                                                        <div className="col-12 col-lg-4">
                                                            <div className="form-group">
                                                                <select className="form-control input-sm" name="type" style={{ minWidth: '100px' }} onChange={(e) => setType(e.target.value)}>
                                                                    <option value="running">Running</option>
                                                                    <option value="cancelled">Cancelled</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-lg-3">
                                                            <button className="btn btn-sm btn-primary" onClick={() => update(game._id)}>UPDATE</button>
                                                        </div>
                                                    </div>
                                                    
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
        </>
    )
}
