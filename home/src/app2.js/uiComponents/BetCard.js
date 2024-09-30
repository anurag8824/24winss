import React, { memo } from 'react'
import css from "../Modulecss/Home.module.css";
import { Link } from "react-router-dom";
import acceptSound from "./accept.mp3";
import findGif from "../css/loading_old.gif";
import playSound from "./play.mp3";
const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
const nodeMode = process.env.NODE_ENV;
if (nodeMode === "development") {
  var baseUrl = beckendLocalApiUrl;
} else {
  baseUrl = beckendLiveApiUrl;
}
const BetCard = React.memo(({ allgame, user, deleteChallenge, getPost, RejectGame, winnAmount, AcceptChallang, updateChallenge }) => {
  
  // if(user == allgame.Created_by._id && allgame.Status == "new"){
  //   setTimeout(() => {
  //     alert('bettle timeout');
  //     deleteChallenge(allgame._id);
  //   }, 60000);
  // }
  
  return (<div className={`${css.betCard} mt-2`}>
    <span
      className={`${css.betCardTitle} pl-3 d-flex align-items-center text-uppercase ${css.betTitleDiv}`}
    >
      CHALLENGE FROM
      <span className="ml-1" style={{ color: "blue" }}>
        {allgame.Created_by.Name}
      </span>
      {user == allgame.Created_by._id &&
        allgame.Status == "new" && (
          <button
            className={`ml-auto mx-1 btn-dark btn-sm`}
            onClick={() => deleteChallenge(allgame._id)}
          >
            DELETE 
          </button>
        )}
      {user == allgame.Created_by._id &&
        allgame.Status == "requested" && (<div className="d-flex ml-auto align-items-center">

            <Link to={{ pathname: `/viewgame1/${allgame._id}`, state: { prevPath: window.location.pathname } }}  onClick={(e) => getPost(allgame._id)} style={{ bottom: '0' }}>
          <button 
            className={`bg-success position-relative mx-1 btn-sm text-white btn-inverse-success`}
          >
            START
          </button>
          </Link>
          <button
            className={`text-white bg-danger position-relative mx-1 btn-sm btn-outline-youtube`}
            onClick={() => RejectGame(allgame._id)} style={{ bottom: '0' }}
          >
            REJECT
          </button>
        </div>
        )}
    </span>
    <div className={`d-flex pl-3 ${css.betBodyDiv}`}>
      <div className="pr-3 pb-1">
        <span className={css.betCardSubTitle}>Entry Fee</span>
        <div>
          <img
            src={
              process.env.PUBLIC_URL +
              "/Images/LandingPage_img/global-rupeeIcon.png"
            }
            alt=""
            width="21px"
          />
          <span className={css.betCardAmount}>
            {allgame.Game_Ammount}
          </span>
        </div>
      </div>
      <div>
        <span className={css.betCardSubTitle}>Prize</span>
        <div>
          <img
            src={
              process.env.PUBLIC_URL +
              "/Images/LandingPage_img/global-rupeeIcon.png"
            }
            alt=""
            width="21px"
          />
          <span className={css.betCardAmount}>
            {allgame.Game_Ammount +
              winnAmount(allgame.Game_Ammount)}
          </span>
        </div>
      </div>
      {user !== allgame.Created_by._id &&
        allgame.Status == "new" && (
          <button
            className={`${css.bgSecondary} ${css.playButton} ${css.cxy}`}
            onClick={() => AcceptChallang(allgame._id)}
          >
            Play
          </button>
        )}
      {/* {user == allgame.Accepetd_By._id && allgame.Status == 'running' && <button className={`${css.bgSecondary} ${css.playButton} ${css.cxy}`} >start</button>} */}
      {user == allgame.Created_by._id &&
        allgame.Status == "new" && (
          <div className="text-center col-5 ml-auto mt-auto mb-auto">
            <div className="pl-2 text-center">
                <img
                  src={findGif}
                  style={{ width: "15px", height: "15px" }}
                />
            </div>
            <div style={{ lineHeight: 1 }}>
              <span className={css.betCard_playerName}>
                Finding Player!
              </span>
            </div>
          </div>
        )}
      {user !== allgame.Created_by._id &&
        allgame.Status == "requested" && (
          <div className="d-flex ml-auto align-items-center">
            <div
              className={`${css.bgSecondary} ${css.playButton} ${css.cxy} position-relative mx-1 text-white btn-sm`}
            >
              requested
            </div>
            <button
              className={`${css.bgSecondary} ${css.playButton} ${css.cxy} position-relative mx-1 bg-danger btn-sm`}
              onClick={() => RejectGame(allgame._id)}
            >
              cancel
            </button>
          </div>
        )}
      {user !== allgame.Created_by._id &&
        allgame.Status == "running" && (

          <div className="d-flex ml-auto align-items-center">
            <audio src={playSound} autoPlay>
            </audio>
            <Link
              className={`${css.bgSecondary} ${css.playButton} ${css.cxy} bg-success btn-sm'`}
              to={{ pathname: `/viewgame1/${allgame._id}`, state: { prevPath: window.location.pathname } }}
              onClick={(e) => updateChallenge(allgame._id)}
            >
              start
            </Link>
          </div>
        )}
      {user == allgame.Created_by._id &&
        allgame.Status == "requested" && (
          <div className="d-flex ml-auto align-items-center mr-5 mt-1">
            <audio src={acceptSound} autoPlay>
            </audio>
           
            <div className="text-center col">
              <div className="pl-2">
                {allgame.Accepetd_By.avatar ? (<img
                  src={baseUrl+`${allgame.Accepetd_By.avatar}`}
                  alt=""
                  width='40px' height="40px"
                  style={{ borderTopLeftRadius: "50%", borderTopRightRadius: "50%", borderBottomRightRadius: "50%", borderBottomLeftRadius: "50%", marginTop: "5px" }}
                />) : (<img
                  src={`https://hiplay.in/user.png`}
                  alt=""
                  width='40px' height="40px"
                  style={{ borderTopLeftRadius: "50%", borderTopRightRadius: "50%", borderBottomRightRadius: "50%", borderBottomLeftRadius: "50%", marginTop: "5px" }}
                />)}
              </div>
              <div style={{ lineHeight: 1 }}>
                <span className={css.betCard_playerName}>
                  {allgame.Accepetd_By.Name}
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  </div>)
})

export default memo(BetCard);