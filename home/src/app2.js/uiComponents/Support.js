// import React, { useEffect, useState } from "react";
// import Rightcontainer from "../Components/Rightcontainer";
// import axios from "axios";

// const Support = () => {
//   const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
//   const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
//   const nodeMode = process.env.NODE_ENV;

//   var baseUrl;
//   if (nodeMode === "development") {
//     baseUrl = beckendLocalApiUrl;
//   } else {
//     baseUrl = beckendLiveApiUrl;
//   }

//   const access_token = localStorage.getItem("token");
//   const[data,setData] = useState();
//   const [user, setUser] = useState();
//   const getUser = () => {
//     const headers = {
//       Authorization: `Bearer ${access_token}`,
//     };
//     axios
//       .get(baseUrl + `me`, { headers })
//       .then((res) => {
//         setUser(res.data);
//       })
//       .catch((e) => {
//         if (e.response?.status === 401) {
//           localStorage.removeItem("token");
//           // history.pushState("/login")
//         }
//       });
//   };

//   const [WebSitesettings, setWebsiteSettings] = useState("");
//   const fetchData = async () => {
//     const response = await fetch(baseUrl + "settings/data");
//     const data = await response.json();
//     return setWebsiteSettings(data);
//   };

//   useEffect(() => {
//     fetchData();
//     getUser();
//   }, []);
//   useEffect(async ()=>{
//      const Linksetting = await axios.get(baseUrl + `get-link`)
//      console.log("Links",Linksetting.data);
//     await setData(Linksetting.data)
//   },[])

//   return (
//     <div>
//       <div
//         className="leftContainer"
//         style={{ minHeight: "100vh", height: "100%" }}
//       >
//         <div className="cxy flex-column " style={{ paddingTop: "16%" }}>
//           <img
//             src={process.env.PUBLIC_URL + "/Images/contact_us.png"}
//             width="280px"
//             alt=""
//           />
//           <div
//             className="games-section-title mt-4"
//             style={{ fontSize: "1.2em", fontWeight: "700", color: "2c2c2c" }}
//           >
//             Contact us at below platforms.
//           </div>

//           <div className="row">
//             <div className="col-4  d-flex justify-content-around w-80">
//               <a className="cxy flex-column" href={data.telegram_link}
//             //   {data.telegram_link}
//               >
//                 <img
//                   width="50px"
//                   src={process.env.PUBLIC_URL + "/Images/tel.png"}
//                   alt=""
//                 />

//                 <span className="footer-text-bold">telegram</span>
//               </a>
//             </div>

//             <div className="col-4  d-flex justify-content-around w-80 ">
//               <a
//                 className="cxy flex-column"
//                 href={data.facebook_link}
//                 // {data.facebook_link}
//               >
//                 <img
//                   width="50px"
//                   src={process.env.PUBLIC_URL + "/Images/instagram.png"}
//                   alt=""
//                 />
//                 <span className="footer-text-bold">instragram</span>
//               </a>
//             </div>

//             <div className="col-4  d-flex justify-content-around w-80 ">
//               <a
//                 className="cxy flex-column"
//                 href={data.whatsapp_link}
//                 // {whatsapp_link
//                 // }
//               >
//                 <img
//                   width="50px"
//                   src={process.env.PUBLIC_URL + "/Images/whatsapp.png"}
//                   alt=""
//                 />
//                 <span className="footer-text-bold">whatsapp</span>
//               </a>
//             </div>
//           </div>

         

//          <div
//             className="games-section-title mt-4"
//             style={{ fontSize: "1.2em", fontWeight: "700", color: "2c2c2c" }}
//           >
//             Support Time 8am To 11pm.
//           </div> 
//         </div>
//       </div>

//       <div className="rightContainer">
//         <Rightcontainer />
//       </div>
//     </div>
//   );
// };
// export default Support;

import React, { useEffect, useState } from "react";
import Rightcontainer from "../Components/Rightcontainer";
import axios from "axios";

const Support = () => {
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;

  const baseUrl = nodeMode === "development" ? beckendLocalApiUrl : beckendLiveApiUrl;

  const access_token = localStorage.getItem("token");
  const [data, setData] = useState({});
  const [user, setUser] = useState({});
  const [webSiteSettings, setWebsiteSettings] = useState({});

  const getUser = () => {
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    axios
      .get(baseUrl + `me`, { headers })
      .then((res) => {
        setUser(res.data);
      })
      .catch((e) => {
        if (e.response?.status === 401) {
          localStorage.removeItem("token");
          // history.pushState("/login")
        }
      });
  };

  const fetchData = async () => {
    const response = await fetch(baseUrl + "settings/data");
    const data = await response.json();
    setWebsiteSettings(data);
  };

  useEffect(() => {
    fetchData();
    getUser();
  }, []);

  useEffect(() => {
    const fetchLinkSettings = async () => {
      const linkSetting = await axios.get(baseUrl + `get-link`);
      console.log("Links", linkSetting.data);
      setData(linkSetting.data);
    };
    fetchLinkSettings();
  }, [baseUrl]);

  return (
    <div>
      <div
        className="leftContainer"
        style={{ minHeight: "100vh", height: "100%" }}
      >
        <div className="cxy flex-column" style={{ paddingTop: "16%" }}>
          <img
            src={process.env.PUBLIC_URL + "/Images/contact_us.png"}
            width="280px"
            alt=""
          />
          <div
            className="games-section-title mt-4"
            style={{ fontSize: "1.2em", fontWeight: "700", color: "2c2c2c" }}
          >
            Contact us at below platforms.
          </div>

          <div className="row">
            <div className="col-4 d-flex justify-content-around w-80">
              {data.telegram_link ? (
                <a className="cxy flex-column" href={data.telegram_link}>
                  <img
                    width="50px"
                    src={process.env.PUBLIC_URL + "/Images/tel.png"}
                    alt=""
                  />
                  <span className="footer-text-bold">telegram</span>
                </a>
              ) : (
                <p>Loading...</p>
              )}
            </div>

            <div className="col-4 d-flex justify-content-around w-80">
              {data.facebook_link ? (
                <a className="cxy flex-column" href={data.facebook_link}>
                  <img
                    width="50px"
                    src={process.env.PUBLIC_URL + "/Images/instagram.png"}
                    alt=""
                  />
                  <span className="footer-text-bold">instagram</span>
                </a>
              ) : (
                <p>Loading...</p>
              )}
            </div>

            <div className="col-4 d-flex justify-content-around w-80">
              {data.whatsapp_link ? (
                <a className="cxy flex-column" href={data.whatsapp_link}>
                  <img
                    width="50px"
                    src={process.env.PUBLIC_URL + "/Images/whatsapp.png"}
                    alt=""
                  />
                  <span className="footer-text-bold">whatsapp</span>
                </a>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>

          <div
            className="games-section-title mt-4"
            style={{ fontSize: "1.2em", fontWeight: "700", color: "2c2c2c" }}
          >
            Support Time 8am To 11pm.
          </div>
        </div>
      </div>

      <div className="rightContainer">
        <Rightcontainer />
      </div>
    </div>
  );
};

export default Support;
