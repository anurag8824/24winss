import axios from 'axios'
import React, { useEffect, useState } from 'react'
import ReactPaginate from "react-paginate";
import * as XLSX from "xlsx";
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";

const $ = require("jquery")
$.Datatable = require("datatables.net");

function Earings() {

    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if(nodeMode==="development"){
      var baseUrl =  beckendLocalApiUrl;
    }else{
      var baseUrl = beckendLiveApiUrl
    } 

    //use for pagination..
    let [limit,setLimit] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);
    const [numberOfPages, setNumberOfPages] = useState(0);

    const setpageLimit = (event)=>{
        let key = event.target.value
        setLimit(key);
    }

    const [EARING, setEARING] = useState()
    const [TOTELEARING, setTOTELEARING] = useState()

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

    useEffect(() => {
        const access_token = localStorage.getItem("token")
        const headers = {
            Authorization: `Bearer ${access_token}`
        }
        axios.get(baseUrl+`admin/Earning?page=${pageNumber}&_limit=${limit}&FROM_DATE=${values[0]}&TO_DATE=${values[1]}`, { headers })
            .then((res) => {
                setEARING(res.data.admin)
                setNumberOfPages(res.data.totalPages)
                //$('table').dataTable();
            })
         axios.get(baseUrl+`admin/Earning/total`, { headers })
            .then((res) => {
                //console.log(res.data.total)
                setTOTELEARING(res.data.total)
    
            })
    },[pageNumber,limit,values])

    const createDownloadData = () => {
        handleExport();
      };
      const handleExport = () => {
        let table1 = [
          {
            A: "id",
            B: "Amount"
            // F:"Bonus by (ID)"
          },
        ];
    
        EARING.forEach((row) => {
          const Earing = row;
          //console.log("exldata", Earing);
          table1.push({
            A: `Earn From Challange ${Earing.Earned_Form} on ${Earing.createdAt}`,
            B: Earing.Ammount,
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
        XLSX.writeFile(wb, "AdminEarning.xlsx");
      };
  
    return (
        <>
            <div className="mt-3">
                <h3 className='d-flex flex-row text-light'>ADMIN TOTAL EARING : {TOTELEARING}
                   
                    
                </h3>
                <select  className='form-control col-sm-1 m-1 bg-dark text-light' id='pagelimit' name='pagelimit' onChange={setpageLimit}>
                                <option value="10">Set limit</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>
            </div>

            <button
                onClick={() => {
                  createDownloadData();
                }}
                className="btn btn-primary"
              >
                Export Data
              </button>

              <DatePicker value={values} onChange={setValues} range />
            <div className="row ">
                <div className="col-12 grid-margin">
                    <div className="card text-white">
                    <div className="card-body text-light" style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
                            <div className="table-responsive">
                                <table className="table text-white">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th> _id </th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {EARING&&EARING.map((Earing,index) => (
                                            <tr key={index}>
                                                <td>{index+1}</td>
                                                <td>
                                                    <div className="d-flex">
                                                        <span className="pl-2">Earn From Challange {Earing.Earned_Form} on {Earing.createdAt}</span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="">{Earing.Ammount}</div>
                                                </td>
                                            </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className='mt-4 bg-dark'>
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

export default Earings