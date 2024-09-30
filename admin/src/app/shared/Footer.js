import React, { Component } from 'react'; 
import "../dashboard/Dashboard.css"

class Footer extends Component {
  render () {
    return (
      <footer className="footer bg-white" id='dashFooter' style={{background:'white'}}>
        <div className="container-fluid">
          <div className="d-sm-flex justify-content-center justify-content-sm-between py-2 w-100">
            <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">Copyright © <a href="https://24wins.in/" target="_blank" rel="noopener noreferrer">24 Win</a>2024</span>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;