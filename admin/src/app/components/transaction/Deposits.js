import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./imageview.css";
const $ = require("jquery")
$.Datatable = require("datatables.net");

const Deposits = () => {


  const [user, setUser] = useState()
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }

  const profle = () => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.get(baseUrl + `temp/deposit/pending`, { headers })
      .then((res) => {
        setUser(res.data)
        $('table').dataTable();
        imageViewer();
        //   console.log(user)
      })
  }





  const update = async (id) => {
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.patch(baseUrl + `temp/deposite/${id}`,
      {
        status: "PAID"
      },
      { headers })
      .then((res) => {
        profle()
      }).catch((e) => {
        console.log(e);
      })
  }

  const cancelledData = async (id) => {
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.delete(baseUrl + `temp/deposit/delete/${id}`,

      { headers })
      .then((res) => {
        profle()

      }).catch((e) => {
        console.log(e);
      })
  }


  //   onClick={() => {
  //    // window.open(item.Document)
  //    console.log(item.Document)
  //    const ss = document.getElementById(`ss${index}`)
  //    const width = ss.style.width
  //    const height = ss.style.height
  //    if (width === '4rem') {
  //      ss.style.width = '100%'
  //      ss.style.height = '100%'
  //    }
  //    else {
  //      ss.style.width = '4rem'
  //      ss.style.height = '4rem'
  //    }
  //  }}

  function imageViewer() {
    let imgs = document.getElementsByClassName("img"),
      out = document.getElementsByClassName("img-out")[0];
    for (let i = 0; i < imgs.length; i++) {

      if (!imgs[i].classList.contains("el")) {

        imgs[i].classList.add("el");
        imgs[i].addEventListener("click", lightImage);
        function lightImage() {
          let container = document.getElementsByClassName("img-panel")[i];
          container.classList.toggle("img-panel__selct");
        };

        imgs[i].addEventListener("click", openImage);
        function openImage() {
          let imgElement = document.createElement("img"),
            imgWrapper = document.createElement("div"),
            imgClose = document.createElement("div"),
            container = document.getElementsByClassName("img-panel")[i];
          container.classList.add("img-panel__selct");
          imgElement.setAttribute("class", "image__selected");
          imgElement.src = imgs[i].src;
          imgWrapper.setAttribute("class", "img-wrapper");
          imgClose.setAttribute("class", "img-close");
          imgWrapper.appendChild(imgElement);
          imgWrapper.appendChild(imgClose);


          setTimeout(
            function () {
              imgWrapper.classList.add("img-wrapper__initial");
              imgElement.classList.add("img-selected-initial");
            }, 50);

          out.appendChild(imgWrapper);
          imgClose.addEventListener("click", function () {
            container.classList.remove("img-panel__selct");
            out.removeChild(imgWrapper);
          });
        }
      }
    }
  }

  const dateFormat = (e) => {

    const date = new Date(e);
    const newDate = date.toLocaleString('default', { month: 'long', day: 'numeric', hour: 'numeric', hour12: true, minute: 'numeric' });
    return newDate;
}
  useEffect(() => {
    profle()
  }, [])


  if (user == undefined) {
    return null
  }


  return (
    <div className="row ">
      <div className="col-12 grid-margin">
        <div className="card">
          <div className="card-body">
            <div className="img-out"></div>
            <h4 className="card-title">Deposit Request</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th> ID</th>
                    <th> Username</th>
                    <th> Amount </th>
                    <th> TransactionId </th>
                    <th> Date </th>
                    <th> screenshot </th>
                    <th> Action </th>
                  </tr>
                </thead>

                <tbody>
                  {user && user.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>{item._id}</td>
                      <td>{item.User_id.Name}</td>
                      <td>{item.amount}</td>
                      <td>{item.referenceId}</td>
                      <td>{dateFormat(item.createdAt).split(',')[0]}</td>
                      <td>
                        <div className="img-panel">

                          <img className="img" src={baseUrl + `${item.Transaction_Screenshot}`} style={{
                            borderRadius: '5px',
                            width: '4rem',
                            height: '4rem',
                          }}
                            id={`ss${index}`}
                          />
                        </div>
                      </td>
                      <td>
                        {item.status == "Pending" && <button className="btn btn-primary mr-2" onClick={() => update(item._id)} >Approve</button>}

                        {item.status == "PAID" && <button className="btn btn-success mr-2" >success</button>}
                        {item.status == "Pending" && <button className="btn btn-danger mr-2" onClick={() => cancelledData(item._id)} >delete</button>}
                      </td>
                      {/* <td> */}
                    </tr>

                  ))
                  }
                </tbody>

              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposits;
