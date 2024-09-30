import React, { Component } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { Trans } from 'react-i18next';
import axios from 'axios';

class Navbar extends Component {

  logout = () => {

    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if(nodeMode==="development"){
      var baseUrl =  beckendLocalApiUrl;
    }else{
       baseUrl = beckendLiveApiUrl
    }
    
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.post(baseUrl+`logout`, {
      headers: headers
    }, { headers })
      .then((res) => {
        console.log(res);
        // setUser(res.data)
        localStorage.removeItem("token", "user")
        window.location.reload()
        window.location.assign("/adminlogin")

      }).catch((e) => {
        if (e.response.status === 401) {
          localStorage.removeItem('token', "user");
          localStorage.removeItem('token', "user");
          window.location.assign("/adminlogin")
        }
      })

  }

  toggleOffcanvas() {
    document.querySelector('.sidebar-offcanvas').classList.toggle('active');
  }
  toggleRightSidebar() {
    document.querySelector('.right-sidebar').classList.toggle('open');
  }
  render() {
    return (
      <nav className="navbar p-0 fixed-top d-flex flex-row">
        <div className="navbar-brand-wrapper d-flex d-lg-none align-items-center justify-content-center">
          <Link className="navbar-brand brand-logo-mini" to="/"><img src='https://cdn-icons-png.flaticon.com/512/2206/2206368.png' alt="logo" /></Link>
        </div>
        <div className="navbar-menu-wrapper flex-grow d-flex align-items-stretch">
          <button className="navbar-toggler align-self-center" type="button" onClick={() => document.body.classList.toggle('sidebar-icon-only')}>
            <span className="mdi mdi-menu"></span>
          </button>
          <ul className="navbar-nav w-100">
            <li className="nav-item w-100">
              <h6>{this.props.userAname}</h6>
            </li>
          </ul>
          <ul className="navbar-nav navbar-nav-right">
            
            <Dropdown alignRight as="li" className="nav-item">
              <Dropdown.Toggle as="a" className="nav-link cursor-pointer no-caret">
                <div className="navbar-profile">
                  <img className="img-xs rounded-circle" src="https://cdn-icons-png.flaticon.com/512/2206/2206368.png" alt="profile" />
                 
                   <p className="mb-0 d-none d-sm-block navbar-profile-name"><Trans>User: {this.props.usertype}</Trans></p>
                  <i className="mdi mdi-menu-down d-none d-sm-block"></i>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="navbar-dropdown preview-list navbar-profile-dropdown-menu">


                <Dropdown.Item onClick={() => this.logout()} className="preview-item">
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-dark rounded-circle">
                      <i className="mdi mdi-logout text-danger"></i>
                    </div>
                  </div>
                  <div className="preview-item-content" >
                    <p className="preview-subject mb-1 text-dark"  ><Trans>Log Out</Trans></p>
                  </div>
                </Dropdown.Item> 
              </Dropdown.Menu>
            </Dropdown>
          </ul>
          <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" onClick={this.toggleOffcanvas}>
            <span className="mdi mdi-format-line-spacing"></span>
          </button>
        </div>
      </nav>
    );
  }
}

export default Navbar;
