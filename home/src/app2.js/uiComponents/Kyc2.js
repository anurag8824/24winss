import React, { useEffect, useRef, useState } from "react";
import Header from "../Components/Header";
import "../css/kyc.css";
import Rightcontainer from "../Components/Rightcontainer";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import css from "../css/Pan.module.css";
import Swal from "sweetalert2";
import "../css/Loader.css";

const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
const nodeMode = process.env.NODE_ENV;
if (nodeMode === "development") {
  var baseUrl = beckendLocalApiUrl;
} else {
  baseUrl = beckendLiveApiUrl;
}
const Kyc2 = ({ user }) => {
  const history = useHistory();

  const [frontLoaded, setfrontLoaded] = useState(null);
  const [backLoaded, setbackLoaded] = useState(null);
  const [Name, setName] = useState();
  const [Email, setEmail] = useState();
  const [Number, setNumber] = useState();
  const [DOB, setDob] = useState();
  const [process, setProcess] = useState(false);

  let aadharProcess = useRef(false);

  const handleSubmitdata = (e) => {
    if (user.verified == "unverified") {
      if (aadharProcess.current === false) {
        setProcess(true);
        aadharProcess.current = true;
        e.preventDefault();
        console.log(frontLoaded, backLoaded);
        const formData = new FormData();

        formData.append("Name", Name);
        formData.append("Email", Email);
        formData.append("Number", Number);
        formData.append("DOB", DOB);
        formData.append("front", frontLoaded);
        formData.append("back", backLoaded);

        if (frontLoaded && backLoaded) {
          const access_token = localStorage.getItem("token");
          const headers = {
            Authorization: `Bearer ${access_token}`,
          };

          axios
            .post(baseUrl + `aadharcard`, formData, { headers })
            .then((res) => {
              console.log(res.data);
              if (res.data.msg === false) {
                Swal.fire({
                  title: "Duplicate Entity",
                  icon: "danger",
                  confirmButtonText: "error",
                });
              } else {
                Swal.fire({
                  title: "You Kyc form submitted",
                  icon: "success",
                  confirmButtonText: "ok",
                });
                history.push("/Profile");
              }
              // console.log(res.data)
              //
              aadharProcess.current = false;
              setProcess(false);
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
        } else {
          aadharProcess.current = false;
          setProcess(false);
          alert("please fill all field");
        }
      } else {
        alert("You have submited request already.");
      }
    } else {
      alert("You request in Process.");
    }
  };
  useEffect(() => {
    console.log(user);
    let access_token = localStorage.getItem("token");
    access_token = localStorage.getItem("token");
    if (!access_token) {
      window.location.reload();
      history.push("/login");
    }
    const frontPhoto = document.getElementById("frontPhoto");
    frontPhoto.onchange = (e) => {
      const [file] = frontPhoto.files;
      setfrontLoaded(file);
    };
    const backPhoto = document.getElementById("backPhoto");
    backPhoto.onchange = (e) => {
      const [file] = backPhoto.files;
      setbackLoaded(file);
    };
  }, []);
  return (
    <div>
      <div className="leftContainer">
        <div className="kycPage mt-5 py-4 px-3">
          <p className="mt-2" style={{ color: "rgb(149, 149, 149)" }}>
            You need to submit a document that shows that you are{" "}
            <span style={{ fontWeight: 500 }}>above 18 years</span> of age and
            not a resident of{" "}
            <span style={{ fontWeight: 500 }}>
              Assam, Odisha, Sikkim, Nagaland, Telangana, Andhra Pradesh, Tamil
              Nadu and Karnataka.
            </span>
          </p>
          {/* <br /> */}
          {/* <div>
            <span style={{ fontSize: "1.5em" }}>Step 2</span> of 3
          </div> */}
          <p className="mt-2" style={{ color: "rgb(149, 149, 149)" }}>
            Enter details of Aadhar Card:{" "}
            {/* <span style={{ fontWeight: 500 }}>098765432212</span> */}
          </p>
          {/* <br /> */}
          <form onSubmit={handleSubmitdata}>
            <div style={{ marginTop: "10px" }}>
              <div className="kyc-doc-input">
                <div className="label">First Name</div>
                <input
                  type="text"
                  name="Name"
                  placeholder="Enter name"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              {/* <br /> */}
              <div className="kyc-doc-input mt-4">
                <div className="label">Email Id</div>
                <input
                  type="text"
                  name="Email"
                  placeholder="Email Id"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="kyc-doc-input mt-4">
                <div className="label">Date of Birth</div>
                <input
                  type="date"
                  name="Name"
                  placeholder="enter name"
                  value={DOB}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
              <div className="kyc-doc-input mt-4">
                <div className="label">Aadhar Number</div>
                <input
                  type="tel"
                  name="Name"
                  placeholder=" Aadhar Number"
                  onChange={(e) => setNumber(e.target.value)}
                  required
                />
              </div>
              <div className={`${css.doc_upload} mt-4`}>
                <input
                  id="frontPhoto"
                  name="frontPhoto"
                  type="file"
                  accept="image/*"
                  required
                />
                {!frontLoaded && (
                  <div className="cxy flex-column position-absolute ">
                    <img
                      src="/images/file-uploader-icon.png"
                      width="17px"
                      alt=""
                      className="snip-img"
                    />
                    <div className={`${css.sideNav_text} mt-2`}>
                      Upload front Photo of your Aadhar Card.
                    </div>
                  </div>
                )}
                {frontLoaded && (
                  <div className={css.uploaded}>
                    <img
                      src="/images/file-icon.png"
                      width="26px"
                      alt=""
                      style={{ marginRight: "20px" }}
                    />
                    <div
                      className="d-flex flex-column"
                      style={{ width: "80%" }}
                    >
                      <div className={css.name}>{frontLoaded.name}</div>
                      <div className={css.size}>
                        {(frontLoaded.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <div className="image-block">
                      <img
                        src="/images/global-cross.png"
                        width="10px"
                        alt=""
                        onClick={() => setfrontLoaded(null)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className={`${css.doc_upload} mt-4`}>
                <input
                  id="backPhoto"
                  name="backPhoto"
                  type="file"
                  accept="image/*"
                  required
                />
                {!backLoaded && (
                  <div className="cxy flex-column position-absolute ">
                    <img
                      src="/images/file-uploader-icon.png"
                      width="17px"
                      alt=""
                      className="snip-img"
                    />
                    <div className={`${css.sideNav_text} mt-2`}>
                      Upload back Photo of your Aadhar Card.
                    </div>
                  </div>
                )}
                {backLoaded && (
                  <div className={css.uploaded}>
                    <img
                      src="/images/file-icon.png"
                      width="26px"
                      alt=""
                      style={{ marginRight: "20px" }}
                    />
                    <div
                      className="d-flex flex-column"
                      style={{ width: "80%" }}
                    >
                      <div className={css.name}>{backLoaded.name}</div>
                      <div className={css.size}>
                        {(backLoaded.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <div className="image-block">
                      <img
                        src="/images/global-cross.png"
                        width="10px"
                        alt=""
                        onClick={() => setbackLoaded(null)}
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* <div style={{ marginTop: "50px" }}>
              <span style={{ color: "rgb(149, 149, 149)", fontWeight: 500 }}>
                State
              </span>
              <div className="kyc-input mt-2">
                <div className="kyc-input-text">Select State</div>
                <div className="arrow cxy">
                  <img
                    src="/images/global-black-chevronDown.png"
                    width="15px"
                    alt=""
                  />
                </div>
              </div>
            </div> */}
            </div>
            <div style={{ paddingBottom: "25%" }} />
            <div className="refer-footer p-0">
              {/* <button className="refer-button btn-success mr-2  w-100 " style={{ background: '#6c757d !important' }}>
              <a href="/kyc">Previous</a>
            </button> */}
              <button
                type="submit"
                className="w-100 btn-success bg-success"
                style={{
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "1em",
                  fontWeight: "700",
                  height: "48px",
                  color: "#fff",
                  textTransform: "uppercase",
                }}
              >
                {/* <Link  >Next</Link> */}
                submit
              </button>
            </div>
          </form>
        </div>
        {Boolean(process) && (
          <div className="loaderReturn" style={{ zIndex: "99" }}>
            <img
              src={"https://hiplay.in/Images/LandingPage_img/loader1.gif"}
              style={{ width: "100%" }}
            />
          </div>
        )}
      </div>
      <div className="rightContainer">
        <Rightcontainer />
      </div>
    </div>
  );
};

export default Kyc2;
