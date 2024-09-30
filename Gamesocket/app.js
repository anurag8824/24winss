import express from "express"
import { Server } from "socket.io";
import { createServer } from "http";
import mongoose from "mongoose";

// import cros from "cros";

const app = express();
const server = createServer(app);
const io = new Server(server, {cors:{
    origin:"*"
}});

// app.use(cros())
let user = 0;
let Live_Games =0;
// const User_term = 5;
let games = {}
let playersQueue = {}

// mongoose.Connection("mongodb://infayoudigital:<db_password>@<hostname>/?ssl=true&replicaSet=atlas-aih4gf-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0",()=>{
// console.log("db is connected !")
// })

const createGame = (betAmount, player1) => {
    const gameId = `game-${Date.now()}`;
    games[gameId] = {
      players: [player1],
      betAmount,
      gameState: {
        Poistion:{
          P1: [500,501,502,503],
          P2: [600,601,602,603]
        },
        turn:0,
        dice:1
      }, 
    };
    return gameId;
  };
  const joinGame = (gameId, player) => {
    const game = games[gameId];
    game.players.push(player);
    if (game.players.length === 2) {
      
      startGame(gameId);
    }
    else{
    }
  };
  
  const startGame = (gameId) => {
    const game = games[gameId];
    console.log("Start Game Trigged !")
    io.to(gameId).emit('startGame', { gameId, players: game.players, gameState: game.gameState });
  };
  
 
io.on("connection",(socket)=>{
//     console.log("new use connected")
//     console.log("socket-id",socket.id)

 user++;
// console.log(user)
//     // socket.emit("waiting","seraching for your Partner !")
//     socket.on("NewPlayer",(msg)=>{
//         console.log(" newe player msg",msg,socket.id)
//         activeuserforthree++;
//         console.log(activeuserforthree)
//         Players.push = {
//             Player1 : socket.id,
//             Betammount: msg
//         }
//     })




  // socket.emit("RunningBalttel",{Live_Games,})


    console.log('New player connected:', socket.id,user);
  
    socket.on('joinBet', ( betAmount ) => {
      if (playersQueue[betAmount]) {
        console.log(betAmount,"bet ammount")
        console.log(playersQueue[betAmount])
        const gameId = playersQueue[betAmount];
        socket.join(gameId);
        joinGame(gameId, socket.id);
        delete playersQueue[betAmount];
        
        io.to(gameId).emit('playerJoined', { playerId: socket.id ,gameId});
        console.log("Now Running Games",games);
      } else {
        const gameId = createGame(betAmount, socket.id);
        playersQueue[betAmount] = gameId;
        console.log("gameId",gameId)

        socket.join(gameId);
        io.to(gameId).emit("OnePlayer",gameId)
      }
    });


    socket.on("Dice-Value",({gameId,roll,diceValue})=>{
        console.log("trigged Dice-Value event",gameId,roll,diceValue)
        io.to(gameId).emit("DiceValueClient",roll)
    })  
    socket.on("handleClickPiece",({gameId,player,piece,turn})=>{
        console.log("handleClickpiece",gameId,player,piece,turn)
        io.to(gameId).emit("handleClickPiececClient",{player,piece,turn})
    })
    socket.on("GameState",(msg)=>{
      console.log("new current poistion update",msg)
      const gameId = msg.gameId;
      const game = games[gameId]
      if(game){
        game.gameState.Poistion = msg.currentPositions;
        game.gameState.turn = msg.turn;
        game.gameState.dice = msg.diceValue;

          
      }
      console.log("now currnet poistion",game.gameState.Poistion);


    })

    socket.on("rejoin",(msg)=>{
      console.log(msg,"msg")
      const gameId = msg.gameId;
      console.log("game id form local storage",gameId)
      const playerid = socket.id;
      // const PlayerId = playerid.toString();
      console.log(playerid,"socket id ")
      const checkingforgame = games[gameId]
      console.log("checkingforgame",checkingforgame)
      console.log(checkingforgame.players) 
      if(checkingforgame){
        const checkingforplayer = checkingforgame.players.includes(playerid);
        console.log("checkingforplayer",checkingforplayer)
        if(checkingforplayer){
          io.to(gameId).emit('startGame', { gameId, players: checkingforgame.players, gameState: checkingforgame.gameState });

        }
      }
    })

    // socket.on("Reconnect",())

    socket.on("disconnect",()=>{
        console.log("one  disconnect",socket.id)
        // Live_Games--;
        console.log(user);
        // user--;
        // io.to(socket.id).emit("clean",socket.id)
    })
})
console.log("games",games)
server.listen(5000,()=>{
    console.log("server is running on port 5000");
})