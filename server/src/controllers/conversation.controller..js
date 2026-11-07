const Conversation = require("../models/conversation.model");
const User = require("../models/user.model");
const {asyncHandler} = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.createConversation = asyncHandler(async (req,res, next) => {
    const {selectedUserId, type} = req.body;
    const currentUserId = req.user._id.toString();

    const sortKey = [selectedUserId, currentUserId].sort().join("_");

    const user = await User.findById(selectedUserId).select("-password");

    if(!user){
        return next(new ErrorResponse("User not exists.", 404))
    }


    if(selectedUserId === currentUserId){
        return next(new ErrorResponse("You cannot create conversation with yourself.", 400));
    }

    const conversation = await Conversation.findOne({conversationKey: sortKey, type: "direct"});

    if(!conversation){
        const conv = await Conversation.create({
            type: "direct",
            participants:[
                selectedUserId, currentUserId
            ],
            createdBy:currentUserId,
            conversationKey: sortKey
        })
        return res.status(201).json({
            status: true,
            message: "Conversation created successfully.",
            data: {
                conversation: conv
            }
        })
    }

    return res.status(200).json({
        status: true,
        message: "Conversation Exists.",
        data: {
            conversation
        }
    })
})

exports.getConversations = asyncHandler(async (req,res,next) => {
    const id = req.user._id.toString();

    const conversations = await Conversation.find({
        participants: id
    }).populate("participants", "-password")
    .populate("lastMessage")
    .sort({"lastMessageAt":-1})

    return res.status(200).json({
        status: true, 
        data: {
            conversations
        }
    })
    
})