import React from "react";
import Rightcontainer from "../Components/Rightcontainer";
import css from "../css/Addfunds.module.css";
const Addfunds = () => {
  return (
    <div>
      <div className="leftContainer" style={{ backgroundColor: "#ffffff" }}>
        <div
          class="px-4 py-3  d-flex justify-content-center flex-column"
          style={{ height: "60px" }}
        >
          <div class="d-flex align-items-center">
            <div class="games-section-title" style={{ fontSize: "18px" }}>
              Amount to be added ₹100
            </div>
            <button class={`${css.btn} btn-sm btn-info position-absolute`}>
              <strong>EDIT</strong>
             
            </button>
          </div>
          {/* <div class={`${css.divider_x} XXsnipcss_extracted_selector_selectionXX snipcss0-0-0-1 tether-target-attached-top tether-abutted tether-abutted-top tether-element-attached-top tether-element-attached-center tether-target-attached-center`}></div> */}
        </div>
      </div>
      <div class="px-4 py-3">
        <div class="d-flex flex-column">
          <div class="games-section-title">Pay Through UPI</div>
          <div
            class="add-fund-box mt-3"
            style={{ paddingTop: "0px", height: "60px" }}
          >
            <div
              class="d-flex align-items-center"
              style={{
                backgroundColor: "#fafafa",
                width: "450px",
                border: "1px solid grey",
                borderRadius: "7px",
              }}
            >
              <div
                class="d-flex align-items-center"
                style={{ height: "60px", display: "flex", textAlign: "center" }}
              >
                <img
                  width="45px"
                  src="https://hiplay.in/images/qr-scan.svg"
                  alt=""
                  style={{
                    marginLeft: "7px",
                    paddingBottom: "10px",
                    paddingLeft: "3px",
                    paddingTop: "5px",
                  }}
                />
              </div>
              <div class="d-flex justify-content-center flex-column ml-4">
                <div class="jss30">
                  <strong>Scan QR Code</strong>
                </div>
                <div class="jss31"></div>
              </div>
            </div>
          </div>
          <div class="games-section-title mt-3">Other Options</div>
          <div
            class="add-fund-box mt-3"
            style={{ paddingTop: "0px", height: "60px" }}
          >
            <div
              class="d-flex align-items-center"
              style={{
                backgroundColor: "#fafafa",
                width: "450px",
                border: "1px solid grey",
                borderRadius: "7px",
              }}
            >
              <div class="d-flex align-items-center" style={{ height: "60px" }}>
                <img
                  width="48px"
                  src="https://hiplay.in/images/upi.webp"
                  alt=""
                  style={{
                    marginLeft: "7px",
                    paddingBottom: "10px",
                    paddingLeft: "3px",
                    paddingTop: "5px",
                  }}
                />
              </div>
              <div class="d-flex justify-content-center flex-column ml-4">
                <div class="jss30">
                  <strong>UPI ID</strong>
                </div>
                <div class="jss31"></div>
              </div>
            </div>
          </div>
          <div
            class="add-fund-box mt-3"
            style={{ paddingTop: "0px", height: "60px" }}
          >
            <div
              class="d-flex align-items-center"
              style={{
                backgroundColor: "#fafafa",
                width: "450px",
                border: "1px solid grey",
                borderRadius: "7px",
              }}
            >
              <div class="d-flex align-items-center" style={{ height: "60px" }}>
                <img
                  width="48px"
                  src="https://hiplay.in/images/all-wallets.png"
                  alt=""
                  style={{
                    marginLeft: "7px",
                    paddingBottom: "10px",
                    paddingLeft: "3px",
                    paddingTop: "5px",
                  }}
                />
              </div>
              <div class="d-flex justify-content-center flex-column ml-4">
                <div class="jss30">
                  <strong>Other Wallets</strong>
                </div>
                <div class="jss31"></div>
              </div>
            </div>
          </div>
          <div
            class="add-fund-box mt-3"
            style={{ paddingTop: "0px", height: "60px" }}
          >
            <div
              class="d-flex align-items-center"
              style={{
                backgroundColor: "#fafafa",
                width: "450px",
                border: "1px solid grey",
                borderRadius: "7px",
              }}
            >
              <div class="d-flex align-items-center" style={{ height: "60px" }}>
                <img
                  width="48px"
                  src="https://hiplay.in/images/bank.png"
                  alt=""
                  style={{
                    marginLeft: "7px",
                    paddingBottom: "10px",
                    paddingLeft: "3px",
                    paddingTop: "5px",
                  }}
                />
              </div>
              <div class="d-flex justify-content-center flex-column ml-4">
                <div class="jss30">
                  <strong>Net Banking</strong>
                </div>
                <div class="jss31"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rightContainer">
        <Rightcontainer />
      </div>
    </div>
  );
};
export default Addfunds;
