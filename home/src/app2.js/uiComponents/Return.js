import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Rightcontainer from "../Components/Rightcontainer";
import "../css/Loader.css";
import findGif from "../css/loading.gif";
function Return({ walletUpdate }) {
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }

  const history = useHistory();
  var url_string = window.location.href; //window.location.href
  var url = new URL(url_string);

  var client_txn_id = url.searchParams.get("client_txn_id");
  var txn_id = url.searchParams.get("txn_id");
  if (client_txn_id && txn_id) {
    var order_id = client_txn_id;
    var order_token = txn_id;
  } else {
    var order_id = url.searchParams.get("order_id");
    var order_token = url.searchParams.get("order_token");
  }

  const [status, setStatus] = useState();
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
    if (client_txn_id && txn_id) {
      axios
        .post(
          baseUrl + `depositupipay/response`,
          { order_id, order_token },
          { headers }
        )
        .then((res) => {
          setStatus(res.data.status);
          const icon = res.data.status == "PAID" ? "success" : "danger";
          const title =
            res.data.status == "PAID"
              ? "Deposit submited successfully"
              : "Transaction Failed";
          walletUpdate();
          history.push("/landing");
          setTimeout(() => {
            Swal.fire({
              title: title,
              icon: icon,
              confirmButtonText: "OK",
            });
          }, 1000);
        })
        .catch((e) => {
          if (e.response?.status == 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("token");
            window.location.reload();
            history.push("/login");
          }
        });
    } else {
      axios
        .post(
          baseUrl + `deposit/response`,
          { order_id, order_token },
          { headers }
        )
        .then((res) => {
          setStatus(res.data.status);
          const icon = res.data.status == "PAID" ? "success" : "danger";
          const title =
            res.data.status == "PAID"
              ? "Deposit submited successfully"
              : "something went wrong";
          walletUpdate();
          history.push("/");
          setTimeout(() => {
            Swal.fire({
              title: title,
              icon: icon,
              confirmButtonText: "OK",
            });
          }, 1000);
        })
        .catch((e) => {
          if (e.response?.status == 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("token");
            window.location.reload();
            history.push("/login");
          }
        });
    }
  }, []);

  return (
    <>
      <div
        className="leftContainer"
        style={{
          position: "relative",
          minHeight: "100vh",
          height: "100%",
          paddingTop: "60px",
        }}
      >
        <div className="loaderReturn">
          <img src={findGif} style={{ width: "15px", height: "15px" }} />
        </div>
      </div>
      <div className="rightContainer">
        <Rightcontainer />
      </div>
    </>
  );
}

export default Return;
