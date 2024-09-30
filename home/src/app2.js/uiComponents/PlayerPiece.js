import React from 'react';
import { COORDINATES_MAP, STEP_LENGTH } from './constants';

const PlayerPiece = ({ playerId, pieceId, position, onClick }) => {
  const handleClick = (e) => {
    console.log(e.target)
    onClick(playerId, pieceId,e);
  };

  const [x, y] = COORDINATES_MAP[position];

  return (
    <div
   
    >
      <img src={`/image/images/${playerId}.png`} className="player-piece" alt={`${playerId} piece`} player-Id={playerId} piece ={pieceId}    onClick={handleClick}
      style={{
        top: `${y * STEP_LENGTH}%`,
        left: `${x * STEP_LENGTH}%`,
        position: 'absolute',
      }} />
    </div>
  );
};

export default PlayerPiece;
