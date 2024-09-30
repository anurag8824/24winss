import React, { useEffect, useRef, useState } from "react";
import "../css/layout.css";
import css from "../Modulecss/Home.module.css";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
//import Rightcontainer from "../Components/Rightcontainer";
// import { useNavigate } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import BattleCard from "./Battelcard";
import BetCard from "./BetCard";
import RunningCard from "./RunningCard";
import Header from "../Components/Header";
import socket from "./socketconnection" 
import cssp from "../css/Battellist.css"
//import { Alert } from "@mui/material";3 


export default function HomepageGame({ walletUpdate }) {
  //const history = useHistory();
//   let userID = useRef();
//   const isMounted = useRef(true);
// const socket = getSocket();
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }
  // user details start

//   const [user, setUser] = useState();
//   const [mount, setMount] = useState(false);


//   const [userAllData, setUserAllData] = useState();

//   const role = async () => {
//     const access_token = localStorage.getItem("token");
//     const headers = {
//       Authorization: `Bearer ${access_token}`,
//     };
//     await axios
//       .get(baseUrl + `me`, { headers })
//       .then((res) => {
//         setUser(res.data._id);
//         setUserAllData(res.data);
//         userID.current = res.data._id;
//         setMount(true);
//       })
//       .catch((e) => {
//         if (e.response?.status === 401) {
//           localStorage.removeItem("token");
//           localStorage.removeItem("token");
//           window.location.reload();
//           setTimeout(() => {
//             //  history.push("/login")
//           }, 500);
//         }
//         if (e.response?.status === 400 || e.response?.status === 429) {
//           Swal.fire({
//             title: "Please refresh!",
//             icon: "warning",
//             confirmButtonText: "OK",
//           });
//         } else {
//           Swal.fire({
//             title: "Please refresh!",
//             icon: "warning",
//             confirmButtonText: "OK",
//           });
//         }
//       });
//   };


  // const navigate = useNavigate();
const history = useHistory();
  const handelClick = (Fee)=>{
      console.log(Fee);
      socket.emit("joinBet",Fee)
      
  }

  const handelclickForRejoin =()=>{
    const gameId = localStorage.getItem("gameId");
    console.log("local storage game Id ",gameId)
    socket.emit("rejoin",{gameId},()=>{
      console.log("socket id ",socket.id)
    })
  }

    socket.on("playerJoined", (msg) => {
      console.log(msg);
    });
  
    socket.on("OnePlayer", (msg) => {
      console.log("searching for your partner", msg);
      // localStorage.setItem("gameId", msg);
    });
  
useEffect(()=>{
    socket.on("startGame",(msg)=>{
        console.log('start game')
        console.log(msg);
        localStorage.setItem("gameId",msg.gameId);
        // localStorage.setItem("socketId",socket.id);
        // console.log("gameId",localStorage.getItem("gameId"), "socketId", localStorage.getItem("socketId"))
        // navigate
       history.push(`/ludo/${msg.gameId}`, { state: { Data: msg } });
    })


    return ()=>{
        socket.off("startGame")
    }
},[socket])

socket.on("playerJoined",(msg)=>{
    console.log("when both two player is meets",msg)
})

