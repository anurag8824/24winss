import React ,{useEffect ,useState} from "react";
import css from "../css/gamehis.module.css";
import axios from "axios"


const Referralhis = () => {
  const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
  const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
  const nodeMode = process.env.NODE_ENV;
  if (nodeMode === "development") {
    var baseUrl = beckendLocalApiUrl;
  } else {
    baseUrl = beckendLiveApiUrl;
  }
  const [user, setUser] = useState()

  const role = async () => {
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    await axios.get(baseUrl+`me`, { headers })
      .then((res) => {
        setUser(res.data)
        
        Allgames(res.data.referral_code)
        // window.location.reload()

      })

  }


  const [cardData, setGame] = useState([])

  const Allgames = async (id) => {
    const access_token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    await axios.get(baseUrl+`referral/code/winn/${id}`, { headers })
      .then((res) => {
        setGame(res.data)
         //console.log(res.data)
      })

  }

const dateFormat=(e)=>{
      
  const date = new Date(e); 
const newDate = date.toLocaleString('default', { month: 'long',day:'numeric',hour:'numeric',hour12:true,minute:'numeric' });
return newDate;
  }
  useEffect(() => {
    role()
    //eslint-disable-next-line
  }, [])
  
  if(cardData==undefined){
      return null
  }

  return (
    <div>
      <div className="leftContainer" style={{minHeight:'100vh',height:'100%'}}>
        {/* pagination */}
        
        <div className="pt-5 mb-3">
        
        </div>

        {/* game-cards */}
        {cardData&&cardData.map((card) => {
          return (
            <div
              className={`w-100 py-3 d-flex align-items-center ${css.list_item}`}
              key={card._id}
            >
              {/* map the cardData */}
              <div className={`${css.center_xy} ${css.list_date} mx-2`}>
               <div>{dateFormat(card.createdAt).split(',')[0]}</div>
                
              </div>
              <div className={`${css.list_divider_y}`} />
              <div className={`mx-3 d-flex ${css.list_body}`}>
                <div className="d-flex align-items-center">
                  <picture className="mr-2">
                    <img
                      height="32px"
                      width="32px"
                      src={process.env.PUBLIC_URL + '/Images/LandingPage_img/earning.png'}
                      alt=""
                      style={{ borderRadius: "5px" }}
                    />
                  </picture>
                </div>

                <div className="d-flex flex-column font-8">
                  <div>
                     <b>
                    Referral earning
                        </b>.
                  </div>
                  <div className={`${css.games_section_headline}`}>
                    Earned by:{card.earned_from.Name}
                  </div>
                </div>
              </div>

             <div className="right-0 d-flex align-items-end pr-3 flex-column">
               
                <div className="d-flex float-right font-8">
                  <div className="text-danger">{card.losestatus}</div>
                  <div className="text-success">{card.winstatus}</div>
                  <picture className="ml-1 mb-1">
                    <img height="21px" width="21px" src={process.env.PUBLIC_URL + '/Images/LandingPage_img/global-rupeeIcon.png' } alt="" />
                  </picture>
                  <span className="pl-1">{card.amount}</span>
                </div>
                <div
                  className="games-section-headline"
                  style={{ fontSize: "0.6em",whiteSpace:'nowrap'}}
                >
                  Closing Balance: {card.closing_balance}
                </div>
              </div>
            </div>
          );
        })}

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
              <h3 className="font-weight-bold">No Refer History</h3>
              <p className="text-muted"> You have not made any refers  yet.</p>
             </div>
          </div>
        }
      </div>
    </div>
  );
};

export default Referralhis;
