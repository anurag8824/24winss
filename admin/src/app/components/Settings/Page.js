import axios from 'axios';
import React, { useState } from 'react'
import { Button } from 'react-bootstrap';

import Text from './Text';

function Pages() {

    const [Desc, setDescription] = useState("")
    const [Type, setType] = useState()
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }


    const SubmitData = (e) => {
        // e.preventDefault();
        const access_token = localStorage.getItem('token')
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.post(baseUrl+`api/term/condition`,
            {

                Type,
                Desc,

            },
            { headers })
            .then((res) => {
                alert("ok")
            })
    }
    const UpdateData = () => {
        // e.preventDefault();
        const access_token = localStorage.getItem('token')
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.post(baseUrl+`api/term/condition/${Type}`,
            {

                Desc,

            },
            { headers })
            .then((res) => {

                console.log(res.data);
            })
    }
    const getdata = (type) => {
        // e.preventDefault();
        const access_token = localStorage.getItem('token')
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.get(baseUrl+`api/term/condition/${type}`,

            { headers })
            .then((res) => {

                setDescription(res.data[0].Desc);
            })
    }

    return (
        <>
            {/* <Text value={decs} setvalue={setDescription} /> */}

            <div style={{ height: "35px", display: "flex", justifyContent: "flex-end" }}>
                <select className="pl-5" onChange={(e) => { getdata(e.target.value); setType(e.target.value) }} style={{ borderRadius: "7px" ,width:"250px" ,fontSize:"1.2rem" }}>
                    <option value="none"> selected Type</option>
                    <option value="term-condition" >term-condition</option>
                    <option value="About-Us">About-Us</option>
                    <option value="Privacy_Policy">Privacy Policy</option>
                    <option value="Refund_Policy">Refund Policy</option>
                    <option value="Game_Rules">Game Rules</option>
                </select>
            </div>

            <div className='mt-3'>

                <Text value={Desc} setvalue={setDescription} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button className='mt-4' style={{ borderRadius: "7px",height:"35px",width:"200px"}} onClick={UpdateData}>submit</Button>
        </>
    )
}

export default Pages