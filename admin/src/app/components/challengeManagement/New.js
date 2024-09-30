import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
const $ = require("jquery")
$.Datatable = require("datatables.net");



export default function New() {
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
        axios.get(baseUrl+`challange/new_challange`, { headers })
            .then((res) => {
                console.log(res)
                setchallenge(res.data)
                $('table').dataTable();
            })
    }

    const CancelGame = async (id) => {
        const confirm = window.confirm("are you sure to cancel")

        if (confirm == true) {
            const access_token = localStorage.getItem('token')
            const headers = {
                Authorization: `Bearer ${access_token}`

            }
            axios.patch(baseUrl+`challange/Cancel/${id}`, { Cancelled_by: access_token }, { headers })
                .then((res) => {
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
                            <h4 className="card-title">NEW CHALLANGES</h4>
                            <div className="table-responsive">
                                <table className="table" >
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th> ID</th>
                                            <th> Creator</th>
                                            <th> Amount </th>
                                            <th> Status </th>
                                            <th> Game Type </th>
                                            <th>Date</th>
                                            <th> Action </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {challenge && challenge.map((game, key) => (
                                            <tr key={key}>
                                                <td>{key + 1}</td>
                                                <td>{game._id}</td>
                                                <td>
                                                    <span className="pl-2 ">{game.Created_by.Name}</span>
                                                </td>
                                                
                                                
                                                <td>{game.Game_Ammount}</td>
                                                <td className='text-primary font-weight-bold'>{game.Status}</td>
                                                <td>{game.Game_type}</td>
                                               <td>{dateFormat(game.createdAt).split(',')[0]} </td>
                                                <td>
                                                    <Link type='button' className="btn btn-primary mx-1"to={`/view/${game._id}`}>View</Link>
                                                    {/* {game.Status != "cancelled" && game.Status != "completed" && game.Status != "conflict" && <button type='button' className="btn  mx-1 btn-danger" onClick={() => CancelGame(game._id)}>Cancel</button>} */}
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
