import React, { useEffect, useState } from 'react'
import { Interweave } from "interweave";
import axios from "axios";

function AboutUs() {
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
      var baseUrl = beckendLocalApiUrl;
    } else {
      baseUrl = beckendLiveApiUrl;
    }

    const [data, setData] = useState()
    const getdata = () => {

        // e.preventDefault();
        // const access_token = localStorage.getItem('token')
        // const headers = {
        //   Authorization: `Bearer ${access_token}`
        // }
        axios.get(baseUrl+`api/term/condition/About-Us`)
            .then((res) => {

                setData(res.data[0].Desc);
                // console.log(res.data[0].Type);
            })
    }

    useEffect(() => {
        getdata()
    }, [])


    return (
        <div className="px-3 py-4 mt-5">
            <Interweave content={data && data} />
        </div>
    )
}

export default AboutUs