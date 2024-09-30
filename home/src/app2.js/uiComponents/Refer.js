import React, { useEffect, useState } from 'react'
import css from "../css/Refer.module.css"
import { Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2';
// import 'remixicon/fonts/remixicon.css'


const Refer = () => {

  const [user, setUser] = useState()
  const Cashheader = () => {
    let access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    axios.get(`https://api.24wins.in/me`, { headers })
      .then((res) => {
        setUser(res.data)
        // console.log(res.data);
        Allgames(res.data.referral_code)
      }).catch((e) => {
        alert(e.msg)
      })

  }
  
  const [cardData, setGame] = useState([])

  const Allgames = async (id) => {
    const access_token = localStorage.getItem("token")
    const headers = {
      Authorization: `Bearer ${access_token}`
    }
    await axios.get(`https://api.24wins.in/referral/code/${id}`, { headers })
      .then((res) => {
        setGame(res.data)
console.log(res.data)

      })

  }

  useEffect(() => {
    Cashheader()
//eslint-disable-next-line
  }, [])
  
  
    const copyCode = (e) => {
    // console.log(Game.Room_code);
    navigator.clipboard.writeText(user.referral_code);

    Swal.fire({
      position: 'center',
      icon: 'success',
      type: 'success',
      title: 'Room Code Copied',
      showConfirmButton: false,
      timer: 1200,
    

    });

  }

  if (user === undefined) {
    return null
  }

  return (
    <div>
      <div className='leftContainer' style={{height:'100vh'}}>
     
        <div className={`${css.center_xy} pt-5`}>
          <picture className="mt-1">
            <img alt="img" width="226px" src={process.env.PUBLIC_URL + 'Images/refer/refer.png'} className="snip-img" />
          </picture>
          <div className="mb-1">
            <div className="font-15">
              Earn now unlimited
              <span aria-label="party-face" >
                🥳
              </span>
            </div>
            <div className="d-flex justify-content-center">
              Refer your friends now!
            </div>
            <div className="mt-3 text-center font-9">
              Current Earning:
              <b>
                {user.referral_wallet}
              </b>
              <Link className="ml-2" to="/Redeem">
                Redeem
              </Link>
            </div>
            <div className="text-center font-9">
              Total Earned:
              <b>
                {user.referral_earning}
              </b>
            </div>
            <div className={`${css.progress}`}>
              <div className={`${css.progress_bar} ${css.progress_bar_striped} ${css.bg_success}`} aria-valuenow={user.referral_earning} aria-valuemax={10000} style={{ width: `${user.referral_earning * 200 / 10000}%` }}>
              </div>
            </div>
            <div className="font-9">
              <span >
                Max: 10,000
              </span>
              <Link className="float-right" to="/update-pan">
                Upgrade Limit
              </Link>
            </div>
            <div className={`${css.text_bold} mt-3 text-center`}>
              Your Refer Code: {user.referral_code}
              
              
              <i className="ri-clipboard-fill ml-2 " style={{fontSize:"20px",color:"#007bff"}}  onClick={(e) => copyCode(e)}></i>


            </div>
            
        <div className="d-flex justify-content-center">
              Total Refers:&nbsp;
              <b>
               {cardData&&cardData}
              </b>
            </div> 
          </div>
        </div>

        <div className="mx-3 my-3">
          <div className={`${css.font_11} ${css.text_bold}`}>
            Refer &amp; Earn Rules
          </div>
          <div className="d-flex align-items-center m-3">
            <picture>
              <img alt="img" width="82px" src={process.env.PUBLIC_URL + 'Images/refer/giftbanner.png'} className="snip-img" />
            </picture>
            <div className={`${css.font_9} mx-3`} style={{ width: '63%' }}>
              <div>
                When your friend signs up on 24wins Ludo from your referral link,
              </div>
              <div className={`${css.font_8} ${css.c_green} mt-2`}>
                You get 2 % Commission on your referral's winnings.
                
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center m-3">
            <picture>
              <img alt="img" width="82px" src={process.env.PUBLIC_URL + 'Images/refer/banner.png'} className="snip-img" />
            </picture>
            <div className={`${css.font_9} mx-3`} style={{ width: '63%' }}>
              <div >
                Suppose your referral plays a battle for a 10000 Cash,
              </div>
              <div className={`${css.font_8} ${css.c_green} mt-2`}>
                You get
                <strong>
                  a 100 Cash
                </strong>
                <strong>
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className={`${css.refer_footer} pt-2 `}>
          <a href={`whatsapp://send?text=Play Ludo and earn Rs10000 daily.
Commission Charge -Admin 5% Only
Referral - 2% On All Games
24x7 whats app Chat Support
Instant Withdrawal Via UPI/Bank
     Register Now, My refer code is ${user.referral_code}.
     👇
     https://24wins.in/login/${user.referral_code}`}
     style={{width:"100%"}}>
          <button className="bg-green refer-button cxy w-100">
            Share in Whatsapp
          </button>
          </a>

        </div>

      </div>

    </div>
  )
}

export default Refer
