import axios from 'axios'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

export default function Addgame() {

    const history = useHistory()
    const [Game, setGame] = useState()

    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }


    const AddGame = async (e) => {
        e.preventDefault();
        const data = await axios.post(baseUrl+`game/type`, {
            Game

        }).then((res) => {

            history.push("/game/allgames")
        })
    }

    return (
        <div>
            <h4 className='font-weight-bold my-3'>ADD GAME TYPE</h4>
            <form id="add_admin_form" action="" method="post">
                <div className="form-row">
                    <div className="form-group col-md-4">
                        <label htmlFor="name">Name</label>
                        <input type="text" className="form-control" id="name" name="name" placeholder="Name" onChange={(e) => setGame(e.target.value)} />
                    </div>
                </div>
                <div className='form-row'>
                    <div className='col-md-8'>
                        <button type="submit" className="btn btn-success float-right" onClick={(e) => AddGame(e)}>ADD GAME TYPE</button>
                    </div>
                </div>
            </form>

        </div>
    )
}
