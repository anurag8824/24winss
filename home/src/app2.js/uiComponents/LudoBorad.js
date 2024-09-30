
import React, { useState, useEffect } from 'react';
import "../css/layout.css";
import css from "../Modulecss/Home.module.css";
import PlayerPiece from './PlayerPiece';
import { BASE_POSITIONS, HOME_ENTRANCE, HOME_POSITIONS, PLAYERS, SAFE_POSITIONS, START_POSITIONS, STATE, TURNING_POINTS } from './constants';
// import socket from './socket';
import cssp from "../css/LudoBorad.css"
import { useParams, useLocation } from 'react-router-dom';
import socket from './socketconnection';


const LudoBoard = () => {
    const[autoIncrement , setautoIncrement] =useState(false)
    // let socket = getSocket();
    console.log(socket, "socket")
    const Location = useLocation();
    const { Data } = Location.state
    // console.log("here is data from location in this ", Data);
    // console.log("Data is Here", Data.gameState.Poistion)

    const { gameId } = useParams();
    console.log("game Id ", gameId);
    let [currentPositions, setCurrentPositions] = useState({
        P1: [...BASE_POSITIONS.P1],
        P2: [...BASE_POSITIONS.P2]
    })
    // useState(Data.gameState.Poistion);
    const [diceValue, setDiceValue] = useState(1)
    // (Data.gameState.dice);
    const [turn, setTurn] = useState(0)
    // (Data.gameState.turn);
    const [state, setState] = useState(STATE.DICE_NOT_ROLLED);
    const [isSpinning, setIsSpinning] = useState(false);

    console.log("current Poistion", currentPositions)

    // useEffect(() => {
    //   resetGame();
    // }, []);
    console.log("currentPosition", currentPositions)
    const resetGame = () => {
        setCurrentPositions({
            P1: [...BASE_POSITIONS.P1],
            P2: [...BASE_POSITIONS.P2]
        });
        setTurn(0);
        setState(STATE.DICE_NOT_ROLLED);
    };

    const onDiceClick = () => {
        const roll = 1 + Math.floor(Math.random() * 6);
        socket.emit("Dice-Value", { gameId, roll, diceValue })


    };
    useEffect(() => {
        socket.on("DiceValueClient", (roll) => {
            console.log("DicevalueClient event trigged ", roll)

            setIsSpinning(true);
            setautoIncrement(true)

            // Play the sound
            const audio = new Audio('/images/dicerolling.mp3');
            audio.play();

            setTimeout(() => {
                setDiceValue(roll);

                setIsSpinning(false);
                setState(STATE.DICE_ROLLED);
                checkForEligiblePieces();
                AutoIncrement();
            }, 800);
            console.log("new dice Value", roll, diceValue)
         
        })
        console.log("dice value ", diceValue)
        socket.on("handleClickPiececClient", ({ player, piece, turn }) => {
            setautoIncrement(false);
            const currentPosition = currentPositions[player][piece];

            console.log("handleClickPiececClient clicked", player, turn, piece)

            if (((turn === 0 && player == "P1") || (turn === 1 && player == "P2")) && getEligiblePieces(player).length > 0) {
                console.log("getEligiblePieces", getEligiblePieces(player))

                if (BASE_POSITIONS[player].includes(currentPosition)) {
                    setPiecePosition(player, piece, START_POSITIONS[player]);
                    setState(STATE.DICE_NOT_ROLLED);
                    return;
                }
                movePiece(player, piece, diceValue);

            }
            else {
                console.log("clicked on worng coin");
            }

        })
        
        // const checkForEligiblePieces = () => {
        //   const player = PLAYERS[turn];
        //   const eligiblePieces = getEligiblePieces(player);
        //   if (eligiblePieces.length === 0) {
        //     incrementTurn();
        //   }
        // };

        // const getEligiblePieces = (player) => {
        //   return [0, 1, 2, 3].filter(piece => {
        //     const currentPosition = currentPositions[player][piece];
        //     if (currentPosition === HOME_POSITIONS[player]) return false;
        //     if (BASE_POSITIONS[player].includes(currentPosition) && diceValue !== 6) return false;
        //     if (HOME_ENTRANCE[player].includes(currentPosition) && diceValue > HOME_POSITIONS[player] - currentPosition) return false;
        //     return true;
        //   });
        // };

        // const incrementTurn = () => {
        //   setTurn(turn === 0 ? 1 : 0);
        //   setState(STATE.DICE_NOT_ROLLED);
        // };
        const setPiecePosition = (player, piece, newPosition) => {
            // console.log(newPosition, "newpoistion")
            // setCurrentPositions(prevPositions => ({
            //   ...prevPositions,
            //   [player]: prevPositions[player].map((pos, index) =>
            //     index === piece ? newPosition : pos
            //   )
            // }));
            // currentPositions[player][piece]= newPosition;
            currentPositions = {
                ...currentPositions, // Spread the existing gameState
                [player]: currentPositions[player].map((pos, index) =>
                    index === piece ? newPosition : pos // Update only the specific piece's position
                )
            };
            setCurrentPositions(currentPositions)
            const gameId = localStorage.getItem("gameId");
            socket.emit("GameState", { gameId, currentPositions, turn, diceValue })
        };
        const movePiece = async (player, piece, moveBy) => {
            console.log("debug log for move piece move by ", player, piece, moveBy)
            let movesRemaining = moveBy;
            const moveInterval = 200 // Interval for updating position

            const moveIntervalId = setInterval(async () => {
                if (movesRemaining > 0) {
                    await incrementPiecePosition(player, piece);
                    movesRemaining--;
                } else {
                    clearInterval(moveIntervalId);

                    if (hasPlayerWon(player)) {
                        alert(`Player: ${player} has won!`);
                        resetGame();
                        return;
                    }

                    const isKill = checkForKill(player, piece);
                    if (!isKill && diceValue != 6) {
                        console.log("for increment ", !isKill && diceValue != 6)
                        incrementTurn();
                    }

                    setState(STATE.DICE_NOT_ROLLED);
                }
            }, moveInterval);
        };

        const getIncrementedPosition = (player, piece) => {
            const currentPosition = currentPositions[player][piece];
            const currentPosition1 = currentPositions

            // console.log("new poistion in another function",currentPosition1)

            console.log("getIncrementedPosition", player, piece, currentPosition);
            if (currentPosition === TURNING_POINTS[player]) return HOME_ENTRANCE[player][0];
            if (currentPosition === 51) return 0;

            return currentPosition + 1;


        };

        const incrementPiecePosition = (player, piece) => {
            const newPosition = getIncrementedPosition(player, piece);
            setPiecePosition(player, piece, newPosition);
        }

        const checkForKill = (player, piece) => {
            const currentPosition = currentPositions[player][piece];
            const opponent = player === 'P1' ? 'P2' : 'P1';
            let kill = false;
            [0, 1, 2, 3].forEach(opponentPiece => {
                const opponentPosition = currentPositions[opponent][opponentPiece];
                if (currentPosition === opponentPosition && !SAFE_POSITIONS.includes(currentPosition)) {
                    setPiecePosition(opponent, opponentPiece, BASE_POSITIONS[opponent][opponentPiece]);
                    kill = true;
                }
            });
            return kill;
        };

        const hasPlayerWon = (player) => {
            return [0, 1, 2, 3].every(piece => currentPositions[player][piece] === HOME_POSITIONS[player]);
        };

        // for auto incremant code
        const AutoIncrement = () => {
            setTimeout(() => {
                const player = PLAYERS[turn];
                const newPiece = getEligiblePieces(player);
                console.log("new piece ", newPiece);
        
                if (newPiece.length > 0) {
                    const pieceIndex = Math.floor(Math.random() * newPiece.length);
                    movePiece(player, newPiece[0], diceValue);
                    setautoIncrement(false);
                } else {
                    console.log("No eligible pieces to move.");
                }
        
            }, 30000);
        };
        

        return () => {
            socket.off("DiceValueClient");
            socket.off("handleClickPiececClient");
        };


    })


    const checkForEligiblePieces = () => {
        const player = PLAYERS[turn];
        const eligiblePieces = getEligiblePieces(player);
        if (eligiblePieces.length === 0) {
            incrementTurn();
        }
    };

    const getEligiblePieces = (player) => {
        return [0, 1, 2, 3].filter(piece => {
            const currentPosition = currentPositions[player][piece];
            if (currentPosition === HOME_POSITIONS[player]) return false;
            if (BASE_POSITIONS[player].includes(currentPosition) && diceValue !== 6) return false;
            if (HOME_ENTRANCE[player].includes(currentPosition) && diceValue > HOME_POSITIONS[player] - currentPosition) return false;
            return true;
        });
    };

    
    const incrementTurn = () => {
        setTurn(turn === 0 ? 1 : 0);
        setState(STATE.DICE_NOT_ROLLED);
        // setDiceValue(0)
    };
    // useEffect(()=>{
    //   handlePieceClick
    // },[])
    const handlePieceClick = (player, piece, e) => {
        console.log("e", e.target.getAttribute("piece"))
        if (((turn === 0 && player == "P1") || (turn === 1 && player == "P2")) && getEligiblePieces(player).length > 0) {

            socket.emit("handleClickPiece", { gameId, player, piece, turn })
        }
        else {
            console.log("clicked on worng piece !")
        }

    };
    


   
    //     const currentPosition = currentPositions[player][piece];

    //     console.log("handleClickPiececClient clicked",player,turn,piece)

    //   if(((turn === 0 && player =="P1") || (turn ===1 && player =="P2")) && getEligiblePieces(player).length>0){
    //      console.log("getEligiblePieces",getEligiblePieces(player))

    //  if (BASE_POSITIONS[player].includes(currentPosition)) {
    //    setPiecePosition(player, piece, START_POSITIONS[player]);
    //    setState(STATE.DICE_NOT_ROLLED);
    //    return;
    //  }
    //  movePiece(player, piece, diceValue);
    // }
    // else{
    //  console.log("clicked on worng coin");
    // }
    // })
    // const setPiecePosition = (player, piece, newPosition) => {
    //   console.log(newPosition, "newpoistion")
    //   // setCurrentPositions(prevPositions => ({
    //   //   ...prevPositions,
    //   //   [player]: prevPositions[player].map((pos, index) =>
    //   //     index === piece ? newPosition : pos
    //   //   )
    //   // }));
    //   // currentPositions[player][piece]= newPosition;
    //   currentPositions = {
    //     ...currentPositions, // Spread the existing gameState
    //     [player]: currentPositions[player].map((pos, index) =>
    //       index === piece ? newPosition : pos // Update only the specific piece's position
    //     )
    //   };
    //   setCurrentPositions(currentPositions)
    // };

    // const movePiece = async (player, piece, moveBy) => {
    //   console.log("debug log for move piece move by ", player, piece, moveBy)
    //   let movesRemaining = moveBy;
    //   const moveInterval = 500 // Interval for updating position

    //   const moveIntervalId = setInterval(async () => {
    //     if (movesRemaining > 0) {
    //       await incrementPiecePosition(player, piece);
    //       movesRemaining--;
    //     } else {
    //       clearInterval(moveIntervalId);

    //       if (hasPlayerWon(player)) {
    //         alert(`Player: ${player} has won!`);
    //         resetGame();
    //         return;
    //       }

    //       const isKill = checkForKill(player, piece);
    //       if (!isKill && diceValue !== 6) {
    //         incrementTurn();
    //       }

    //       setState(STATE.DICE_NOT_ROLLED);
    //     }
    //   }, moveInterval);
    // };

    // movePiece(P1,0,7)


    // const getIncrementedPosition = (player, piece) => {
    //   const currentPosition = currentPositions[player][piece];
    //   const currentPosition1 = currentPositions

    //   // console.log("new poistion in another function",currentPosition1)

    //   console.log("getIncrementedPosition", player, piece, currentPosition); // Ensure this is only called once per movement
    //   if (currentPosition === TURNING_POINTS[player]) return HOME_ENTRANCE[player][0];
    //   if (currentPosition === 51) return 0;

    //   return currentPosition + 1;


    // };

    // const incrementPiecePosition = (player, piece) => {
    //   const newPosition = getIncrementedPosition(player, piece);
    //   setPiecePosition(player, piece, newPosition);
    // }

    // const checkForKill = (player, piece) => {
    //   const currentPosition = currentPositions[player][piece];
    //   const opponent = player === 'P1' ? 'P2' : 'P1';
    //   let kill = false;
    //   [0, 1, 2, 3].forEach(opponentPiece => {
    //     const opponentPosition = currentPositions[opponent][opponentPiece];
    //     if (currentPosition === opponentPosition && !SAFE_POSITIONS.includes(currentPosition)) {
    //       setPiecePosition(opponent, opponentPiece, BASE_POSITIONS[opponent][opponentPiece]);
    //       kill = true;
    //     }
    //   });
    //   return kill;
    // };

    // const hasPlayerWon = (player) => {
    //   return [0, 1, 2, 3].every(piece => currentPositions[player][piece] === HOME_POSITIONS[player]);
    // };

    return (
        <>
            {/* style={{ minHeight: "100vh" }} */}
            <div className="leftContainer leftContainer-Ludo">
                <div className="ludomain">
                    <div className="sound"><img src="/image/images/soundon.png" alt="" srcset="" /></div>

                    <div className="ludo-container">
                        <div className="ludo">
                            <div className="player-pieces">
                                {PLAYERS.map(player =>
                                    currentPositions[player].map((position, index) => (
                                        <PlayerPiece
                                            key={`${player}-${index}`}
                                            playerId={player}
                                            pieceId={index}
                                            position={position}
                                            onClick={handlePieceClick}
                                        />

                                    ))
                                )}
                            </div>

                        </div>
                    </div>
                   
                    <div className="footer">
                        <div className="footer-avtar">
                            <div className="img-left">
                                <div className={`P1 ${turn === 0 ? 'animation' : ''}`}><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnveTKwxve5MH7HXXKE-3iT7_ihOpC0CxLGg&s" alt="" srcset="" />
                                    {/* <div className="animation"></div> */}
                                </div>

                            </div>
                            <div className={`P2 ${turn === 1 ? 'animation' : ''}`}><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnveTKwxve5MH7HXXKE-3iT7_ihOpC0CxLGg&s" alt="" srcset="" /></div>
                        </div>
                        <div className={`arrow ${state !== STATE.DICE_ROLLED ? 'shrink' : 'dis'}`}>
                            <img src="/image/images/arrow.png" alt="Arrow" />
                        </div>
                        <div className={`dice-main ${state === STATE.DICE_ROLLED ? 'disabled' : ''}`}>
                            <img
                                src={`/image/images/Dice${diceValue}.png`}
                                className={`dice ${isSpinning ? 'spin' : ''} btn btn-dice`}
                                alt="This is zero"
                                onClick={state !== STATE.DICE_ROLLED ? onDiceClick : undefined}
                                id="dice-btn"
                            />
                        </div>

                        <div className="footer-last">
                            <div className="left">
                                <div className="left-upper">
                                    <div className="left-pieceimg">
                                        <img src="/image/images/P1.png" alt="" srcset="" />

                                    </div>
                                    <div className="coin-five">
                                        <div className="coin"></div>
                                        <div className="coin"></div>
                                        <div className="coin"></div>
                                        <div className="coin"></div>
                                        <div className="coin"></div>
                                    </div>
                                </div>
                                <div className="nameBox">
                                    <div className="name-heading">
                                        Name
                                    </div>
                                    <hr />
                                    <div className="Name">yte-ieh-idj</div>
                                </div>
                            </div>
                            <div className="right">

                                <div className="nameBox">
                                    <div className="name-heading">
                                        Name
                                    </div>
                                    <hr />
                                    <div className="Name">yte-ieh-idj</div>
                                </div>


                                <div className="right-upper">
                                    <div className="left-pieceimg">
                                        <img src="/image/images/P1.png" alt="" srcset="" />
                                    </div>
                                    <div className="coin-five">
                                        <div className="coin"></div>
                                        <div className="coin"></div>
                                        <div className="coin"></div>
                                        <div className="coin"></div>
                                        <div className="coin"></div>
                                    </div>
                                </div>

                            </div>
                        </div>


                    </div>
                </div>

            </div>

        </>
    );
};

export default LudoBoard;
