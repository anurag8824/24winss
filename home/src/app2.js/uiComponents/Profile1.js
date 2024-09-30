import React, { useEffect, useState } from "react";
import "../css/layout.css";
import css from "../css/Profile.module.css";
import { Link, useHistory } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";
import axios from "axios";
// import { Link, useHistory } from 'react-router-dom';
// import Profile from './Profile';
// import { Image } from 'react-bootstrap';
import Rightcontainer from "../Components/Rightcontainer";
import Swal from "sweetalert2";
import Header from "../Components/Header";

const Profile1 = () => {
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }
  const [show, setShow] = useState(false);

  const [referral, setCode] = useState("");
  const [Id, setId] = useState(null);
  const [profile, setProfile] = useState();
  const [portcss, setPortcss] = useState(css.active_tab);
  const [portcss1, setPortcss1] = useState(css.inactive_tab);
  const [crushcss, setCrushcss] = useState(true);
  const [holder_name, setHolder_name] = useState();
  const [account_number, setAccount_number] = useState();
  const [ifsc_code, setIfsc_code] = useState();
  const [upi_id, setUpi_id] = useState();
  const history = useHistory();
  const logout = () => {
    let access_token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    axios
      .post(
        baseUrl + `logout`,
        {
          headers: headers,
        },
        { headers }
      )
      .then((res) => {
        // setUser(res.data)
        localStorage.removeItem("token");
        //window.location.reload();
        history.push("/login");
        window.location.reload(true);
      })
      .catch((e) => {
        // alert(e.msg)
      });
  };
  const UserALL = () => {
    let access_token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    axios
      .get(baseUrl + `me`, { headers })
      .then((res) => {
        setProfile(res.data);
        setId(res.data._id);
        TotalGame(res.data._id);
        setName(res.data.Name);
        setCode(res.data.referral);
        setHolder_name(res.data.holder_name);
        setAccount_number(res.data.account_number);
        setIfsc_code(res.data.ifsc_code);
        setUpi_id(res.data.upi_id);
      })
      .catch((e) => {
        // alert(e.msg)
      });
  };
  const [Name, setName] = useState();
  const UpdateProfile = async () => {
    const access_token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    const data = await axios
      .patch(
        baseUrl + `user/edit`,
        {
          Name,
        },
        { headers }
      )
      .then((res) => {
        console.log(res.data);
        if (res.data == "User name already exist!") {
          Swal.fire({
            title: res.data,
            icon: "error",
            confirmButtonText: "OK",
          });
        } else {
          setName(res.data);
          UserALL();
        }
      });
  };
  const updateBankDetails = async (e) => {
    e.preventDefault();
    const access_token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    const data = await axios
      .patch(
        baseUrl + `user/edit`,
        {
          holder_name,
          account_number,
          ifsc_code,
          upi_id,
        },
        { headers }
      )
      .then((res) => {
        console.log(res.data);
        if (res.status == 200) {
          setShow((prev) => !prev);
          UserALL();
          let message;
          message = res.data.msg;
          if (!res.data.msg) {
            message = "something went wrong";
          }
          Swal.fire({
            title: message,
            icon: res.data.submit ? "success" : "error",
            confirmButtonText: "OK",
          });
        }
      });
  };
  const update_RefCode = async () => {
    const access_token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    const data = await axios
      .patch(
        baseUrl + `user/edit`,
        {
          referral,
        },
        { headers }
      )
      .then((res) => {
        console.log(res.data);
        if (res.status == 200) {
          UserALL();
          let message;
          message = res.data.msg;
          if (!res.data.msg) {
            message = "Invalid referral Code";
          }
          Swal.fire({
            title: message,
            icon: res.data.submit ? "success" : "error",
            confirmButtonText: "OK",
          });
        }
      });
  };
  //// total game
  const [total, setTotal] = useState();
  const TotalGame = (Id) => {
    let access_token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };

    axios
      .get(baseUrl + `total/user/all/${Id}`, { headers })
      .then((res) => {
        setTotal(res.data);
      })
      .catch((e) => {});
  };

  const [pic, setPic] = useState();
  const Result = async (file) => {
    if (file) {
      const access_token = localStorage.getItem("token");
      // // console.log(access_token)
      const headers = {
        Authorization: `Bearer ${access_token}`,
      };

      const formData = new FormData();
      formData.append("avatar", file);

      // console.log(formData)
      await fetch(baseUrl + `users/me/avatar`, {
        method: "POST",
        body: formData,
        headers,
      }).then((res) => {
        UserALL();
      });
    }

    // await axios.patch(baseUrl+`challange/result/${path}`,
    //   {
    //     status: status
    //   },
    //   { headers })
    //   .then((res) => {
    //     // getPost(res.data)
    //     // console.log(res.data);
    //     history.push("/landing")
    // }).catch((e) => {
    //     // console.log(e);
    //   })
  };
  //avatar

  useEffect(() => {
    UserALL();
  }, []);

  return (
    <>
      <Header user={profile} />
      <div className="leftContainer" style={{ minHeight: "100vh" }}>
        <div
          className="mt-5 py-4 px-3"
          style={{ background: "rgb(250, 250, 250)" }}
        >
          <div className={`${css.center_xy} py-5`}>
            <label>
              <input
                className="d-none"
                type="file"
                onChange={(e) => Result(e.target.files[0])}
                accept="image/*"
                required
              />
              <picture>
                {/* {image} */}
                {console.log(process.env.PUBLIC_URL)}
                {profile && profile.avatar ? (
                  <img
                    height="80px"
                    width="80px"
                    src={baseUrl + `${profile && profile.avatar}`}
                    alt=""
                    style={{ borderRadius: "50px" }}
                  />
                ) : (
                  <img
                    height="80px"
                    width="80px"
                    src={process.env.PUBLIC_URL + `/user.png`}
                    alt=""
                    style={{ borderRadius: "50px" }}
                  />
                )}
              </picture>
            </label>
            <span className={`${css.battle_input_header} mr-1`}>
              {profile && profile.Phone}
            </span>
            <div
              className={`text-bold my-3 ${portcss} font-weight-bold `}
              style={{ fontSize: "1em" }}
            >
              {profile && profile.Name}
              <img
                className={`ml-2`}
                width="20px"
                src={process.env.PUBLIC_URL + "/Images/icon-edit.jpg"}
                alt=""
                onClick={() => {
                  setPortcss(css.inactive_tab);
                  setPortcss1(css.active_tab);
                }}
              />
            </div>
            <div className={`text-bold my-3 ${portcss1}`}>
              <div
                className={`${css.MuiFormControl_root} ${css.MuiTextField_root}`}
                style={{ verticalAlign: "bottom" }}
              >
                <div
                  className={`${css.MuiInputBase_root} ${css.MuiInput_root} ${css.MuiInput_underline} ${css.MuiInputBase_formControl} ${css.MuiInput_formControl}`}
                >
                  <input
                    aria-invalid="false"
                    type="text"
                    maxLength={"20"}
                    className={`${css.MuiInputBase_input} ${css.MuiInput_input}`}
                    placeholder="Enter Username"
                    value={Name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </div>
              </div>
              <img
                className="ml-2"
                width="20px"
                src={
                  process.env.PUBLIC_URL + "/Images/select-blue-checkIcon.png"
                }
                alt=""
                onClick={() => {
                  setPortcss(css.active_tab);
                  setPortcss1(css.inactive_tab);
                  UpdateProfile(Id);
                }}
              />
            </div>
            <Link
              className={`${css.profile_wallet} d-flex align-items-center`}
              style={{ width: "90%" }}
              to="/wallet"
            >
              <picture className="ml-4">
                <img
                  width="32px"
                  src={process.env.PUBLIC_URL + "/Images/sidebar-wallet.png"}
                  alt=""
                />
              </picture>
              <div className={`${css.mytext} ml-5 text-muted`}>My Wallet</div>
            </Link>
          </div>
        </div>
        <div className={css.divider_x}></div>
<center>
    <div className="p-3" style={{ background: 'white' }}>
                    <div className={css.text_bold}>
                        Complete Profile
                    </div>
                    <div className="">

                        <div >
                            <div>
                                <div className="" style={{}}>
                                    <Link className={`d-flex align-items-center ${css.profile_wallet} bg-light mx-1 my-4 py-5`} style={{ backgroundColor: 'whitesmoke' }} to={(profile && profile.verified === `unverified`) ? `/Kyc2` : `/Profile` }>
                                        <picture className="ml-4">
                                            <img width="50px" src={process.env.PUBLIC_URL + "/Images/kyc-icon-new.png"} alt="" className="" />
                                        </picture>
                                        <div className={`ml-5 ${css.mytext} text-muted`}>
                                            {profile && profile.verified === `unverified` ? 'Complete KYC' : profile && profile.verified === 'pending' ? 'In Process' : profile && profile.verified === 'verified' ? "Completed Kyc ✅" : "Completed Kyc ✅"}                                        </div>
                                    </Link>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>

</center>


        <div className={css.divider_x}></div>
        {profile && !profile.referral && (
          <div className="px-3 py-1">
            <div
              className={`d-flex align-items-center ${css.position_relative}`}
              style={{ height: "84px" }}
            >
              <picture>
                <img
                  height="32px"
                  width="32px"
                  src={process.env.PUBLIC_URL + "Images/Header/referEarn.png"}
                  alt=""
                  className="snip-img"
                />
              </picture>
              <div className="pl-4">
                <div
                  className={`${css.text_uppercase} ${css.moneyBox_header}`}
                  style={{ fontSize: "1rem" }}
                >
                  Use Refer Code
                </div>
                <div className="d-flex">
                  <input
                    type="text"
                    className={css.MuiInputBase_input}
                    aria-describedby="basic-addon1"
                    value={referral}
                    onChange={(e) => {
                      setCode(e.target.value);
                    }}
                  />
                  <button
                    style={{ backgroundColor: "transparent", border: "none" }}
                    onClick={() => {
                      update_RefCode();
                    }}
                  >
                    <img
                      width="20px"
                      className="ml-2"
                      src={
                        process.env.PUBLIC_URL +
                        "/Images/select-blue-checkIcon.png"
                      }
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="px-3 py-1">
          <div
            className={`d-flex align-items-center ${css.position_relative}`}
            style={{ height: "84px" }}
          >
            <picture>
              <img
                height="40px"
                width="40px"
                src={
                  process.env.PUBLIC_URL +
                  "/Images/global-cash-won-green-circular.png"
                }
                alt=""
                className="snip-img"
              />
            </picture>
            <div className="pl-4">
              <div
                className={`${css.text_uppercase} ${css.moneyBox_header}`}
                style={{ fontSize: "1em" }}
              >
                Cash Won
              </div>
              <div className="">
                <picture className="mr-1">
                  <img
                    height="auto"
                    width="21px"
                    src={
                      process.env.PUBLIC_URL + "/Images/global-rupeeIcon.png"
                    }
                    alt=""
                    className="snip-img"
                  />
                </picture>
                <span
                  className={css.moneyBox_text}
                  style={{ fontSize: "1em", bottom: "-1px" }}
                >
                  {profile && profile.wonAmount}
                </span>
              </div>
              <span className={css.thin_divider_x}></span>
            </div>
          </div>
        </div>
        <div className="px-3 py-1">
          <div
            className={`d-flex align-items-center ${css.position_relative}`}
            style={{ height: "84px" }}
          >
            <picture>
              <img
                height="32px"
                width="36px"
                src={process.env.PUBLIC_URL + "/Images/battleplayed.png"}
                alt=""
                className=""
              />
            </picture>
            <div className="pl-4">
              <div
                className={`${css.text_uppercase} ${css.moneyBox_header}`}
                style={{ fontSize: "1em" }}
              >
                Battle Played
              </div>
              <div className="snip-div">
                <span
                  className={css.moneyBox_text}
                  style={{ fontSize: "1em", bottom: "-1px" }}
                >
                  {total && total}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-3 py-1">
          <div
            className={`d-flex align-items-center ${css.position_relative}`}
            style={{ height: "84px" }}
          >
            <picture>
              <img
                height="32px"
                width="32px"
                src={
                  process.env.PUBLIC_URL +
                  "/Images/referral-signup-bonus-new.png"
                }
                alt=""
                className="snip-img"
              />
            </picture>
            <div className="pl-4">
              <div
                className={`${css.text_uppercase} ${css.moneyBox_header}`}
                style={{ fontSize: "1em" }}
              >
                Referral Earning
              </div>
              <div className="">
                <span
                  className={css.moneyBox_text}
                  style={{ fontSize: "1em", bottom: "-1px" }}
                >
                  {profile && profile.referral_earning}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={css.divider_x}></div>
        <div className="p-3 snipcss-A1eLC snip-div">
          <Link
            to="/login"
            className={`${css.center_xy}  text-uppercase py-4 font-weight-bolder text-muted`}
            onClick={(e) => logout(e)}
          >
            Log Out
          </Link>
        </div>
      </div>
      <div className="rightContainer">
        <Rightcontainer />
      </div>
      {/* <ModalProfile style3={
                profileModalstyle
            } Enter={Enter}/> */}
      <div className={css.kyc_select} id="profileModal">
        <div className={css.overlay} />
        <div
          className={`${css.box}`}
          style={{
            bottom: "0px",
            position: "absolute",
          }}
        >
          <div className={css.bg_white}>
            <div className={`${css.header} ${css.cxy} ${css.flex_column}`}>
              <picture>
                <img
                  height="80px"
                  width="80px"
                  src={process.env.PUBLIC_URL + "/Images/avatars/Avatar2.png"}
                  alt=""
                />
              </picture>
              <div className={`${css.header_text} mt-2`}>Choose Avatar</div>
            </div>
            <div className="mx-3 pb-3" style={{ paddingTop: "200px" }}>
              <div className="row justify-content-between col-10 mx-auto">
                <img
                  height="50px"
                  width="50px"
                  src={process.env.PUBLIC_URL + "/Images/avatars/Avatar1.png"}
                  alt=""
                />
                <img
                  height="50px"
                  width="50px"
                  src={process.env.PUBLIC_URL + "/Images/avatars/Avatar2.png"}
                  alt=""
                />
                <img
                  height="50px"
                  width="50px"
                  src={process.env.PUBLIC_URL + "/Images/avatars/Avatar3.png"}
                  alt=""
                />
                <img
                  height="50px"
                  width="50px"
                  src={process.env.PUBLIC_URL + "/Images/avatars/Avatar4.png"}
                  alt=""
                />
              </div>
              <div className="row justify-content-between col-10 mx-auto mt-3">
                <img
                  height="50px"
                  width="50px"
                  src={process.env.PUBLIC_URL + "/Images/avatars/Avatar5.png"}
                  alt=""
                />
                <img
                  height="50px"
                  width="50px"
                  src={process.env.PUBLIC_URL + "/Images/avatars/Avatar6.png"}
                  alt=""
                />
                <img
                  height="50px"
                  width="50px"
                  src={process.env.PUBLIC_URL + "/Images/avatars/Avatar7.png"}
                  alt=""
                />
                <img
                  height="50px"
                  width="50px"
                  src={process.env.PUBLIC_URL + "/Images/avatars/Avatar8.png"}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Profile1;
