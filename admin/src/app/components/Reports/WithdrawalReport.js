import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import * as XLSX from "xlsx";
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";
const $ = require("jquery")
$.Datatable = require("datatables.net");

const SucWithdraw = () => {

    const [user, setUser] = useState()

    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if(nodeMode==="development"){
      var baseUrl =  beckendLocalApiUrl;
    }else{
      baseUrl = beckendLiveApiUrl
    }

    //use for pagination..
    let [limit,setLimit] = useState(10);

  const setpageLimit = (event)=>{
    let key = event.target.value
    setLimit(key);
}
    const [pageNumber, setPageNumber] = useState(0);
    const [numberOfPages, setNumberOfPages] = useState(0);
    const [values, setValues] = useState([
        new DateObject().subtract(4, "days"),
        new DateObject().add(4, "days")
      ])

    //react paginate..
    const handlePageClick = async (data) => {
        let currentPage = data.selected + 1;
        setPageNumber(currentPage);
        // scroll to the top
        //window.scrollTo(0, 0)
      };

    
    const profle = () => {

        const access_token = localStorage.getItem("token")
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.get(baseUrl+`txn/withdrawalreports/all?page=${pageNumber}&_limit=${limit}&FROM_DATE=${values[0]}&TO_DATE=${values[1]}`, { headers })
            .then((res) => {
                setUser(res.data.datefind)
                setNumberOfPages(res.data.totalPages)
                //$('table').dataTable();
                //console.log(res.data.data)
            })
    }



    const dateFormat = (e) => {
        const date = new Date(e);
        const newDate = date.toLocaleString('default', {year:'numeric', month: 'numeric', day: 'numeric' });
        return newDate;
    }

    useEffect(() => {
        profle()
    }, [pageNumber,limit,values])


    if (user == undefined) {
        return null
    }

    
const createDownloadData = () => {
  handleExport();
};
const handleExport = () => {
  let table1 = [
    {
      A: "Id",
      B: "UserName",
      C: "PhoneNumber",
      D: "Withdrawal Amount",
      E: "Status",
      F: "Upi Id",
      G: "Action by",
    },
  ];

  user.forEach((row) => {
    const userDetails = row;
console.log('exldata',userDetails);
    table1.push({
      A: userDetails._id,
      B: (userDetails.User_id)?userDetails.User_id.Name:'',
      C: (userDetails.User_id)?userDetails.User_id.Phone:'',
      D: userDetails.amount?userDetails.amount:'',
      E: userDetails.status?userDetails.status:'',
      F: userDetails.User_id.upi_id,
      G: (userDetails.action_by)?userDetails.action_by.Name:'N/A',
    });
  });

  //table1 = [{A:"User Details"}].concat(table1);
  //const finalData = [...table1];
  //console.log(finalData);
  /* convert state to workbook */
  const ws = XLSX.utils.json_to_sheet(table1, {
    skipHeader: true,
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
  /* generate XLSX file and send to client */
  XLSX.writeFile(wb, "WithdrawalReport.xlsx");


};
    return (
        <>
            {/* <h4 className='font-weight-bold my-3'>ALL CHALLANGES</h4> */}
            <div className="row ">
                <div className="col-12 grid-margin">
                    <div className="card">
                        <div className="card-body text-light" style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
                            <h4 className="card-title">withdrawal Reports</h4>
                            <button
                  onClick={() => {
                    createDownloadData();
                  }}
                  className="btn btn-primary"
                >
                  Export Data
                </button>
                <DatePicker value={values} onChange={setValues} range />
                <select  className='form-control col-sm-1 m-1 bg-dark text-light' id='pagelimit' name='pagelimit' onChange={setpageLimit}>
                                <option value="10">Set limit</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>
                            {/* searching */}
                            {/* <div className='row'>
                            <select  className='form-control col-sm-3 m-2' id='searchType' name='searchtype' onChange={(e) => setSearchType(e.target.value)}>
                                <option value="0">Select Search by</option>
                                <option value="Name">Name</option>
                                <option value="Phone">Phone</option>
                            </select>
                            <input type='text' placeholder='Search...' className='form-control col-sm-4 m-2' onChange={searchHandler} />
                            <h5>Or</h5>
                            <select  className='form-control col-sm-3 m-2' id='findByStatus' name='findByStatus' onChange={searchByStatus}>
                                <option value="0">Search Status</option>
                                <option value="SUCCESS">Success</option>
                                <option value="Pending">Pending</option>
                                <option value="none">Proccessing</option>
                                <option value="reject">Reject</option>
                                <option value="FAILED">Failed</option>
                            </select>
                            </div> */}

                            <div className="table-responsive">
                                <table className="table text-light">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th> ID</th>
                                            <th> Phone</th>
                                            <th> User</th>
                                            <th> type</th>
                                            <th> Paytm Number</th>
                                            <th> Amount </th>
                                            <th> Status </th>
                                            <th> Time </th>
                                            <th>action by</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                    {user && user.map((data, key) => (
                                            <tr>
                                                <td>{key + 1}</td>
                                                <td>{data._id}</td>
                                                <td>
                                                    <span className="pl-2">{data.User_id ? data.User_id.Phone : ''}</span>
                                                </td>
                                                <td>{data.User_id && <Link className="btn btn-sm btn-outline-info" to={`/user/view_user/${data.User_id._id}`} >{data.User_id.Name}</Link>}</td>
                                                
                                               
                                                <td>
                                                    <span className="pl-2">{data.Withdraw_type}</span>
                                                </td>

                                                <td>
                                                    <span className="pl-2">{data.User_id?.upi_id}</span>
                                                </td>
                                                <td>{data.amount}</td>
                                                <td className='font-weight-bold text-success'>{(data.status==="none")? 'Proccessing':data.status}</td>
                                                <td>{dateFormat(data.createdAt).split(',')[0]}</td>
                                                <td>{(data.action_by)?data.action_by.Name:'N/A'}</td>
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

export default SucWithdraw
