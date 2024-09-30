import React, { useEffect, useState } from "react";
import css from "../css/Mywallet.module.css";
import Rightcontainer from "../Components/Rightcontainer";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";

const Mywallet = () => {
  const history = useHistory();
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }
  let access_token = localStorage.getItem("token");
  access_token = localStorage.getItem("token");
  const [user, setUser] = useState();
  useEffect(() => {
    let access_token = localStorage.getItem("token");
    access_token = localStorage.getItem("token");
    if (!access_token) {
      window.location.reload();
      history.push("/login");
    }
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    axios
      .get(baseUrl + `me`, { headers })
      .then((res) => {
        setUser(res.data);
      })
      .catch((e) => {
        console.log(e);
        if (e.response?.status == 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("token");
          window.location.reload();
          history.push("/login");
        }
      });
  }, []);

  return (
    <>
      <div className="leftContainer">
        <div className="main_area" style={{ paddingTop: "14%" }}>
          <div
            className="p-4 bg-light"
            style={{ border: "1px solid #e0e0e0", borderRadius: "5px" }}
          >
            <Link
              className={`d-flex align-items-center ${css.profile_wallet} undefined`}
              to="/transaction-history"
            >
              <picture className="ml-4">
                <img
                  width="32px"
                  src={
                    process.env.PUBLIC_URL + "/Images/Header/order-history.png"
                  }
                  alt=""
                />
              </picture>
              <div className={`ml-5 ${css.mytext} text-muted `}>
                Order History
              </div>
            </Link>
          </div>
        </div>
        <div
          className={`${css.divider_x} XXsnipcss_extracted_selector_selectionXX snipcss0-0-0-1 tether-target-attached-top tether-abutted tether-abutted-top tether-element-attached-top tether-element-attached-center tether-target-attached-center`}
        ></div>
        <div className="p-4 bg-light">
          <div className={css.wallet_card}>
            <div className="d-flex align-items-center">
              <picture className="mr-1">
                <img
                  height="26px"
                  width="26px"
                  src={
                    process.env.PUBLIC_URL +
                    "Images/LandingPage_img/global-rupeeIcon.png"
                  }
                  alt=""
                />
              </picture>
              <span
                className="text-white"
                style={{ fontSize: "1.3em", fontWeight: "900" }}
              >
                ₹{user && user.Wallet_balance}
              </span>
            </div>
            <div
              className="text-white text-uppercase"
              style={{ fontSize: "0.9em", fontWeight: "800" }}
            >
              Deposit Cash
            </div>
            <div className={`${css.my_text} mt-5`}>
              Can be used to play Tournaments &amp; Battles.
              <br />
              Cannot be withdrawn to Paytm or Bank.
            </div>
            <Link to="/addcase">
              <button
                className={`${css.walletCard_btn} d-flex justify-content-center align-items-center text-uppercase`}
              >
                Add Cash
              </button>
            </Link>
          </div>
          <div className={css.wallet_card2}>
            <div className="d-flex align-items-center">
              <picture className="mr-1">
                <img
                  height="26px"
                  width="26px"
                  src={
                    process.env.PUBLIC_URL +
                    "Images/LandingPage_img/global-rupeeIcon.png"
                  }
                  alt=""
                />
              </picture>
              <span
                className="text-white"
                style={{ fontSize: "1.3em", fontWeight: "900" }}
              >
                ₹{user && user.withdrawAmount}
              </span>
            </div>
            <div
              className="text-white text-uppercase"
              style={{ fontSize: "0.9em", fontWeight: "800" }}
            >
              Winning Cash
            </div>
            <div className={`${css.my_text2} mt-5`}>
              Can be withdrawn to Paytm or Bank. Can be used to play Tournaments
              &amp; Battles.
            </div>
            <Link to="/Withdrawopt">
              <button
                className={`${css.walletCard_btn} d-flex justify-content-center align-items-center text-uppercase`}
              >
                Withdraw
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="rightContainer">
        <div>
          <Rightcontainer />
        </div>
      </div>
    </>
  );
};
export default Mywallet;
