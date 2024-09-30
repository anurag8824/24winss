import React, {useEffect, useState} from 'react'

const Sitedatas = () => {
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
      var baseUrl = beckendLocalApiUrl;
    } else {
      baseUrl = beckendLiveApiUrl;
    }
    
    const [WebSitesettings, setWebsiteSettings] = useState("");
    const fetchData = async () => {
      const response = await fetch(baseUrl + "settings/data");
        const data = await response.json();
        return setWebsiteSettings(data);
    }
    console.log(WebSitesettings);
    useEffect(() => {
      fetchData();
    },[])
    return (
    WebSitesettings
  )
}

export default Sitedatas;
