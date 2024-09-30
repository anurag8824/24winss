const mongoose = require("mongoose")

const tempSchema = new mongoose.Schema({

    whatsapp_link: {
        type:String,
        default:"abc"

    },
    telegram_link:{
        type:String,
        default:"abc"
    },
    facebook_link: {
        type: String,
        default:"abc"
    },
    carousel_link:{
        type:String,
        default:"abc"
    },
    carousel_link_1:{
        type:String,
        default:"abc"
    },
    carousel_link_2:{
        type:String,
        default:"abc"
    }

},{timestamps:true})

const Linksetting = mongoose.model("link", tempSchema)

    module.exports = Linksetting