import mongoose from "mongoose";

const gameData = new mongoose.Schema({
    game:{
        type:String,

    }
})


const game = mongoose.model("Ludogame",gameData);

export default game;