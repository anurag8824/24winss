import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import * as XLSX from "xlsx";
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";



const $ = require("jquery");
$.Datatable = require("datatables.net");

const BonusReport = () => {
  const [user, setUser] = useState();

  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }

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
  //user for searching..
  // const [searchList, setSearchList] = useState(0);
  // const [searchType, setSearchType] = useState(0);

  //react paginate..
  const handlePageClick = async (data) => {
    let currentPage = data.selected + 1;
    setPageNumber(currentPage);
    // scroll to the top
    //window.scrollTo(0, 0)
  };

  const profle = () => {
    const access_token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };
    axios
      .get(
        baseUrl + `txn/bonusreports/all?page=${pageNumber}&_limit=${limit}&FROM_DATE=${values[0]}&TO_DATE=${values[1]}`,
        { headers }
      )
      .then((res) => {
        //console.log(res.data.admin);
        setUser(res.data.datefind);
        setNumberOfPages(res.data.totalPages);
        //$('table').dataTable();
      });
  };

  const dateFormat = (e) => {
    const date = new Date(e);
    const newDate = date.toLocaleString('default', {year:'numeric', month: 'numeric', day: 'numeric' });
    return newDate;
}


  useEffect(() => {
    profle();
  }, [pageNumber, limit,values]);

  if (user === undefined) {
    return null;
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
        D: "Bonus Amount",
        E: "Bonus By",
        // F:"Bonus by (ID)"
      },
    ];

    user.forEach((row) => {
      const userDetails = row;
      console.log("exldata", userDetails);
      table1.push({
        A: userDetails._id,
        B: userDetails.User_id ? userDetails.User_id.Name : "",
        C: userDetails.User_id ? userDetails.User_id.Phone : "",
        D: userDetails.amount,
        E: userDetails.action_byName ? userDetails.action_byName : "N/A",
        // F:(userDetails.action_by)?userDetails.action_by:'N/A'
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
    XLSX.writeFile(wb, "BonusReport.xlsx");
  };
  return (
    <>
      <div className="row ">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body text-light" style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
              <h4 className="card-title">Bonus Reports</h4>
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


              <div className="table-responsive">
                <table className="table text-light">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th> ID</th>
                      <th> Phone</th>
                      <th> User</th>
                      <th> Amount </th>
                      <th> Status </th>
                      <th> Date </th>
                      <th> Bonus By</th>
                      {/* <th> Bonus By ID </th> */}
                    </tr>
                  </thead>

                  <tbody>
                    {user &&
                      user.map((data, key) => (
                        <tr>
                          <td>{key + 1}</td>
                          <td>{data._id}</td>
                          <td>
                            <span className="pl-2">
                              {data.User_id ? data.User_id.Phone : ""}
                            </span>
                          </td>
                          <td>
                            {data.User_id && (
                              <Link
                                className="btn btn-sm btn-outline-info"
                                to={`/user/view_user/${data.User_id._id}`}
                              >
                                {data.User_id.Name}
                              </Link>
                            )}
                          </td>

                          <td>{data.amount}</td>
                          <td className="font-weight-bold text-success">
                            {data.status}
                          </td>
                          <td>{dateFormat(data.createdAt).split(",")[0]} </td>
                          <td>{(data.action_by)?data.action_by.Name:'N/A'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
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
};

export default BonusReport;
