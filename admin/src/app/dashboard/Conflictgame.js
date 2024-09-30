import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
// import './table.css';
const $ = require("jquery")
$.Datatable = require("datatables.net");

export default function Conflictgame() {
  const [challenge, setchallenge] = useState();
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }

  
  //use for pagination..
  let limit = 10;
  const [pageNumber, setPageNumber] = useState(0);
  const [numberOfPages, setNumberOfPages] = useState(0);

  //react paginate..
  const handlePageClick = async (data) => {
      let currentPage = data.selected + 1;
      setPageNumber(currentPage);
      // scroll to the top
      //window.scrollTo(0, 0)
    };

  const Allchallenge = async () => {
    //console.log('call treu')
    const access_token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    axios
      .get(baseUrl+`admin/challange/dashboard/all?page=${pageNumber}&_limit=${limit}`, { headers })
      .then((res) => {
        setchallenge(res.data.status)
        setNumberOfPages(res.data.totalPages)
        //$('table').dataTable();
      });
  };

  
const dateFormat=(e)=>{
      
  const date = new Date(e); 
const newDate = date.toLocaleString('default', { month: 'long',day:'numeric',hour:'numeric',hour12:true,minute:'numeric' });
return newDate;
  }
  
  
  const CancelGame = async (id) => {
    const confirm = window.confirm("are you sure to cancel");

    if (confirm) {
      let access_token = localStorage.getItem("token");
      access_token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${access_token}`,
      };
      axios
        .patch(
          baseUrl+`challange/Cancel/admin/${id}`,
          { Cancelled_by: access_token },
          { headers }
        )
        .then((res) => {
          Allchallenge();
        });
    } else {
      window.alert("sorry try again");
    }
  };

  useEffect(() => {
    Allchallenge();
  },[pageNumber,limit]);

   if (challenge === undefined) {
       return null
   }

  return (
    <>
      {/* <h4 className='font-weight-bold my-3'>ALL CHALLANGES</h4> */}
      <div className="row ">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Games</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th> ID</th>
                      <th> Player1</th>
                      <th> Player2</th>
                      <th> Amount </th>
                      <th> Status </th>
                       <th> Game Type </th> 
                       <th>Date</th>
                      <th> Action </th>
                    </tr>
                  </thead>

                  <tbody>
                    {challenge  && 
                      challenge.map((game, key) => (
                        <tr key={game._id}>
                          <td>{key + 1}</td>
                          <td>{game._id}</td>
                          <td>
                            <span className="pl-2 ">
                              {game.Created_by?.Name}
                            </span>
                          </td>

                          <td>
                            <span className="pl-2">
                              {game.Accepetd_By ? game.Accepetd_By?.Name : null}
                            </span>
                          </td>
                          <td>{game.Game_Ammount}</td>
                          
                          <td className="text-primary font-weight-bold">
                             {game.Status}
                          </td>
                          
                          <td>{game.Game_type}</td>
                          <td>{dateFormat(game.createdAt).split(',')[0]} </td>

                          <td>
                            <Link
                              type="button"
                              className="btn btn-primary mx-1"
                              to={`/view/${game._id}`}
                            >
                              View
                            </Link>
                            
                          </td>
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
  );
}
