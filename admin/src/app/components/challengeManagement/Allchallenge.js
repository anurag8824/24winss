import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import ReactPaginate from "react-paginate";
const $ = require("jquery")
$.Datatable = require("datatables.net");



export default function Allchallenge() {
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
      var baseUrl = beckendLocalApiUrl;
    } else {
      baseUrl = beckendLiveApiUrl;
    }

    const [challenge, setchallenge] = useState()
    
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
        // scroll to the top
        //window.scrollTo(0, 0)
      };
      
    const Allchallenge = async () => {
        const access_token = localStorage.getItem('token')
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.get(baseUrl+`admin/challange/all?page=${pageNumber}&_limit=${limit}`, { headers })
            .then((res) => {
                //console.log(res.data.status)
                setchallenge(res.data.status)
                setNumberOfPages(res.data.totalPages)
                //$('table').dataTable();
            })
    }
    
    const dateFormat=(e)=>{
      
  const date = new Date(e); 
const newDate = date.toLocaleString('default', { month: 'long',day:'numeric',hour:'numeric',hour12:true,minute:'numeric' });
return newDate;
  }

    const CancelGame = async (id) => {
        const confirm = window.confirm("are you sure to cancel")

        if (confirm == true) {
            const access_token = localStorage.getItem('token')
            const headers = {
                Authorization: `Bearer ${access_token}`

            }
            axios.patch(baseUrl+`challange/Cancel/${id}`, { Cancelled_by: access_token }, { headers })
                .then((res) => {
                    Allchallenge()
                })
        }
        else {
            window.alert("sorry try again")
        }
    }


    useEffect(() => {
        Allchallenge()
    },[pageNumber,limit])

    if (challenge == undefined) {
        return null
    }




    return (
        <>
            {/* <h4 className='font-weight-bold my-3'>ALL CHALLANGES</h4> */}
            <div className="row ">
                <div className="col-12 grid-margin">
                    <div className="card">
                        <div className="card-body text-light" style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
                            <h4 className="card-title">ALL CHALLANGES</h4>
                            <select  className='form-control col-sm-1 m-1 bg-dark text-light' id='pagelimit' name='pagelimit' onChange={setpageLimit}>
                                <option value="10">Set limit</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>
                            <div className="table-responsive">
                                <table className="table text-light" >
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th> ID</th>
                                            <th> Creator</th>
                                            <th> Accepter</th>
                                            <th> Amount </th>
                                            <th> Status </th>
                                            <th> Game Type </th>
                                            <th> Winner </th>
                                            <th>Date</th>
                                            <th> Action </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {challenge && challenge.map((game, key) => (
                                            <tr key={game._id}>
                                                <td>{key + 1}</td>
                                                <td>{game._id}</td>
                                                <td>
                                                    <span className="pl-2 ">{game.Created_by?game.Created_by.Name:null}</span>
                                                </td>
                                                
                                                <td>
                                                    <span className="pl-2">{game.Accepetd_By?game.Accepetd_By.Name:null}</span>
                                                </td>
                                                <td>{game.Game_Ammount}</td>
                                                <td className='text-primary font-weight-bold'>{game.Status}</td>
                                                <td>{game.Game_type}</td>
                                                
                                                <td>{game.Winner ? game.Winner.Name : null}</td>
                                                <td>{dateFormat(game.createdAt).split(',')[0]} </td>
                                                <td>
                                                    <Link type='button' className="btn btn-primary mx-1"to={`/view/${game._id}`}>View</Link>
                                                    {/* {game.Status != "cancelled" && game.Status != "completed" && game.Status != "conflict" && <button type='button' className="btn  mx-1 btn-danger" onClick={() => CancelGame(game._id)}>Cancel</button>} */}
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
    )
}
