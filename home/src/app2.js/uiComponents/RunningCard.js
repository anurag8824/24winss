import React from "react";
import css from "../Modulecss/Home.module.css";
import { Link } from "react-router-dom";
import avtar1 from "../Avtar/Avatar1.png";
import avtar2 from "../Avtar/Avatar2.png";
import avtar3 from "../Avtar/Avatar3.png";
import avtar4 from "../Avtar/Avatar4.png";

export default function RunningCard({ runnig, user, winnAmount, game_type }) {
  const avatars = [avtar1, avtar2, avtar3, avtar4];
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }

  function getRandomAvatar() {
    const randomIndex = Math.floor(Math.random() * avatars.length);
    return avatars[randomIndex];
  }

  const randomAvatar = getRandomAvatar();

  return (
    <div className={`${css.betCard} mt-1`}>
      <div className="d-flex">
        <span
          className={`${css.betCardTitle} pl-3 d-flex align-items-center text-uppercase`}
        >
          PLAYING FOR
          <img
            className="mx-1"
            src={
              process.env.PUBLIC_URL +
              "/Images/LandingPage_img/global-rupeeIcon.png"
            }
            alt=""
            width="21px"
          />
          {runnig.Game_Ammount}
        </span>
        {(user == runnig.Accepetd_By._id || user == runnig.Created_by._id) && (
          <Link
            className={`${css.bgSecondary} ${css.playButton} ${
              css.cxy
            } position-relative m-2 mx-1 ${
              runnig.Status == "conflict" ? "bg-danger" : "bg-success"
            }`}
            style={{
              right: "0px",
              top: "-6px",
              padding: "10px 17px",
            }}
            to={{
              pathname: `/viewgame1/${runnig._id}`,
              state: { prevPath: window.location.pathname },
            }}
          >
            view
          </Link>
        )}
        <div
          className={`${css.betCardTitle} d-flex align-items-center text-uppercase`}
        >
          <span className="ml-auto mr-3">
            PRIZE
            <img
              className="mx-1"
              src="/Images/LandingPage_img/global-rupeeIcon.png"
              alt=""
              width="21px"
            />
            {runnig.Game_Ammount + winnAmount(runnig.Game_Ammount)}
          </span>
        </div>
      </div>
      <div className="py-1 row">
        <div className="pr-3 text-center col-5">
          {/* {console.log("https://nightking.com/user.png")} */}
          <div className="pl-2">
            {runnig.Created_by.avatar ? (
              <img
                src={
                  baseUrl + `${runnig.Created_by && runnig.Created_by.avatar}`
                }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = { getRandomAvatar };
                }}
                alt=""
                width="33px"
                height="33px"
                style={{
                  borderTopLeftRadius: "50%",
                  borderTopRightRadius: "50%",
                  borderBottomRightRadius: "50%",
                  borderBottomLeftRadius: "50%",
                }}
              />
            ) : (
              <img
                src={getRandomAvatar()}
                alt=""
                width="33px"
                height="33px"
                style={{
                  borderTopLeftRadius: "50%",
                  borderTopRightRadius: "50%",
                  borderBottomRightRadius: "50%",
                  borderBottomLeftRadius: "50%",
                }}
              />
            )}
          </div>
          <div style={{ lineHeight: 1 }}>
            <span className={css.betCard_playerName}>
              {runnig.Created_by.Name}
            </span>
          </div>
        </div>
        <div className="pr-3 text-center col-2 cxy">
          <div>
            <img
              src={process.env.PUBLIC_URL + "/Images/Homepage/versus.png"}
              alt=""
              width="21px"
            />
          </div>
        </div>
        <div className="text-center col-5">
          <div className="pl-2">
            {/* {console.log(getRandomAvatar(),'getRandomAvatar')} */}
            {/* {console.log(runnig.Accepetd_By)} */}
           

            {runnig?.Accepetd_By.avatar ? (
              <img
                src={
                  baseUrl + `${runnig.Accepetd_By && runnig.Accepetd_By.avatar}`
                }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getRandomAvatar();
                }}
                alt=""
                width="33px"
                height="33px"
                style={{
                  borderTopLeftRadius: "50%",
                  borderTopRightRadius: "50%",
                  borderBottomRightRadius: "50%",
                  borderBottomLeftRadius: "50%",
                }}
              />
            ) : (
              <img
                src={getRandomAvatar()}
                alt=""
                width="33px"
                height="33px"
                style={{
                  borderTopLeftRadius: "50%",
                  borderTopRightRadius: "50%",
                  borderBottomRightRadius: "50%",
                  borderBottomLeftRadius: "50%",
                }}
              />
            )}
          </div>
          <div style={{ lineHeight: 1 }}>
            <span className={css.betCard_playerName}>
              {runnig.Accepetd_By.Name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
