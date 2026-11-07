const mongoose = require("mongoose");


const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["direct", "group"],
        required: [true, "Conversation type is required"],
        default: "direct"
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Conversation participants are required."],
        validate: {
            validator: function (value) {
                return value.length >= 2;
            },
            message: "A conversation must have at least two participants."
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Conversation creator is required."]
    },
    groupName: {
        type: String,
        default: ""
    },
    groupImage: {
        type: String,
        default: ""
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null
    },
    lastMessageAt: {
        type: Date,
        default: null
    },
    conversationKey: { // vamsi_rahul
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;