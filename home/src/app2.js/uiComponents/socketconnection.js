import { io } from "socket.io-client";

// let socket;


// const getSocket = () => {
//     if(!socket){
//   const existingSocketId = localStorage.getItem("socketId");
//   console.log("existingSocketId",existingSocketId)

//   if (!existingSocketId) {
//     console.log("true")
//     socket = io("http://localhost:5000");
//     // localStorage.setItem("socketId",socket.id)

//   } else {
//     console.log("false")
//     socket = io("http://localhost:5000", { query: `socket.id=${existingSocketId}` });
//   }

//   window.addEventListener("beforeunload", () => {
//     // Optionally, you could clear the socket ID if you want a fresh connection on reload
//     // localStorage.removeItem("socketId");
//   });

//   return socket;
// }
// }

// export default getSocket;
const socket = io("https://gamesocket.infayou.shop")

export default socket;
