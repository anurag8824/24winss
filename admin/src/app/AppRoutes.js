import React, { Component, Suspense, lazy, useState, useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Spinner from '../app/shared/Spinner';

import UserKyc from './components/userManagement/UserKyc';
import ViewKyc from './components/userManagement/ViewKyc';
import Transactionhistory from './components/transaction/Transactionhistory';
import Bonushistory from './components/transaction/Bonushistory';
import Withdrawlhistory from './components/transaction/Withdrawlhistory';
import Deposits from './components/transaction/Deposits';
import Pages from './components/Settings/Page';



import axios from "axios"
import Earings from './dashboard/Earings';
import ComKyc from './components/userManagement/ComKyc';
import SucWithdraw from './components/transaction/SucWithdraw';
import RejectKyc from './components/userManagement/RejectKyc';
import Completed from './components/challengeManagement/Completed';
import Conflict from './components/challengeManagement/Conflict';
import Cancelled from './components/challengeManagement/Cancelled';
import Running from './components/challengeManagement/Running';
import Drop from './components/challengeManagement/Drop';
import New from './components/challengeManagement/New';
import View from './components/userManagement/View';
import UpdatePassword from './components/adminManagement/UpdatePassword';
import Profile from './components/adminManagement/Profile';
import Permissions from './components/agentManagement/Permissions';

import  DepositReport  from './components/Reports/DepositReport';
import BonusReport from './components/Reports/BonusReport';
import  WithdrawalReport  from './components/Reports/WithdrawalReport';
import  PenaltyReport  from './components/Reports/PenaltyReport';
import { Sitesettings } from './components/adminManagement/Sitesettings';

// Admin Management start
const Alladmin = lazy(() => import('./components/adminManagement/Alladmin'));
const Addadmin = lazy(() => import('./components/adminManagement/Addadmin'));
// Admin Management end

// Game Management start
const Allgames = lazy(() => import('./components/gameManagement/Allgames'));
const Addgame = lazy(() => import('./components/gameManagement/Addgame'));
// Game Management end

// User Management start
const Allusers = lazy(() => import('./components/userManagement/Allusers'));
const Adduser = lazy(() => import('./components/userManagement/Adduser'));
// User Management end

// Agent Management start
const Allagents = lazy(() => import('./components/agentManagement/Allagent'));
const Addagent = lazy(() => import('./components/agentManagement/Addagent'));
// User Management end

// Challenge Management start
const Allchallenges = lazy(() => import('./components/challengeManagement/Allchallenge'));
const Views = lazy(() => import('./components/challengeManagement/Views'));
// Challenge Management end

// Transaction Management start
const Alldeposits = lazy(() => import('./components/transaction/Deposits'));
const Allwithdrawl = lazy(() => import('./components/transaction/Withdrawl'));
const Penaltybonus = lazy(() => import('./components/transaction/Penalty&bonus'));
// Transaction Management end

const Dashboard = lazy(() => import('./dashboard/Dashboard'));

const Buttons = lazy(() => import('./basic-ui/Buttons'));
const Dropdowns = lazy(() => import('./basic-ui/Dropdowns'));
const Typography = lazy(() => import('./basic-ui/Typography'));

const BasicElements = lazy(() => import('./form-elements/BasicElements'));

const BasicTable = lazy(() => import('./tables/BasicTable'));

const Mdi = lazy(() => import('./icons/Mdi'));

const ChartJs = lazy(() => import('./charts/ChartJs'));

const Error404 = lazy(() => import('./error-pages/Error404'));
const Error500 = lazy(() => import('./error-pages/Error500'));

const Login = lazy(() => import('./user-pages/Login'));
const Register1 = lazy(() => import('./user-pages/Register'));


// const Homepage = lazy(() => import('../app2.js/uiComponents/Homepage'));




const AppRoutes = () => {
  const access_token = localStorage.getItem("token")
  const [dashboard, setDashboard] = useState(false)
  const [earnings, setEarnings] = useState(false)
  const [allAdmins, setAllAdmins] = useState(false)
  const [newAdmin, setNewAdmin] = useState(false)
  const [sitesettings,setsitesettings] = useState(false);//Added by team
  const [allUsers, setAllUsers] = useState(false)
  const [newUser, setNewUser] = useState(false)
  const [pendingKyc, setPendingKyc] = useState(false)
  const [completedKyc, setCompletedKyc] = useState(false)
  const [rejectKyc, setRejectKyc] = useState(false)
  const [allChallenges, setAllChallenges] = useState(false)
  const [completedChallenges, setCompletedChallenges] = useState(false)
  const [conflictChallenges, setConflictChallenges] = useState(false)
  const [cancelledChallenges, setCancelledChallenges] = useState(false)
  const [runningChallenges, setRunningChallenges] = useState(false)
  
  const [newChallenge, setNewChallenge] = useState(false)
  const [penaltyBonus, setPenaltyBonus] = useState(false)
  const [depositHistory, setDepositHistory] = useState(false)
  const [bonusHistory, setBonusHistory] = useState(false)
  const [withdrawlHistory, setWithdrawlHistory] = useState(false)
  const [allWithdrawlRequests, setAllWithdrawlRequests] = useState(false)
  const [allDepositRequests, setAllDepositRequests] = useState(false)
  const [pages, setPages] = useState(false)
  const [viewUser,setViewUser]=useState(false);
  const [challangePage,setChallangePage]=useState(false);
  
  const [bonusReport,setBonusReport]=useState(false);//Added by team
  const [penaltyReport,setpenaltyReport]=useState(false);//Added by team
  const [withdrawalReport,setwithdrawalReport]=useState(false);//Added by team
  const [depositReport,setdepositReport]=useState(false);//Added by team
  const [dropChallenges, setDropChallenges] = useState(false)

  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }

  
  useEffect(() => {
    if (access_token) {
      axios.get(baseUrl+`me`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }).then(res => {
        if(res.data.user_type === "Admin"){
          setDashboard(true)
          setEarnings(true)
          setAllAdmins(true)
          setNewAdmin(true)
          setAllUsers(true)
          setsitesettings(true);//Added by team
          setNewUser(true)
          setPendingKyc(true)
          setCompletedKyc(true)
          setRejectKyc(true)
          setAllChallenges(true)
          setCompletedChallenges(true)
          setConflictChallenges(true)
          setCancelledChallenges(true)
          setRunningChallenges(true)
          setDropChallenges(true)
          setNewChallenge(true)
          setPenaltyBonus(true)
          setDepositHistory(true)
          setBonusHistory(true)
          setWithdrawlHistory(true)
          setAllWithdrawlRequests(true)
          setAllDepositRequests(true)
          setPages(true)
          setBonusReport(true);//Added by team
          setpenaltyReport(true);//Added by team
          setwithdrawalReport(true);//Added by team
          setdepositReport(true);//Added by team
        }
        if(res.data.user_type === "Agent"){
          setDashboard(res.data.Permissions[0].Status)
          setEarnings(res.data.Permissions[1].Status)
          setAllAdmins(res.data.Permissions[2].Status)
          setNewAdmin(res.data.Permissions[3].Status)
          setAllUsers(res.data.Permissions[4].Status)
          setNewUser(res.data.Permissions[5].Status)
          setPendingKyc(res.data.Permissions[6].Status)
          setCompletedKyc(res.data.Permissions[7].Status)
          setRejectKyc(res.data.Permissions[8].Status)
          setAllChallenges(res.data.Permissions[9].Status)
          setCompletedChallenges(res.data.Permissions[10].Status)
          setConflictChallenges(res.data.Permissions[11].Status)
          setCancelledChallenges(res.data.Permissions[12].Status)
          setRunningChallenges(res.data.Permissions[13].Status)
          setNewChallenge(res.data.Permissions[14].Status)
          setPenaltyBonus(res.data.Permissions[15].Status)
          setDepositHistory(res.data.Permissions[16].Status)
          setWithdrawlHistory(res.data.Permissions[17].Status)
          setAllWithdrawlRequests(res.data.Permissions[18].Status)
          setAllDepositRequests(res.data.Permissions[19].Status)
          setPages(res.data.Permissions[20].Status)
          setBonusHistory(res.data.Permissions[21].Status)
          setBonusReport(res.data.Permissions[22].Status);//Added by team
          setwithdrawalReport(res.data.Permissions[23].Status);//Added by team
          setdepositReport(res.data.Permissions[24].Status);//Added by team
          setpenaltyReport(res.data.Permissions[25].Status);//Added by team
          setDropChallenges(res.data.Permissions[26].Status)
          //console.log(res.data.Permissions)
        }
      }
      ).catch(err => {
        console.log(err)
      }
      )
    }
  }, [access_token])



  if (!access_token) {
    return (
      <Suspense fallback={<Spinner />}>
        <Switch>

          {/* <Route exact path="/login" component={userLogin} /> */}
          <Route exact path="/adminlogin" component={Login} />

          <Redirect to="/adminlogin" />

        </Switch >
      </Suspense>
    )
  } else {




    return (
      <>







        <Suspense fallback={<Spinner />}>
          <Switch>
            <Redirect exact from="/" to="/dashboard" />
            {dashboard && <Route exact path="/dashboard" component={Dashboard} />}
            {earnings && <Route exact path="/earinigs" component={Earings} />}

            {/* Admin Routes start */}
            {allAdmins && <Route path="/admin/alladmins" component={Alladmin} />}
            {newAdmin && <Route path="/admin/addadmin" component={Addadmin} />}
            {sitesettings && <Route path="/admin/sitesettings" component={Sitesettings} />}
            <Route path="/admin/update" component={UpdatePassword} />

            <Route path="/admin/profile" component={Profile} />
            <Route path="/agent/permissions/:id" component={Permissions} />


            {/* Admin Routes end */}


            {/* Game Routes start */}

            <Route path="/game/allgames" component={Allgames} />
            <Route path="/game/addgame" component={Addgame} />

            {/* Game Routes end */}


            {/* user Routes start */}
            {allUsers && <Route path="/user/allusers" component={Allusers} />}
            {newUser && <Route path="/user/adduser/:id" component={Adduser} />}


            {newUser && <Route path="/user/adduser" component={Adduser} />}
            {pendingKyc &&<Route path="/user/UserKyc" component={UserKyc} />}
            <Route path="/user/view" component={ViewKyc} />
            {completedKyc && <Route path="/user/kyc" component={ComKyc} />}
            {rejectKyc && <Route path="/user/reject" component={RejectKyc} />}
            <Route path="/user/view_user/:id" component={View} />

            {/* user Routes end */}


            {/* Agent Routes start */}

            <Route path="/agent/allagents" component={Allagents} />
            <Route path="/agent/addagent" component={Addagent} />

            {/* Agent Routes end */}


            {/* challenge Routes start */}
            {allChallenges && <Route path="/challenge/allchallenges" component={Allchallenges} />}
            {completedChallenges && <Route path="/challenge/completed_challange" component={Completed} />}
            {conflictChallenges && <Route path="/challenge/conflict_challange" component={Conflict} />}
            {cancelledChallenges && <Route path="/challenge/cancelled_challange" component={Cancelled} />}
            {runningChallenges && <Route path="/challenge/running_challange" component={Running} />}
            {dropChallenges && <Route path="/challenge/drop_challange" component={Drop} />}
            {newChallenge && <Route path="/challenge/new_challange" component={New} />}

            {/* challenge Routes end */}


            {/* Transaction Routes start */}
            {allDepositRequests && <Route path="/transaction/alldeposits" component={Alldeposits} />}
            {allWithdrawlRequests && <Route path="/transaction/allwithdrawl" component={Allwithdrawl} />}
            {penaltyBonus && <Route path="/transaction/penaltybonus" component={Penaltybonus} />}
            {depositHistory && <Route path="/transaction/transaction_history" component={Transactionhistory} />}
            {bonusHistory && <Route path="/transaction/bonus_history" component={Bonushistory} />}
            {withdrawlHistory && <Route path="/transaction/withdraw_history" component={Withdrawlhistory} />}
            <Route path="/transaction/withdraw" component={SucWithdraw} />

            {/* Transaction Routes end */}
            
            {/* Report Routes start */}
            {/* Added By Team */}
            {bonusReport && <Route path="/Reports/bonusReport" component={BonusReport}/>}
            {penaltyReport && <Route path="/Reports/penaltyReport" component={PenaltyReport}/>}
            {withdrawalReport && <Route path="/Reports/withdrawalReport" component={WithdrawalReport}/>}
            {depositReport && <Route path="/Reports/depositReport" component={DepositReport}/>}
            {/* Added By Team */}
            {/* Report Routes Start */}

            <Route path="/basic-ui/buttons" component={Buttons} />
            <Route path="/basic-ui/dropdowns" component={Dropdowns} />
            <Route path="/basic-ui/typography" component={Typography} />

            <Route path="/form-Elements/basic-elements" component={BasicElements} />

            <Route path="/tables/basic-table" component={BasicTable} />

            <Route path="/icons/mdi" component={Mdi} />

            <Route path="/charts/chart-js" component={ChartJs} />



            <Route path="/user-pages/register-1" component={Register1} />

            <Route path="/error-pages/error-404" component={Error404} />
            <Route path="/error-pages/error-500" component={Error500} />
            <Route path="/view/:id" component={Views} />
            {pages && <Route path="/Pages" component={Pages} />}

            

          </Switch>
        </Suspense>

      </>

    );

  }


}

export default AppRoutes;