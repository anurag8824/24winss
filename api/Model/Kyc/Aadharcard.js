const mongoose = require("mongoose")

const AadharSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    Name: {
        type: String,
        default: null
    },
    DOB: {
        type: String,
        default: null
    },
    Gender: {
        type: String,
        default: null
    },
    Number: {
        type: String,
        required: true
    },
    Address: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    
    alldata: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    
    client_id: {
        type: String,
        default: null
    },
    front: {
        type: String,
        default: null
    },
    back: {
        type: String,
        default: null
    },
    verified: {
        type: String,
        default: "unverified"
    },

}, {
    timestamps: true
})

const AadharCard = mongoose.model("AadharCard", AadharSchema)
module.exports = AadharCard