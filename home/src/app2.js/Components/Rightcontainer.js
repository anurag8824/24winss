import React from 'react'
import { useState, useEffect } from 'react';

const Rightcontainer = () => {
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    
    if(nodeMode==="development"){
    var baseUrl = beckendLocalApiUrl;
    }else{
     baseUrl = beckendLiveApiUrl
    }

  const [WebSitesettings, setWebsiteSettings] = useState("");

  const fetchData = async () => {
    const response = await fetch(baseUrl + "settings/data");
    const data = await response.json();
    return setWebsiteSettings(data);
  }
  document.title=(WebSitesettings)?WebSitesettings.WebTitle:'win real cash';
  //console.log(WebSitesettings);
  useEffect(() => {
    fetchData();
  },[])

  return (
    <div>
         <div className='rightContainer'>
                <div className="rcBanner flex-center ">
                    <picture className="rcBanner-img-container animate__bounce infinite ">
                        <img src="/Images/LandingPage_img/Header_profile.jpg" alt="nothing"/>
                    </picture>
                    <div className="rcBanner-text " style={{fontWeight:'bolder'}}>{(WebSitesettings)?WebSitesettings.WebsiteName:''} <span className="rcBanner-text-bold" style={{fontWeight:'normal'}}>Win Real Cash</span></div>
                    <div className="rcBanner-footer">For best experience, open&nbsp;<a href="/" style={{
                        color: 'rgb(44, 44, 44)',
                        fontWeight: 500, textDecoration: 'none'
                    }}>{(WebSitesettings)?WebSitesettings.WebsiteName:''}</a>&nbsp;on&nbsp;<img src={process.env.PUBLIC_URL + '/Images/chrome.png'}
                        alt="" />&nbsp;chrome mobile</div>
                </div>
            </div>
    </div>
  )
}

export default Rightcontainer