// useEffect(() => {
//     let access_token = localStorage.getItem("token");
//     access_token = localStorage.getItem("token");
//     if (!access_token) {
//       window.location.reload();
//       setTimeout(() => {
//         //  history.push("/login")
//       }, 500);
//     }
//     role();
//     if (mount) {
//     //   Allgames();
//     //   runningGame();
//     }
//   }, [mount]);

  /// user details end

 

  return (
    <>
      {/* <div className="hello">Hello world</div>  */}



     {/* <Header user={userAllData} /> */}
      <div className="leftContainer" style={{ minHeight: "100vh" }}>
        <div
          className={css.mainArea}
          style={{ paddingTop: "60px", minHeight: "100vh" }}
        >
        
         <div className="header_top_message">
        <span>Commission: 5% ◉ Referral: 2% For All Games No TDS,No GST</span>
        </div>
        
      <div className="additional_message" style={{ marginTop: "20px", fontSize: "1.1em", color: "#f9f9f9", backgroundColor: "#E15252", padding: "10px", borderRadius: "5px" }}>
            ◉ कुछ समय के लिए एक बार में 2000 के ऊपर डिपॉजिट बंद है, 2000 के ऊपर पैसे ऐड करने के लिए व्हाट्सएप सपोर्ट पर बात करें या 3,4 बार में 2,2 करके ऐड करें..
         </div>
        
       
          {/* <span className={${css.cxy} ${css.battleInputHeader} mt-4}>
            Create a Battle!
          </span>

          <div className="mx-auto d-flex my-2 w-50">
            <div>
              <input
                className={css.formControl}
                type="Number"
                placeholder="Amount"
                onChange={(e) => setGame_Ammount(e.target.value)}
              />
            </div>

            <div className="set ml-1 ">
              {" "}
              <button
                className={`bg-primary ${css.playButton} cxy m-1 position-static `}
                style={{ margin: "20px !important" }}
                onClick={(e) => {
                  e.preventDefault();
                  ChallengeCreate();
                }}
              >
                Set
              </button>
            </div>
          </div>
          <div className={css.dividerX}></div>

          <div className="px-4 py-3">
            <div className="mb-3">
              <img
                src={process.env.PUBLIC_URL + "/Images/Homepage/battleIcon.png"}
                alt=""
                width="20px"
              />
              <span className={ml-2 ${css.gamesSectionTitle}}>
                Open Battles
              </span>
              <span
                className={${css.gamesSectionHeadline} text-uppercase position-absolute mt-2 font-weight-bold}
                style={{ right: "1.5rem" }}
              >
                <NavLink to="/Rules">
                  Rules
                  <img
                    className="ml-2"
                    src={process.env.PUBLIC_URL + "/Images/Homepage/info.png"}
                    alt=""
                  />
                </NavLink>
              </span>
            </div>

            {created &&
              created.map(
                (allgame) =>
                  allgame.Game_type == game_type && (
                    <BetCard
                      key={allgame._id}
                      allgame={allgame}
                      user={user}
                      deleteChallenge={deleteChallenge}
                      getPost={getPost}
                      RejectGame={RejectGame}
                      winnAmount={winnAmount}
                      AcceptChallang={AcceptChallang}
                      updateChallenge={updateChallenge}
                    />
                  )
              )}
            {allgame &&
              allgame.map(
                (allgame) =>
                  (allgame.Status == "new" ||
                    (allgame.Status == "requested" &&
                      (user == allgame.Created_by._id ||
                        user == allgame.Accepetd_By._id)) ||
                    (allgame.Status == "running" &&
                      user == allgame.Accepetd_By._id &&
                      allgame.Acceptor_seen == false)) &&
                  allgame.Game_type == game_type && (
                    <BetCard
                      key={allgame._id}
                      allgame={allgame}
                      user={user}
                      deleteChallenge={deleteChallenge}
                      getPost={getPost}
                      RejectGame={RejectGame}
                      winnAmount={winnAmount}
                      AcceptChallang={AcceptChallang}
                      updateChallenge={updateChallenge}
                    />
                  )
              )}
          </div>
          <div className={css.dividerX}></div>
          <div className="px-4 py-3">
            <div className="mb-2">
              <img
                src={process.env.PUBLIC_URL + "/Images/Homepage/battleIcon.png"}
                alt=""
                width="20px"
              />
              <span className={ml-2 ${css.gamesSectionTitle}}>
                Running Battles
              </span>
            </div>
            {ownRunning &&
              ownRunning.map((runnig) => {
                if (
                  ((user == runnig.Accepetd_By._id
                    ? (runnig.Status === "running" &&
                        user == runnig.Accepetd_By._id &&
                        runnig.Acceptor_seen == true) ||
                      runnig.Status === "pending"
                    : (runnig.Status === "running" &&
                        user == runnig.Created_by._id) ||
                      runnig.Status === "pending") ||
                    runnig.Status == "conflict") &&
                  runnig.Game_type == game_type
                )
                  return (
                    <RunningCard
                      key={runnig._id}
                      runnig={runnig}
                      user={user}
                      winnAmount={winnAmount}
                    />
                  );
              })}

            {runningGames &&
              runningGames.map((runnig) => {
                if (
                  (user == runnig.Accepetd_By._id ||
                  user == runnig.Created_by._id
                    ? user == runnig.Accepetd_By._id
                      ? (runnig.Status === "running" &&
                          user == runnig.Accepetd_By._id &&
                          runnig.Acceptor_seen == true) ||
                        (runnig.Status === "pending" &&
                          runnig.Acceptor_status == null)
                      : (runnig.Status === "running" &&
                          user == runnig.Created_by._id) ||
                        (runnig.Status === "pending" &&
                          runnig.Creator_Status == null)
                    : runnig.Status === "running" ||
                      runnig.Status === "pending") &&
                  runnig.Game_type == game_type
                )
                  return (
                    <RunningCard
                      key={runnig._id}
                      runnig={runnig}
                      user={user}
                      winnAmount={winnAmount}
                    />
                  );
              })}
          </div>*/}

<div className="battle-list">
      <div className="open-battles">
        <h2>Your Open Battles</h2>
        <BattleCard
          playingFor={3}
          player1="Ki-Adi-Mundi_201647"
          player2="Jocasta-Nu_596492"
          onClick2={handelclickForRejoin}
        />
      </div>
      <div className="battles">
        <h2>Battles</h2>
        <BattleCard prizePool={5} playingNow={36} waitingNow={1} entryFee={3} onClick ={handelClick}/>
        <BattleCard prizePool={20} playingNow={20} waitingNow={1} entryFee={12} onClick ={handelClick}/>
        <BattleCard prizePool={50} playingNow={14} waitingNow={0} entryFee={29} onClick ={handelClick} />
        <BattleCard prizePool={100} playingNow={18} waitingNow={0} entryFee={59} onClick ={handelClick}/>
      </div>
    </div>
        </div> 
     </div>
      {/* <div className="rightContainer">
        <Rightcontainer />
      </div> */}
  


    </>
  );
}
