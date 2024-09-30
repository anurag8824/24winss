import React, { useState } from "react";

function ModalProfile(props) {
  const style1 = useState(props.style3);
  const Enter = useState(props.Enter);
  return (
    <div className="kyc-select">
      <div className="overlay" style={style1} />
      <div
        className={`box kyc-select-${Enter}-done`}
        style={{ bottom: "0px", position: "absolute" }}
      >
        <div className="bg-white">
          <div className="header cxy flex-column">
            <picture>
              <img
                height="80px"
                width="80px"
                src="/images/avatars/Avatar2.png"
                alt=""
              />
            </picture>
            <div className="header-text mt-2">Choose Avatar</div>
          </div>
          <div className="mx-3 pb-3" style={{ paddingTop: "200px" }}>
            <div className="row justify-content-between col-10 mx-auto">
              <img
                height="50px"
                width="50px"
                src="/images/avatars/Avatar1.png"
                alt=""
              />
              <img
                height="50px"
                width="50px"
                src="/images/avatars/Avatar2.png"
                alt=""
              />
              <img
                height="50px"
                width="50px"
                src="/images/avatars/Avatar3.png"
                alt=""
              />
              <img
                height="50px"
                width="50px"
                src="/images/avatars/Avatar4.png"
                alt=""
              />
            </div>
            <div className="row justify-content-between col-10 mx-auto mt-3">
              <img
                height="50px"
                width="50px"
                src="/images/avatars/Avatar5.png"
                alt=""
              />
              <img
                height="50px"
                width="50px"
                src="/images/avatars/Avatar6.png"
                alt=""
              />
              <img
                height="50px"
                width="50px"
                src="/images/avatars/Avatar7.png"
                alt=""
              />
              <img
                height="50px"
                width="50px"
                src="/images/avatars/Avatar8.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalProfile;
