import React, { useState, useEffect } from "react";
import css from "../css/gamehis.module.css";
import ReactPaginate from "react-paginate";
import axios from "axios"



const Transactionhistory = () => {
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }
  //eslint-disable-next-line
  const [user, setUser] = useState()
  //use for pagination..
    let limit = 50;
    const [pageNumber, setPageNumber] = useState(0);
    const [numberOfPages, setNumberOfPages] = useState(0);

  const role = async () => {
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    await axios.get(baseUrl+`me`, { headers })
      .then((res) => {
        setUser(res.data)
        
        //Allgames(res.data._id)
        Allgames(res.data._id,pageNumber,limit)
        // window.location.reload()

      })

  }

 const handlePageClick = async (data) => {
    let currentPage = data.selected + 1;
    setPageNumber(currentPage);
    // scroll to the top
    //window.scrollTo(0, 0)
  };
  
const dateFormat=(e)=>{
      
  const date = new Date(e); 
const newDate = date.toLocaleString('default', { month: 'long',day:'numeric',hour:'numeric',hour12:true,minute:'numeric' });
return newDate;
  }

  const [cardData, setGame] = useState()

  const Allgames = async (id) => {
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    await axios.get(baseUrl+`temp/deposite/${id}?page=${pageNumber}&_limit=${limit}`, { headers })
      .then((res) => {
          console.log(res)
        setGame(res.data.ress)
        setNumberOfPages(res.data.totalPages);

      })

  }


  useEffect(() => {
    role()
    //eslint-disable-next-line
  }, [pageNumber,limit])


  return (
    <div>
      <div className="leftContainer" style={{minHeight:'100vh',height:'100%'}}>
        {/* pagination */}
    
         <div className="pt-5">
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

        {/* game-cards */}
        { cardData && cardData.map((card) => {
        
          var id          = card._id.toString(), ctr = 0;
          var timestamp   = id.slice(ctr, (ctr+=8));
          var machineID   = id.slice(ctr, (ctr+=6));
          var processID   = id.slice(ctr, (ctr+=4));
          var counter     = id.slice(ctr, (ctr+=6));
          //console.log("id:", id);
          //console.log("timestamp:", parseInt(timestamp, 16));
          //console.log("machineID:", parseInt(machineID, 16));
          //console.log("processID:", parseInt(processID, 16));
          var counterid =parseInt(timestamp, 16);  
        
        if((card.Req_type==='deposit' ||  card.Req_type==='bonus') && card.status!='FAILED')
          {
            var titleMsg = 'Cash added';
            if(card.status==='Pending' && card.Req_type==="deposit"){
              var signIcon = <div className="text-danger">(X)</div>;
            }else{
              var signIcon = <div className="text-success">(+)</div>;
            }
          }
          else if(card.Req_type==="withdraw" && card.status!='FAILED')
          {
            var titleMsg = 'Witdraw using '+ card.Withdraw_type;
            var signIcon = <div className="text-danger">(-)</div>;
          }
          else if(card.Req_type==='penalty' && card.status!='FAILED')
          {
            var titleMsg = 'Penalty';
            var signIcon = <div className="text-danger">(-)</div>;
          }
          else if(card.status==='Pending' || card.status==='FAILED' )
          {
            var titleMsg = 'FAILED';
            var signIcon = <div className="text-danger">(X)</div>;
          }
          else{
            var titleMsg = '';
            var signIcon = <div className="text-success"></div>;
          }
          
          return (
            <div
              className={`w-100 mt-3 py-3 d-flex align-items-center ${css.list_item}`}
            >
              {/* map the cardData */}
              <div className={`${css.center_xy} ${css.list_date} mx-2`}>
               <small> <div>{dateFormat(card.createdAt).split(',')[0]}</div></small>
                <small><small>{dateFormat(card.createdAt).split(',')[1]}</small></small>
               
              </div>
              <div className={`${css.list_divider_y}`} />
              <div className={`mx-3 d-flex ${css.list_body}`}>
                <div className="d-flex align-items-center">
                  <picture className="mr-2">
                    <img
                      height="32px"
                      width="32px"
                      src={process.env.PUBLIC_URL + '/Images/LandingPage_img/addcash.png'}
                      alt=""
                      style={{ borderRadius: "5px" }}
                    />
                  </picture>
                </div>

                <div className="d-flex flex-column font-8">
                  <div>
                     <b>
                     {titleMsg}
                        </b>
                    <br></br><small>OrderID: JP-{counterid}</small>
                  </div>
                  <div className={`${css.games_section_headline}`}>
                    Status:{(card.status==='none' || (card.status==='Pending' && card.Req_type==="withdraw" )) ? 'Processing': (card.status==='Pending' && card.Req_type==="deposit" )? 'Cancelled':card.status}
                    <br></br>
                    {(card.txn_msg)? card.txn_msg:''}
                  </div>
                </div>
              </div>

             <div className="right-0 d-flex align-items-end pr-3 flex-column">
                {/* <button className={`btn btn-sm ${css.btn_success} ${css.status_badge}`}>
                  PAID
                </button> */}
                <div className="d-flex float-right font-8">
                {signIcon}
                  <picture className="ml-1 mb-1">
                    <img
                    alt="img"
                      height="21px"
                      width="21px"
                      src={process.env.PUBLIC_URL + '/Images/LandingPage_img/global-rupeeIcon.png'}
                      className="snip-img"
                    />
                  </picture>
                  <span className="pl-1">{card.amount}</span>
                </div>
                {card.closing_balance&&<div
                  className={`${css.games_section_headline}`}
                  style={{ fontSize: "0.6em",whiteSpace:'nowrap' }}
                >
                  closing balance :{card.closing_balance}
                </div>}
                <div
                  className="games-section-headline"
                  style={{ fontSize: "0.6em" }}
                >
                
                </div>
              </div>
            </div>
          );
        })
        }
        {cardData && cardData.length === 0 &&
          <div className="text-center">
            <img
              src={process.env.PUBLIC_URL + '/Images/notransactionhistory.png'}
              alt="no data"
              width={300}
              height={300}
              className="img-fluid "
              style={{ marginTop: "25%" }}
            />
            <div className="mt-2">
              <h3 className="font-weight-bold">No transaction History</h3>
              <p className="text-muted"> You have not made any transaction  yet.</p>
             </div>
          </div>
        }
      </div>
    </div>
  );
};

export default Transactionhistory;
