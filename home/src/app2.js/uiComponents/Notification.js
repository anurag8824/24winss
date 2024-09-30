import React from "react";
import css from "../css/notification.module.css";
import Rightcontainer from "../Components/Rightcontainer";


const Notification = () => {
  return (
    <div>
      <div className="leftContainer" style={{height:'100vh'}}>
      
      <div
        className="cxy flex-column px-4 text-center"
        style={{ paddingTop: "30%" }}
      >
        <img
          src={process.env.PUBLIC_URL + "/Images/nonotification.png"}
          width="220px"
          className="snip-img"
          alt='no notification'
        />
        <div className={`${css.games_section_title} mt-4`} style={{ fontSize: "1.2em" }}>
          No notification yet!
        </div>
        <div
          className={`${css.games_section_headline} mt-2`}
          style={{ fontSize: "0.85em" }}
        >
          Seems like you haven’t done any activity yet
        </div>
      </div>
      </div>
      <div className="rightContainer">
        <Rightcontainer />
      </div>
    </div>
  );
};

export default Notification;
