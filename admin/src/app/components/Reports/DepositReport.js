import axios from "axios";
import React, { useEffect, useState } from "react";
import { Col, Divider, Row, Table } from "antd";
import * as XLSX from "xlsx";
import ReactPaginate from "react-paginate";
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";

const $ = require("jquery");
$.Datatable = require("datatables.net");

const DepositReport = () => {
  const [CompanyName, setCompanyName] = useState("");
  const [CompanyMobile, setCompanyMobile] = useState("");
  const [CompanyAddress, setCompanyAddress] = useState("");


  const [user, setUser] = useState();
  
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }
  
  useEffect(() => {
    const data = axios.get(baseUrl + "settings/data", {}).then((res) => {
      setCompanyName(res.data.CompanyName);
      setCompanyMobile(res.data.CompanyMobile);
      setCompanyAddress(res.data.CompanyAddress);
    });
  }, []);
  
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
    new DateObject().add(4, "days"),
  ]);

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
        baseUrl +
          `txn/depositreports/all?page=${pageNumber}&_limit=${limit}&FROM_DATE=${values[0]}&TO_DATE=${values[1]}`,
        { headers }
      )
      .then((res) => {
        setUser(res.data.datefind);
        setNumberOfPages(res.data.totalPages);
        //$('table').dataTable();
      });
  };

  const dateFormat = (e) => {
    const date = new Date(e);
    const newDate = date.toLocaleString("default", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    return newDate;
  };

  useEffect(() => {
    profle();
  }, [pageNumber, limit, values]);

  if (user === undefined) {
    return null;
  }


  const Print = () => {
    //console.log('print');
    let printContents = document.getElementById(`printablediv`).innerHTML;
    let originalContents = document.body;
    document.body.innerHTML = printContents;
    window.print();
    document.body= originalContents;
  };

  const createDownloadData = () => {
    handleExport();
  };
  const handleExport = () => {
    let table1 = [
      {
        A: "Id",
        B: "UserName",
        C: "PhoneNumber",
        D: "Deposit Amount",
        E: "Deposit Status",
      },
    ];

    user.forEach((row) => {
      const userDetails = row;
      console.log("exldata", userDetails);
      table1.push({
        A: userDetails._id,
        B: userDetails.User_id ? userDetails.User_id.Name : "",
        C: userDetails.User_id ? userDetails.User_id.Phone : "",
        D: userDetails.amount ? userDetails.amount : "",
        E: userDetails.status ? userDetails.status : "",
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
    XLSX.writeFile(wb, "DepositReport.xlsx");
  };
  return (
    <div>
      {/* <h4 className='font-weight-bold my-3'>ALL CHALLANGES</h4> */}
      <div className="row ">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body text-light" style={{backgroundColor:"rgba(0, 27, 11, 0.734)"}}>
              <h4 className="card-title">Deposit Reports</h4>
              <button
                onClick={() => {
                  createDownloadData();
                }}
                className="btn btn-primary"
              >
                Export Data
              </button>
              <button type="button" className="btn btn-success" onClick={Print}>
                Print
              </button>
              <div>
              <select  className='form-control col-sm-1 m-1 bg-dark text-light' id='pagelimit' name='pagelimit' onChange={setpageLimit}>
                                <option value="10">Set limit</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>
    </div>
              <DatePicker value={values} onChange={setValues} range />
              <div style={{ padding: 20 }}></div>
              <div className="table-responsive" >
                <div>
                  {user &&
                    user.map((data, key) =>{ 
                      var id          = data._id.toString(), ctr = 0;
                      var timestamp   = id.slice(ctr, (ctr+=8));
                      var machineID   = id.slice(ctr, (ctr+=6));
                      var processID   = id.slice(ctr, (ctr+=4));
                      var counter     = id.slice(ctr, (ctr+=6));
                      //console.log("id:", id);
                      //console.log("timestamp:", parseInt(timestamp, 16));
                      //console.log("machineID:", parseInt(machineID, 16));
                      //console.log("processID:", parseInt(processID, 16));
                      var counterid =parseInt(timestamp, 16); 
                      return(
                      
                      <div id="printablediv">
                        <Row>
                          <Col>
                            <Divider>Invoice</Divider>
                          </Col>
                        </Row>

                        <Row gutter={24} style={{ marginTop: 32 }}>
                          <Col span={8}>
                            <h3>{CompanyName}</h3>
                            <div>{CompanyAddress}</div>
                            <div>GSTIN : </div>
                            <div>MOB: {CompanyMobile}</div>
                          </Col>


                          <Col span={8} offset={8}>
                            <table>
                              <tr>
                                <th>
                                  Invoice Date :{" "}
                                  {dateFormat(data.createdAt).split(",")[0]}{" "}
                                </th>
                                
                                <td></td>
                              </tr>
                            </table>
                          </Col>
                        </Row>

                        <Row style={{ marginTop: 48 }}>
                          <div>
                            User Name:{" "}
                            <h6>
                              {" "}
                              {(data.User_id && data.User_id.holder_name) ? data.User_id.holder_name : data.User_id.Name}
                              </h6>
                             
                              <h6>
                              {data.User_id ? data.User_id.Phone : ""}{" "}
                              </h6>
                            
                          </div>
                        </Row>

                        <Row style={{ marginTop: 48 }}>
                          <Table
                            dataSource={[
                              {
                                id: 1,
                                name: "Deposit",
                                price: `${data.amount ? "Rs. "+data.amount : ""}`,
                                ID: `JP-${counterid}`,
                                TxnID: `${data.order_token}`,
                                paymentType: `UPI`,
                                paymentGatway: `${data.payment_gatway}`,
                              },
                            ]}
                            pagination={false} >
                            <Table.Column title="Description" dataIndex="name"/>
                            <Table.Column title="Amount" dataIndex="price" />
                            <Table.Column title="OrderID" dataIndex="ID" />
                            <Table.Column title="TxnID" dataIndex="TxnID" />
                            <Table.Column title="PaymentType" dataIndex="paymentType" />
                            <Table.Column title="PaymentGatway" dataIndex="paymentGatway" />
                          </Table>
                        </Row>

                        <Row style={{ marginTop: 48 }}>
                          <Col span={8} offset={16}>
                            <table>
                              <tr>
                                <th> Total :</th>
                                <td>{data.amount ? "Rs. "+data.amount : ""}</td>
                              </tr>
                            </table>
                          </Col>
                        </Row>

                        {/*<Row style={{ marginTop: 48, textAlign: "center" }}>
                          <Col span={8}>
                            <div>Account No: 071263300004243</div>
                            <div>IFSC Code: YESB0000712</div>
                            <div>YES BANK</div>
                          </Col>
                        </Row>*/}

                        <Row style={{ marginTop: 48, textAlign: "center" }}>
                          ----*THIS IS A COMPUTER GENERATED INVOICE NO SIGNATURE
                          REQUIRED*----
                        </Row>
                      </div>
                    )})}
                </div>
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
    </div>
  );
};

export default DepositReport;
