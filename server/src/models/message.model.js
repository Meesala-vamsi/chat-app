const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: [true, "Conversation id is required."]
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Sender id is required."]
    },
    messageType: {
        type: String,
        enum: ["text", "image", "video", "audio", "file"],
        default: "text"
    },
    content: {
        type: String,
        default: ""
    },
    attachments: [{
        type: String
    }],
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true })

messageSchema.index({
    conversationId: 1,
    createdAt: -1
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;