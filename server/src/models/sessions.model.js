const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "user id is required."]
    },
    refreshToken: {
        type: String,
        required: [true, "Refresh token is required."]
    },
    isRevoked:{
        type: Boolean,
        default: false
    },
    expiresAt:{
        type: Date,
        required: [true, "Expiration date is required."],
        index:{expires: 0}
    }
}, {timestamps: true});


const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;