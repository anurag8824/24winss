import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation, Link } from 'react-router-dom'
import ReactPaginate from 'react-paginate'
const $ = require("jquery")
$.Datatable = require("datatables.net");
// import "../transaction/imageview.css"


export default function UserKyc() {
  const [data, setData] = useState([])
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }

  
  //use for pagination..
  let [limit,setLimit] = useState(10);

  const setpageLimit = (event)=>{
    let key = event.target.value
    setLimit(key);
}
  const [pageNumber, setPageNumber] = useState(0);
  const [numberOfPages, setNumberOfPages] = useState(0);
  
  //react paginate..
  const handlePageClick = async (data) => {
      let currentPage = data.selected + 1;
      setPageNumber(currentPage);
    };

  const All = () => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.get(baseUrl+`aadharcard/all/all/all?page=${pageNumber}&_limit=${limit}`, { headers })
      .then((res) => {
        //setData(res.data)
        //$('table').dataTable();
        setData(res.data.admin)
        setNumberOfPages(res.data.totalPages)
        imageViewer();
      })
  }

  useEffect(() => {
    All()
  }, [pageNumber,limit])


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


  const update = (Id) => {


    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.patch(baseUrl+`aadharcard/${Id}`,
      { verified: "verified" },
      { headers })
      .then((res) => {
        All()
      })


  }
    const dateFormat = (e) => {
        const date = new Date(e);
        const newDate = date.toLocaleString('default', { month: 'long', day: 'numeric', hour: 'numeric', hour12: true, minute: 'numeric' });
        return newDate;
    }


  const deletedata = (Id) => {

    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.patch(baseUrl+`aadharcard/${Id}`,
      { verified: "reject" },
      { headers })
      .then((res) => {
        All()
      })

  }
  

  return (
    <>
      {/* <h4 className='font-weight-bold my-3'>ALL CHALLANGES</h4> */}
      <div className="row ">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body text-light" style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
              <div className="img-out"></div>
              <h4 className="card-title">KYC</h4>

              <select  className='form-control col-sm-1 m-1 bg-dark text-light' id='pagelimit' name='pagelimit' onChange={setpageLimit}>
                                <option value="10">Set limit</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>
              <div className="table-responsive">
                <table className="table text-light">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th> ID</th>
                      <th>Profile name</th>
                      <th>Doc name</th>
                      <th> Phone</th>
                      <th>  Aadhar no</th>
                      <th>DOB</th>
                      <th> Document-Front</th>
                      <th> Document-Back</th>
                      <th> status </th>
                      <th> Date </th>
                      <th> Approve or Reject </th>
                      {/* <th> View </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {data && data.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item._id}</td>
                        <td><Link type='button' className="btn btn-primary mx-1" to={`/user/view_user/${(item.User)?item.User._id:''}`}>{(item.User) ? item.User.Name : ''}</Link></td>
                        <td>{item.Name}</td>
                        <td>{(item.User)?item.User.Phone:''}</td>
                        <td>{item.Number}</td>
                        <td>{item.DOB}</td>
                        <td>
                          <div className="img-panel">
                            <img className="img" src={baseUrl+`${item.front}`} alt="kyc" style={{
                              borderRadius: '5px',
                              width: '4rem',
                              height: '4rem',
                            }}
                              id={`kyc${index}`}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="img-panel">
                            <img className="img" src={baseUrl+`${item.back}`} alt="kyc" style={{
                              borderRadius: '5px',
                              width: '4rem',
                              height: '4rem',
                            }}
                              id={`kyc${index}`}
                            />
                          </div>
                        </td>


                        <td>{item.verified}</td>
                        <td>{dateFormat(item.createdAt).split(',')[0]} </td>
                        <td>
                          <button className="btn btn-success mr-1" onClick={() => update(item._id)}>Approve</button>
                          <button className="btn btn-danger" onClick={() => deletedata(item._id)}>Reject</button>
                        </td>
                        {/* <td><Link to="/user/view" className="btn btn-primary">View</Link></td> */}
                      </tr>

                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className='mt-4'>
              <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={numberOfPages}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={3}
                  onPageChange={handlePageClick}
                  containerClassName={"pagination justify-content-center"}
                  pageClassName={"page-item"}
                  pageLinkClassName={"page-link"}
                  previousClassName={"page-item"}
                  previousLinkClassName={"page-link"}
                  nextClassName={"page-item"}
                  nextLinkClassName={"page-link"}
                  breakClassName={"page-item"}
                  breakLinkClassName={"page-link"}
                  activeClassName={"active"}
              />
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
