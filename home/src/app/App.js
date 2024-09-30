import React, { Component } from 'react';
import { useLocation, withRouter } from 'react-router-dom';
import './App.scss';
// import { withTranslation } from "react-i18next";

class App extends Component {
  state = {}
  componentDidMount() {

    this.props.history.listen(() => {
      if (window.swUpdateReady) {
        window.swUpdateReady = false;
        window.stop();
        alert('App Update! Please Restart Your App.');
        window.location.reload();
      }
    })
    this.onRouteChanged();
  }
  render() {
    return (
      <div className="container-scroller">
    
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    // console.log("ROUTE CHANGED");
    // const { i18n } = this.props;
    // const body = document.querySelector('body');
    // if (this.props.location.pathname === '/layout/RtlLayout') {
    //   body.classList.add('rtl');
    //   i18n.changeLanguage('ar');
    // }
    // else {
    //   body.classList.remove('rtl')
    //   i18n.changeLanguage('en');
    // }
    window.scrollTo(0, 0);
    const fullPageLayoutRoutes = ['/user-pages/login-1', '/user-pages/login-2', '/user-pages/register-1', '/user-pages/register-2', '/user-pages/lockscreen', '/error-pages/error-404', '/error-pages/error-500', '/general-pages/landing-page', '/landing', "/login", "/register","/home", "/profile", "/help", "/Deposit", "/", "/Homepage/pOPULAR", "/KYC/update-pan", "/KYC/update-aadhar", "/Games"
      , "/Referral-history", `/landing/:id`, "/wallet", "/support", "/Withdrawopt", "/Addcase", "/Addfunds", "/Notification", "/refer", "/transaction", "//transaction-history", "/web" ,"/return","/redeem/refer","/transaction-history"];
    for (let i = 0; i < fullPageLayoutRoutes.length; i++) {
      if (this.props.location.pathname === fullPageLayoutRoutes[i]) {
        this.setState({
          isFullPageLayout: true
        })
        document.querySelector('.page-body-wrapper').classList.add('full-page-wrapper');
        break;
      } else {
        this.setState({
          isFullPageLayout: false
        })
        document.querySelector('.page-body-wrapper').classList.remove('full-page-wrapper');
      }
    }
    if (this.props.location.pathname.split("/")[1] == 'landing' || this.props.location.pathname.split("/")[1] == 'viewgame1') {
      this.setState({
        isFullPageLayout: true
      })
      document.querySelector('.page-body-wrapper').classList.add('full-page-wrapper');
    }
  }

}

export default (withRouter(App));
