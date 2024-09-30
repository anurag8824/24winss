import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Rightcontainer from "../Components/Rightcontainer";
//import Header from "../Components/Header";
import "../css/terms.css";
import axios from "axios";
//import { Interweave } from "interweave";
const RefundPolicy = () => {
  const [data, setData] = useState()
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;

  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    var baseUrl = beckendLiveApiUrl
  }

  const [WebSitesettings, setWebsiteSettings] = useState("");
    const fetchData = async () => {
      const response = await fetch(baseUrl + "settings/data");
      const data = await response.json();
      return setWebsiteSettings(data);
    }

  const getdata = () => {
    axios.get(baseUrl + `api/term/condition/Refund_Policy`)
      .then((res) => {
        setData(res.data[0].Desc);
        // console.log(res.data[0].Type);
      })
  }
  useEffect(() => {
    getdata();
    fetchData();
  }, [])

  return (
    <div>
      <div className="leftContainer" style={{ minHeight: '100vh', height: '100%' }}>

        <div className="mt-5 py-4 px-3">
          <div className="m-3">
            <h1>Refund Policy</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/" >Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Refund Policy
                </li>
              </ol>
            </nav>
            <h4><strong>Refund Policy</strong></h4>

            <>
              <p className="p1">Refund Policy</p>
              <p className="p2">
                Thanks for being a patron with {(WebSitesettings) ? WebSitesettings.CompanyName : ''} (referred
                as “{(WebSitesettings) ? WebSitesettings.WebsiteName : ''}”)<span className="Apple-converted-space">&nbsp; </span>. If you
                are not entirely satisfied with your subscription, we are here to help.
              </p>
              <p className="p1">Refund</p>
              <p className="p2">
                Once we receive your Refund request, we will inspect it and notify you on
                the status of your refund.
              </p>
              <p className="p2">
                If your refund request is approved, we will initiate a refund to your credit
                card (or original method of payment) within 7 working days. You will receive
                the credit within a certain amount of days, depending on your card issuer's
                policies.
              </p>
              <p className="p2">
                In case of unforeseen technical glitch, {(WebSitesettings) ? WebSitesettings.CompanyName : ''}
                would refund subscription upon reviewing the complaint. Final decision lies
                with the company.
              </p>
            </>

          </div>
        </div>
      </div>
      <div className="rightContainer">
        <Rightcontainer />
      </div>
    </div>
  );
};
export default RefundPolicy;