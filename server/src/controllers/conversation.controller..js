const Conversation = require("../models/conversation.model");
const User = require("../models/user.model");
const {asyncHandler} = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const { verifyUsersExist } = require("../utils/validations");

exports.createConversation = asyncHandler(async (req,res, next) => {
    const {selectedUserId, type, groupName, groupImage} = req.body;
    const currentUserId = req.user._id.toString();


    const sortKey = [...selectedUserId, currentUserId].sort().join("_");
    console.log("🚀 ~ sortKey:", sortKey)

    const {status, message} = await verifyUsersExist(selectedUserId, type)
    
    if(!status){
        return next(new ErrorResponse(message, 400))
    }


    const selfId = selectedUserId.filter((eachUser) => eachUser === currentUserId);
    if(selfId[0] === currentUserId){
        return next(new ErrorResponse("You cannot create conversation with yourself.", 400));
    }

    const conversation = await Conversation.findOne({conversationKey: sortKey, type});

    if(!conversation){
        let query = {
            createdBy:currentUserId,
            conversationKey: sortKey,
            participants: [
                ...selectedUserId, currentUserId
            ],
            type
        }

        if(groupName){
            query["groupName"] = groupName
        }

        if(groupImage){
            query["groupImage"] = groupImage
        }

        console.log("🚀 ~ query:", query)

        conv = await Conversation.create(query)
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

    const actualConvData = conversations.map((eachConversation) => ({
        ...eachConversation.toObject(),
        "unreadCounts": eachConversation.unreadCounts.get(id) || 0
    }))

    
    return res.status(200).json({
        status: true, 
        data: {
            conversations: actualConvData
        }
    })
    
})