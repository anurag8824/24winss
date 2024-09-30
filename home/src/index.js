import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App2 from './app2.js/App2';
import './app/App.scss';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// import reportWebVitals from './reportWebVitals';
// import * as serviceWorker from './serviceWorker';
//import 'remixicon/fonts/remixicon.css'
//import 'react-image-crop/dist/ReactCrop.css'
// or scss:
//import 'react-image-crop/src/ReactCrop.scss'
// import {useAuthState} from 'react-firebase-hooks/auth';
// import swDev from './swDev'

// const role = localStorage.getItem("token")
// import './FiraBase.Config/firebase';




ReactDOM.render(

  <BrowserRouter>

    <App2 />

  </BrowserRouter >
  , document.getElementById('root'));

// swDev();



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
 serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

// ReactDOM.render(

//   <BrowserRouter>

//     <App2 />
    

//   </BrowserRouter >
//  , document.getElementById('root'));
  

// export default swDev();






