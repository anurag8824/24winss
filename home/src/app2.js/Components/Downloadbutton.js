import React, { useEffect, Profiler, useState } from 'react'
// import ReactPWAInstallProvider, { useReactPWAInstall } from "react-pwa-install";
import "./Component-css/Downloadbutton.css?v=0.1"
// let deferredPrompt; 
const Downloadbutton = () => {
     const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = e => {
      e.preventDefault();
      console.log("we are being triggered :D");
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("transitionend", handler);
  }, []);

  const onClick = evt => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };
  if (!supportsPWA) {
    return null;
  }
 

  return (
  
<div
  className="my-stickey-footer"
  style={{
    position: "fixed",
    bottom: 0,
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#ffffff"
  }}
>
  <div className="text-center" style={{ zoom: "1.2", padding: "10px 0px" }}>
    <button onClick={onClick} className="btn btn-primary btn-sm " style={{ fontWeight: 500 }}>
      <img
        src="https://hiplay.in/Images/android.png"
        alt=""
        style={{ marginRight: 10 }}
        width="15px"
        
      />
      DOWNLOAD OUR APP
      <img
        src="https://hiplay.in/Images/dowloadIcon.png"
        alt=""
        style={{ marginLeft: 10 }}
        width="13px"
      />
    </button>
   
  </div>
</div>
   
    
    
  )
}

export default Downloadbutton