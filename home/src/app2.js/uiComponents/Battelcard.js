import React ,{useState,useEffect}from 'react';
// import { io } from 'socket.io-client';


const BattleCard = ({ playingFor, player1, player2, prizePool, playingNow, waitingNow, entryFee,onClick,onClick2 }) => {
    // const socket = io("http://localhost:5000")
    const [GamePrize,SetGamePrize] = useState();
   
      const handleClick = (e) =>{
        // e.preventDefault();
        //         SetGamePrize(entryFee);
     onClick(entryFee);
        // socket.emit("NewPlayer",GamePrize,socket.id)
    }
    const hanleclickRejoin =()=>{
      onClick2();
    }
  
  return (
    <div className="battle-card">
      {playingFor ? (
        <div className="open-battle">
          <span>PLAYING FOR</span>
          <span className="playing-for">{playingFor}</span>
          <div className="players">
            <span>{player1}</span>
            <span>VS</span>
            <span>{player2}</span>
          </div>
          <button className="view-button" onClick = {hanleclickRejoin}>VIEW</button>
        </div>
      ) : (
        <div className="battle">
          <div className="prize-pool">PRIZE POOL {prizePool}</div>
          <div className="playing-now">{playingNow} PLAYING NOW</div>
          {waitingNow ? <div className="waiting-now">{waitingNow} WAITING NOW</div> : null}
          <button className="entry-button" onClick= {handleClick}>₹{entryFee}</button>
        </div>
      )}
    </div>
  );
};

export default BattleCard;
