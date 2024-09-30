import React, { Component ,useEffect,useState} from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Collapse, Dropdown } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import axios from 'axios';



class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state={}
  }

  

  toggleMenuState(menuState) {
    if (this.state[menuState]) {
      this.setState({ [menuState]: false });
    } else if (Object.keys(this.state).length === 0) {
      this.setState({ [menuState]: true });
    } else {
      Object.keys(this.state).forEach(i => {
        this.setState({ [i]: false });
      });
      this.setState({ [menuState]: true });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    document.querySelector('#sidebar').classList.remove('active');
    Object.keys(this.state).forEach(i => {
      this.setState({ [i]: false });
    });

    const dropdownPaths = [
      { path: '/apps', state: 'appsMenuOpen' },
      { path: '/admin', state: 'adminMenu' },
      { path: '/game', state: 'gameMenu' },
      { path: '/user', state: 'userMenu' },
      { path: '/agent', state: 'agentMenu' },
      { path: '/challenge', state: 'challengeMenu' },
      { path: '/transaction', state: 'transactionMenu' },
      { path: '/basic-ui', state: 'basicUiMenuOpen' },
      { path: '/form-elements', state: 'formElementsMenuOpen' },
      { path: '/tables', state: 'tablesMenuOpen' },
      { path: '/icons', state: 'iconsMenuOpen' },
      { path: '/charts', state: 'chartsMenuOpen' },
      { path: '/user-pages', state: 'userPagesMenuOpen' },
      { path: '/error-pages', state: 'errorPagesMenuOpen' },
      { path: '/Reports', state: 'reportsMenu' },//Added By Team 
    ];

    dropdownPaths.forEach((obj => {
      if (this.isPathActive(obj.path)) {
        this.setState({ [obj.state]: true })
      }
    }));
  }

  render() {
    var appURL = process.env.PUBLIC_URL;
    var logo = appURL+'https://img.icons8.com/dotty/512/admin-settings-male.png';
    // foreach props
    for(let key in this.props) {
      if(this.props[key] === undefined){
        setTimeout(() => {
          
        }, 1000);
      }
    }
    return (
      
      <nav className="sidebar sidebar-offcanvas" id="sidebar">
        <div className="sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center fixed-top">
          <a className="brand-logo" href="/dashboard"><img src={logo} alt="logo" style={{ height: '75px ', width: '70px ' }} /></a><div className="font-weight-bold" ><h3>ADMIN PANEL</h3></div>
        </div>
        <ul className="nav">
          <li className="nav-item profile">
            <div className="profile-desc">
              <div className="profile-pic">
                <div className="count-indicator">
                  <img className="img-xs rounded-circle " src="https://cdn-icons-png.flaticon.com/512/2206/2206368.png" alt="profile" />
                  <span className="count bg-success"></span>
                </div>
                <div className="profile-name">
                  <h5 className="mb-0 font-weight-normal"><Trans>
                   User: {this.props.usertype}
                  </Trans></h5>
                </div>
              </div>

            </div>
          </li>
          <li className="nav-item nav-category">
            <span className="nav-link"><Trans>Navigation</Trans></span>
          </li>
          {this.props.dashboard && (
          <li className={this.isPathActive('/dashboard') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <Link className="nav-link" to="/dashboard">
              <span className="menu-icon"><i className="mdi mdi-speedometer"></i></span>
              <span className="menu-title"><Trans>Dashboard</Trans></span>
            </Link>
          </li>
          )}
          {this.props.earnings && (
          <li className={this.isPathActive('/earinigs') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <Link className="nav-link" to="/earinigs">
              <span className="menu-icon"><i className="mdi mdi-cash-usd"></i></span>
              <span className="menu-title"><Trans> Admin Earnings</Trans></span>
            </Link>
          </li>
          )}
          {(this.props.allAdmins || this.props.newAdmin || this.props.sitesettings) && (
          <li className={this.isPathActive('/admin') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.adminMenu ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('adminMenu')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-account-star"></i>
              </span>
              <span className="menu-title"><Trans>Admin Manager</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.adminMenu}>
              <div>
                <ul className="nav flex-column sub-menu">
                  {this.props.allAdmins && (
                  <li className="nav-item"> <Link className={this.isPathActive('/admin/alladmins') ? 'nav-link active' : 'nav-link'} to="/admin/alladmins"><Trans>All Admins</Trans></Link></li>
                  )}
                  {this.props.newAdmin && (
                  <li className="nav-item"> <Link className={this.isPathActive('/admin/addadmin') ? 'nav-link active' : 'nav-link'} to="/admin/addadmin"><Trans>Add New Admin</Trans></Link></li>
                  )}
                  {this.props.allAdmins && (
                  <li className="nav-item"> <Link className={this.isPathActive('/admin/sitesettings') ? 'nav-link active' : 'nav-link'} to="/admin/sitesettings"><Trans>Website Settings</Trans></Link></li>
                  )}
                  </ul>
              </div>
            </Collapse>
          </li>
          )}
          {(this.props.allUsers || this.props.newUser || this.props.pendingKyc || this.props.completedKyc || this.props.rejectKyc)  && (
          <li className={this.isPathActive('/user') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.userMenu ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('userMenu')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-face"></i>
              </span>
              <span className="menu-title"><Trans>User Manager</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.userMenu}>
              <div>
                <ul className="nav flex-column sub-menu">
                  {this.props.allUsers && (
                  <li className="nav-item"> <Link className={this.isPathActive('/user/allusers') ? 'nav-link active' : 'nav-link'} to="/user/allusers"><Trans>View All Users</Trans></Link></li>
                  )}
                  {this.props.newUser && (
                  <li className="nav-item"> <Link className={this.isPathActive('/user/adduser') ? 'nav-link active' : 'nav-link'} to="/user/adduser"><Trans>Add New User</Trans></Link></li>
                  )}
                  {this.props.pendingKyc && (
                  <li className="nav-item"> <Link className={this.isPathActive('/user/UserKyc') ? 'nav-link active' : 'nav-link'} to="/user/UserKyc"><Trans>Pending Kyc</Trans></Link></li>
                  )}
                  {this.props.completedKyc && (
                  <li className="nav-item"> <Link className={this.isPathActive('/user/kyc') ? 'nav-link active' : 'nav-link'} to="/user/kyc"><Trans>Completed Kyc</Trans></Link></li>
                  )}
                  {this.props.rejectKyc && (
                  <li className="nav-item"> <Link className={this.isPathActive('/user/reject') ? 'nav-link active' : 'nav-link'} to="/user/reject"><Trans>Reject Kyc</Trans></Link></li>
                  )}
                </ul>
              </div>
            </Collapse>
          </li>
          )}
          {(this.props.allChallenges||this.props.completedChallenges||this.props.conflictChallenges||this.props.cancelledChallenges||this.props.runningChallenges || this.props.newChallenge || this.props.dropChallenge) && (
          <li className={this.isPathActive('/challenge') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.challengeMenu ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('challengeMenu')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-xbox-controller"></i>
              </span>
              <span className="menu-title"><Trans>Challenge Manager</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.challengeMenu}>
              <div>
                <ul className="nav flex-column sub-menu">
                  {this.props.allChallenges && (
                  <li className="nav-item"> <Link className={this.isPathActive('/challenge/allchallenges') ? 'nav-link active' : 'nav-link'} to="/challenge/allchallenges"><Trans>View All Challenge</Trans></Link></li>
                  )}
                  {this.props.completedChallenges && (
                  <li className="nav-item"> <Link className={this.isPathActive('/challenge/completed_challange') ? 'nav-link active' : 'nav-link'} to="/challenge/completed_challange"><Trans>Completed Challenge</Trans></Link></li>
                  )}
                  {this.props.conflictChallenges && (
                  <li className="nav-item"> <Link className={this.isPathActive('/challenge/conflict_challange') ? 'nav-link active' : 'nav-link'} to="/challenge/conflict_challange"><Trans>Conflict Challenge</Trans></Link></li>
                  )}
                  {this.props.cancelledChallenges && (
                  <li className="nav-item"> <Link className={this.isPathActive('/challenge/cancelled_challange') ? 'nav-link active' : 'nav-link'} to="/challenge/cancelled_challange"><Trans>Cancelled Challenge</Trans></Link></li>
                  )}
                  {this.props.runningChallenges && (
                  <li className="nav-item"> <Link className={this.isPathActive('/challenge/running_challange') ? 'nav-link active' : 'nav-link'} to="/challenge/running_challange"><Trans>Running Challenge</Trans></Link></li>
                  )}
                  
                  {this.props.dropChallenges && (
                  <li className="nav-item"> <Link className={this.isPathActive('/challenge/drop_challange') ? 'nav-link active' : 'nav-link'} to="/challenge/drop_challange"><Trans>Drop Challenge</Trans></Link></li>
                  )}

                  {this.props.newChallenge && (
                  <li className="nav-item"> <Link className={this.isPathActive('/challenge/new_challange') ? 'nav-link active' : 'nav-link'} to="/challenge/new_challange"><Trans>New Challenge</Trans></Link></li>
                  )}
                </ul>
              </div>
            </Collapse>
          </li>
          )}
          {(this.props.penaltyBonus || this.props.depositHistory || this.props.withdrawlHistory || this.props.allWithdrawlRequests || this.props.allDepositRequests ) && (
          <li className={this.isPathActive('/transaction') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.transactionMenu ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('transactionMenu')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-transit-transfer"></i>
              </span>
              <span className="menu-title"><Trans>Transaction Manager</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.transactionMenu}>
              <div>
                <ul className="nav flex-column sub-menu">
                  {this.props.penaltyBonus && (
                  <li className="nav-item"> <Link className={this.isPathActive('/transaction/penaltybonus') ? 'nav-link active' : 'nav-link'} to="/transaction/penaltybonus"><Trans>Penalty & Bonus</Trans></Link></li>
                  )}
                  {this.props.depositHistory && (
                  <li className="nav-item"> <Link className={this.isPathActive('/transaction/transaction_history') ? 'nav-link active' : 'nav-link'} to="/transaction/transaction_history"><Trans>Deposit history</Trans></Link></li>
                  )}
                  {this.props.bonusHistory && (
                  <li className="nav-item"> <Link className={this.isPathActive('/transaction/bonus_history') ? 'nav-link active' : 'nav-link'} to="/transaction/bonus_history"><Trans>Bonus history</Trans></Link></li>
                  )}
                  {this.props.withdrawlHistory && (
                  <li className="nav-item"> <Link className={this.isPathActive('/transaction/withdraw') ? 'nav-link active' : 'nav-link'} to="/transaction/withdraw"><Trans>Withdrawl Requests</Trans></Link></li>
                  )}
                  {this.props.allWithdrawlRequests && (
                  <li className="nav-item"> <Link className={this.isPathActive('/transaction/allwithdrawl') ? 'nav-link active' : 'nav-link'} to="/transaction/allwithdrawl"><Trans>View All Withdrawl Request</Trans></Link></li>
                  )}
                  {this.props.allDepositRequests && (
                  <li className="nav-item"> <Link className={this.isPathActive('/transaction/alldeposits') ? 'nav-link active' : 'nav-link'} to="/transaction/alldeposits"><Trans>View All Deposit Request</Trans></Link></li>
                  )}
                </ul>
              </div>
            </Collapse>
          </li>
          )}
          {/* {this.props.pages &&
            <li className={this.isPathActive('/Pages') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <Link className="nav-link" to="/Pages">
              <span className="menu-icon"><i className="mdi mdi-speedometer"></i></span>
              <span className="menu-title"><Trans>Pages</Trans></span>
            </Link>
          </li>
          } */}
{/* Added By Team */}
{(this.props.bonusReport || this.props.depositReport || this.props.penaltyReport || this.props.withdrawlReport)  && (
          <li className={this.isPathActive('/reports') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.reportsMenu ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('reportsMenu')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-poll-box"></i>
              </span>
              <span className="menu-title"><Trans>Reports</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.reportsMenu}>
              <div>
                <ul className="nav flex-column sub-menu">
                  {this.props.bonusReport && (
                  <li className="nav-item"> <Link className={this.isPathActive('/Reports/bonus_report') ? 'nav-link active' : 'nav-link'} to="/Reports/bonusReport"><Trans>bonus Report</Trans></Link></li>
                  )}
                  {this.props.depositReport && (
                  <li className="nav-item"> <Link className={this.isPathActive('/Reports/deposit_report') ? 'nav-link active' : 'nav-link'} to="/Reports/depositReport"><Trans>deposit Report</Trans></Link></li>
                  )}
                  {this.props.penaltyReport && (
                  <li className="nav-item"> <Link className={this.isPathActive('/Reports/penalty_report') ? 'nav-link active' : 'nav-link'} to="/Reports/penaltyReport"><Trans>penalty Report</Trans></Link></li>
                  )}
                  {this.props.withdrawalReport && (
                  <li className="nav-item"> <Link className={this.isPathActive('/Reports/withdrawal_report') ? 'nav-link active' : 'nav-link'} to="/Reports/withdrawalReport"><Trans>withdrawal Report</Trans></Link></li>
                  )}
                </ul>
              </div>
            </Collapse>
          </li>
          )}
           {/*Added By Team */}

          
          {/* <li className={this.isPathActive('/basic-ui') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.basicUiMenuOpen ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('basicUiMenuOpen')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-laptop"></i>
              </span>
              <span className="menu-title"><Trans>Basic UI Elements</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.basicUiMenuOpen}>
              <div>
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item"> <Link className={this.isPathActive('/basic-ui/buttons') ? 'nav-link active' : 'nav-link'} to="/basic-ui/buttons"><Trans>Buttons</Trans></Link></li>
                  <li className="nav-item"> <Link className={this.isPathActive('/basic-ui/dropdowns') ? 'nav-link active' : 'nav-link'} to="/basic-ui/dropdowns"><Trans>Dropdowns</Trans></Link></li>
                  <li className="nav-item"> <Link className={this.isPathActive('/basic-ui/typography') ? 'nav-link active' : 'nav-link'} to="/basic-ui/typography"><Trans>Typography</Trans></Link></li>
                </ul>
              </div>
            </Collapse>
          </li> */}
          {/* <li className={this.isPathActive('/form-elements') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.formElementsMenuOpen ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('formElementsMenuOpen')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-playlist-play"></i>
              </span>
              <span className="menu-title"><Trans>Form Elements</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.formElementsMenuOpen}>
              <div>
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item"> <Link className={this.isPathActive('/form-elements/basic-elements') ? 'nav-link active' : 'nav-link'} to="/form-elements/basic-elements"><Trans>Basic Elements</Trans></Link></li>
                </ul>
              </div>
            </Collapse>
          </li> */}
          {/* <li className={this.isPathActive('/tables') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.tablesMenuOpen ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('tablesMenuOpen')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-table-large"></i>
              </span>
              <span className="menu-title"><Trans>Tables</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.tablesMenuOpen}>
              <div>
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item"> <Link className={this.isPathActive('/tables/basic-table') ? 'nav-link active' : 'nav-link'} to="/tables/basic-table"><Trans>Basic Table</Trans></Link></li>
                </ul>
              </div>
            </Collapse>
          </li> */}
          {/* <li className={this.isPathActive('/charts') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.chartsMenuOpen ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('chartsMenuOpen')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-chart-bar"></i>
              </span>
              <span className="menu-title"><Trans>Charts</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.chartsMenuOpen}>
              <div>
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item"> <Link className={this.isPathActive('/charts/chart-js') ? 'nav-link active' : 'nav-link'} to="/charts/chart-js"><Trans>Chart Js</Trans></Link></li>
                </ul>
              </div>
            </Collapse>
          </li> */}
          {/* <li className={this.isPathActive('/icons') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.iconsMenuOpen ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('iconsMenuOpen')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-contacts"></i>
              </span>
              <span className="menu-title"><Trans>Icons</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.iconsMenuOpen}>
              <div>
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item"> <Link className={this.isPathActive('/icons/mdi') ? 'nav-link active' : 'nav-link'} to="/icons/mdi"><Trans>Material</Trans></Link></li>
                </ul>
              </div>
            </Collapse>
          </li> */}
          {/* <li className={this.isPathActive('/user-pages') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.userPagesMenuOpen ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('userPagesMenuOpen')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-security"></i>
              </span>
              <span className="menu-title"><Trans>User Pages</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.userPagesMenuOpen}>
              <div>
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item"> <Link className={this.isPathActive('/user-pages/login-1') ? 'nav-link active' : 'nav-link'} to="/user-pages/login-1"><Trans>Login</Trans></Link></li>
                  <li className="nav-item"> <Link className={this.isPathActive('/user-pages/register-1') ? 'nav-link active' : 'nav-link'} to="/user-pages/register-1"><Trans>Register</Trans></Link></li>
                </ul>
              </div>
            </Collapse>
          </li> */}
          {/* <li className="nav-item nav-category">
            <span className="nav-link"><Trans>More</Trans></span>
          </li> */}
          {/* <li className={this.isPathActive('/error-pages') ? 'nav-item menu-items active' : 'nav-item menu-items'}>
            <div className={this.state.errorPagesMenuOpen ? 'nav-link menu-expanded' : 'nav-link'} onClick={() => this.toggleMenuState('errorPagesMenuOpen')} data-toggle="collapse">
              <span className="menu-icon">
                <i className="mdi mdi-lock"></i>
              </span>
              <span className="menu-title"><Trans>Error Pages</Trans></span>
              <i className="menu-arrow"></i>
            </div>
            <Collapse in={this.state.errorPagesMenuOpen}>
              <div>
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item"> <Link className={this.isPathActive('/error-pages/error-404') ? 'nav-link active' : 'nav-link'} to="/error-pages/error-404">404</Link></li>
                  <li className="nav-item"> <Link className={this.isPathActive('/error-pages/error-500') ? 'nav-link active' : 'nav-link'} to="/error-pages/error-500">500</Link></li>
                </ul>
              </div>
            </Collapse>
          </li> */}
          {/* <li className="nav-item menu-items">
            <a className="nav-link" href="http://bootstrapdash.com/demo/corona-react-free/documentation/documentation.html" rel="noopener noreferrer" target="_blank">
              <span className="menu-icon">
                <i className="mdi mdi-file-document-box"></i>
              </span>
              <span className="menu-title"><Trans>Documentation</Trans></span>
            </a>
          </li> */}
        </ul>
      </nav>
    );
  }

  isPathActive(path) {
    return this.props.location.pathname.startsWith(path);
  }

  componentDidMount() {
    this.onRouteChanged();
    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    const body = document.querySelector('body');
    document.querySelectorAll('.sidebar .nav-item').forEach((el) => {

      el.addEventListener('mouseover', function () {
        if (body.classList.contains('sidebar-icon-only')) {
          el.classList.add('hover-open');
        }
      });
      el.addEventListener('mouseout', function () {
        if (body.classList.contains('sidebar-icon-only')) {
          el.classList.remove('hover-open');
        }
      });
    });
  }

}

export default withRouter(Sidebar);