import React, { useState, useEffect } from "react";
import css from "../css/gamehis.module.css";
import ReactPaginate from "react-paginate";

// import Header from "../Components/Header";
import Rightcontainer from "../Components/Rightcontainer";
import axios from "axios";




const Gamehistory = () => {
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }


  const [user, setUser] = useState()
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
  const [game, setGame] = useState([])

  const Allgames = async (id) => {
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    await axios.get(baseUrl+`game/history/user/${id}?page=${pageNumber}&_limit=${limit}`, { headers })
      .then((res) => {
           let gameHis=[];
        res.data.data.forEach((ele)=>{
          if(ele.Status=='completed' || ele.Status=='cancelled'||ele.Status=='conflict')
          {
            gameHis.push(ele);
          }
        })
        setGame(gameHis);
        setNumberOfPages(res.data.totalPages);
      })

  }
  
  const dateFormat=(e)=>{
      
  const date = new Date(e); 
const newDate = date.toLocaleString('default', { month: 'short',day:'numeric',hour:'numeric',hour12:true,minute:'numeric' });
return newDate;
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
        {game && game.map((card) => (<div
              className={`w-100 mt-3 py-3 d-flex align-items-center ${css.list_item}`}
            >
              {/* map the cardData */}
              <div className={`${css.center_xy} ${css.list_date} mx-2`}>
              <small><div>{dateFormat(card.createdAt).split(',')[0]}</div></small>
                <small><small>{dateFormat(card.createdAt).split(',')[1]}</small></small>
                {/* <small>{card}</small> */}
              </div>
              <div className={`${css.list_divider_y}`} />
              <div className={`mx-3 d-flex ${css.list_body}`}>

                <div className="d-flex align-items-center">
                  <picture className="mr-2">
                    <img
                      height="30px"
                      width="30px"
                      src={process.env.PUBLIC_URL + '/Images/LandingPage_img/ludo.jpeg'}
                      alt=""
                      style={{ borderRadius: "5px" }}
                    />
                  </picture>
                </div>

                <div className="d-flex flex-column font-8">
               
                  
                   <div>
                   
                    {card.Status==="completed"?(card.Winner && card.Winner._id===user._id?'Win Against':'Lost Against'):card.Status} <b>{card.Accepetd_By && card.Accepetd_By._id===user._id?card.Created_by.Name:card.Accepetd_By &&card.Accepetd_By.Name}</b>.
                  </div>    
                  <div className={`${css.games_section_headline}`}>
                   battle _id: {card._id}
                  </div> 
                  
                  
                </div>
              </div>

              {card.Status==='completed' && <div style={{ marginLeft:'auto' }} className="right-0 d-flex align-items-end pr-3 flex-column">
                <div className="d-flex float-right font-8">
                  <div className="text-danger">{card.losestatus}</div>
                  <div className="text-success">{card.winstatus}</div>
                  <picture className="ml-1 mb-1">
                  <img height="21px" width="21px" src={process.env.PUBLIC_URL + '/Images/LandingPage_img/global-rupeeIcon.png' } alt="" />
                  </picture>
                  <small><b><span className="pl-1">{card.Status==="completed"?(card.Winner._id===user._id?`(+) ${card.winnAmount}`:`(-) ${card.Game_Ammount}`):''}</span></b></small>
                </div>
                <div
                  className={`${css.games_section_headline}`}
                  style={{ fontSize: "0.6em",whiteSpace:'nowrap' }}
                >
                  closing balance :{card.Winner===user._id?card.Winner_closingbalance:card.Loser_closingbalance}
                </div>
              </div>}
              
            </div>
          ))}
        {game && game.length === 0 && 
          <div className="text-center">
            <img
              src={process.env.PUBLIC_URL + '/Images/nogamehistory.png'}
              alt="no data"
              width={300}
              height={300}
              className="img-fluid "
              style={{ marginTop: "25%" }}
            />
            <div className="mt-2">
              <h3 className="font-weight-bold">No Game History</h3>
              <p> You have no game history yet.</p>
             </div>
          </div>
        }
      </div>

      <div className="rightContainer">
        <Rightcontainer />
      </div>
    </div>
  );
};

export default Gamehistory;