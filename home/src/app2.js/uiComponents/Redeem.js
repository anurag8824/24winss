import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import css from "../css/Addcase.module.css";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import Rightcontainer from "../Components/Rightcontainer";
import Swal from "sweetalert2";

const Redeem = ({ walletUpdate }) => {
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }
  const history = useHistory();

  const [amount, setamount] = useState();
  const [userAllData, setUserAllData] = useState();
  const role = async () => {
    const access_token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    await axios
      .get(baseUrl + `me`, { headers })
      .then((res) => {
        //console.log(res.data);
        setUserAllData(res.data);
      })
      .catch((e) => {
        if (e.response?.status == 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("token");
        }
      });
  };

  useEffect(() => {
    let access_token = localStorage.getItem("token");
    access_token = localStorage.getItem("token");
    if (!access_token) {
      window.location.reload();
      history.push("/login");
    }
    role();
  }, []);

  const deposit = () => {
    if (amount && amount >= 95 && amount <= 100000) {
      const access_token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${access_token}`,
      };

      axios
        .post(baseUrl + `referral/to/wallet`, { amount }, { headers })
        .then((res) => {
          walletUpdate();
          if (res.data.msg === "Invalid Amount") {
            Swal.fire({
              title: "You don't have sufficient amount",
              icon: "warning",
              confirmButtonText: "OK",
            });
          } else {
            Swal.fire({
              title: "success",
              icon: "success",
              confirmButtonText: "OK",
            });
          }
        })
        .catch((e) => {
          alert(e);
          if (e.response?.status == 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("token");
            window.location.reload();
            history.push("/login");
          }
        });
    } else {
      let msg = "Enter Amount";
      if (!amount) {
        msg = "Enter Amount";
      } else if (95 <= amount <= 100000) {
        msg = "Amount should be more than 95.";
      }
      Swal.fire({
        title: msg,
        icon: "Error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      <Header user={userAllData} />
      <div
        className="leftContainer"
        style={{ minHeight: "100vh", height: "100%" }}
      >
        <div className="mt-5 py-4 px-3">
          <div className="games-section mt-2">
            <div className="games-section-title">Redeem your refer balance</div>
            <div
              className="games-section-headline mt-2"
              style={{ fontSize: "0.85em" }}
            >
              TDS (0%) will be deducted after annual referral earning of
              ₹15,000.
            </div>
          </div>
          <div className="games-section-headline mt-2">
            Enter Amount (Min: 100, Max: 10000)
          </div>
          <div>
            <div className="MuiFormControl-root MuiTextField-root mt-4 ">
              <input
                class="w3-input input"
                type="number"
                style={{ width: "100%" }}
                value={amount}
                placeholder="Enter Amount"
                onChange={(e) => setamount(parseInt(e.target.value))}
              ></input>
              <small className="text-warning">
                Minimum withdrawal amount ₹95
              </small>
              <p className="MuiFormHelperText-root">
                Money will be added to cash.
              </p>
            </div>
            <button
              className="refer-button cxy  bg-primary mt-5"
              style={{ width: "29%" }}
              onClick={() => deposit()}
            >
              Redeem
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Redeem;
