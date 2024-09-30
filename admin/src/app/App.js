import React, { Component } from 'react';
import { useLocation, withRouter } from 'react-router-dom';
import './App.scss';
import AppRoutes from './AppRoutes';
import Navbar from './shared/Navbar';
import Sidebar from './shared/Sidebar';
import Footer from './shared/Footer';
import axios from "axios"
// import { withTranslation } from "react-i18next";
const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }


class App extends Component {
  
  state = {}
  componentDidMount() {
    this.onRouteChanged();
    const token = localStorage.getItem("token");
    axios.get(baseUrl+`me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => {
      if (res.data.user_type === "Admin") {
        this.setState({
          usertype: "Admin",
          userAname: res.data.Name,
          dashboard: true,
          earnings: true,
          allAdmins: true,
          newAdmin: true,
          allUsers: true,
          sitesettings: true,
          newUser: true,
          pendingKyc: true,
          completedKyc: true,
          rejectKyc: true,
          allChallenges: true,
          completedChallenges: true,
          conflictChallenges: true,
          cancelledChallenges: true,
          runningChallenges: true,
          newChallenge: true,
          penaltyBonus: true,
          depositHistory: true,
          bonusHistory: true,
          withdrawlHistory: true,
          allWithdrawlRequests: true,
          allDepositRequests: true,
          pages: true,
          bonusReport: true,//Added by Team 
          penaltyReport: true,//Added by Team 
          withdrawalReport: true,//Added by Team 
          depositReport: true,//Added by Team 
          dropChallenges: true,
        });
      } else if (res.data.user_type === "Agent") {
        this.setState({
          usertype: "Agent",
          userAname: res.data.Name,
          dashboard: res.data.Permissions[0].Status,
          earnings: res.data.Permissions[1].Status,
          allAdmins: res.data.Permissions[2].Status,
          newAdmin: res.data.Permissions[3].Status,
          allUsers: res.data.Permissions[4].Status,
          newUser: res.data.Permissions[5].Status,
          pendingKyc: res.data.Permissions[6].Status,
          completedKyc: res.data.Permissions[7].Status,
          rejectKyc: res.data.Permissions[8].Status,
          allChallenges: res.data.Permissions[9].Status,
          completedChallenges: res.data.Permissions[10].Status,
          conflictChallenges: res.data.Permissions[11].Status,
          cancelledChallenges: res.data.Permissions[12].Status,
          runningChallenges: res.data.Permissions[13].Status,
          newChallenge: res.data.Permissions[14].Status,
          penaltyBonus: res.data.Permissions[15].Status,
          depositHistory: res.data.Permissions[16].Status,
          withdrawlHistory: res.data.Permissions[17].Status,
          allWithdrawlRequests: res.data.Permissions[18].Status,
          allDepositRequests: res.data.Permissions[19].Status,
          pages: res.data.Permissions[20].Status,
          bonusHistory: res.data.Permissions[21].Status,
          bonusReport:res.data.Permissions[22].Status,//Added by Team
          withdrawalReport:res.data.Permissions[23].Status,//Added by Team
          depositReport:res.data.Permissions[24].Status,//Added by Team
          penaltyReport:res.data.Permissions[25].Status,//Added by Team
          dropChallenges: res.data.Permissions[26].Status,
        });
      }
    }).catch(err => {
      console.log(err);
    });
  }
  render() {

    let navbarComponent = !this.state.isFullPageLayout ? <Navbar 
      usertype={this.state.usertype} userAname={this.state.userAname}
    /> : '';
    // let sidebarComponent = !this.state.isFullPageLayout ? <Sidebar /> : '';
    let sidebarComponent = !this.state.isFullPageLayout ? <Sidebar 
      usertype={this.state.usertype}
      dashboard={this.state.dashboard}
      earnings={this.state.earnings}
      allAdmins={this.state.allAdmins}
      newAdmin={this.state.newAdmin}
      sitesettings={this.state.sitesettings}//Added by Team
      allUsers={this.state.allUsers}
      newUser={this.state.newUser}
      pendingKyc={this.state.pendingKyc}
      completedKyc={this.state.completedKyc}
      rejectKyc={this.state.rejectKyc}
      allChallenges={this.state.allChallenges}
      completedChallenges={this.state.completedChallenges}
      conflictChallenges={this.state.conflictChallenges}
      cancelledChallenges={this.state.cancelledChallenges}
      runningChallenges={this.state.runningChallenges}
      
      newChallenge={this.state.newChallenge}
      penaltyBonus={this.state.penaltyBonus}
      depositHistory={this.state.depositHistory}
      bonusHistory={this.state.bonusHistory}
      withdrawlHistory={this.state.withdrawlHistory}
      allWithdrawlRequests={this.state.allWithdrawlRequests}
      allDepositRequests={this.state.allDepositRequests}
      pages={this.state.pages}
      
      bonusReport={this.state.bonusReport}//Added by Team
      penaltyReport={this.state.penaltyReport}//Added by Team
      withdrawalReport={this.state.withdrawalReport}//Added by Team
      depositReport={this.state.depositReport}//Added by Team
      dropChallenges={this.state.dropChallenges}
    /> : '';
    let footerComponent = !this.state.isFullPageLayout ? <Footer /> : '';
    return (
      <div className="container-scroller">
        {sidebarComponent}
        <div className="container-fluid page-body-wrapper">
          {navbarComponent}
          <div className="main-panel">
            <div className="content-wrapper"style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
              <AppRoutes />
            </div>
            {footerComponent}
          </div>
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    window.scrollTo(0, 0);
    const fullPageLayoutRoutes = ['/user-pages/login-1', '/user-pages/login-2', '/user-pages/register-1', '/user-pages/register-2', '/user-pages/lockscreen', '/error-pages/error-404', '/error-pages/error-500', '/general-pages/landing-page', '/landing', "/login", "/register", "/adminlogin", "/home", "/profile", "/help", "/Deposit", "/", "/Homepage/pOPULAR", "/KYC/update-pan", "/KYC/update-aadhar", "/Games"
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
