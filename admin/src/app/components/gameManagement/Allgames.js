import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function Allgames() {

    const [game, setGame] = useState()
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }



    const loadGame = () => {
        const access_token = localStorage.getItem('token')

        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.get(baseUrl+`game/type`, { headers })
            .then((res) => {
                setGame(res.data)
            })
    }
    const deleteRecord = (_id) => {
        const confirmBox = window.confirm(
            `are you sure ${game.Game}`
        )
        if (confirmBox === true) {
            const access_token = localStorage.getItem("token")

            const headers = {
                Authorization: `Bearer ${access_token}`
            }
            axios.delete(baseUrl+`game/delete/${_id}`, { headers })
                .then((result) => {
                    loadGame();
                })
                .catch(() => {
                    alert('Error in the Code');
                });
        }
    };


    useEffect(() => {
        loadGame()


    }, [])




    if (game === undefined) {
        return null
    }
    return (
        <>
            <h4 className='font-weight-bold my-3'>All Game Type LIST</h4>
            <div className="row ">
                <div className="col-12 grid-margin">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Order Status</h4>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th> ID</th>
                                            <th> Game</th>
                                            <th> Action </th>
                                        </tr>
                                    </thead>
                                    {game.map((game, key) => (


                                        <tbody key={game._id}>
                                            <tr>
                                                <td>{key + 1}</td>
                                                <td>{game._id}</td>
                                                <td>
                                                    <span className="pl-2">{game.Game}</span>
                                                </td>
                                                <td>
                                                    <div className="badge badge-outline-danger" onClick={() => {

                                                        deleteRecord(game._id)

                                                    }}>delete</div>
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
