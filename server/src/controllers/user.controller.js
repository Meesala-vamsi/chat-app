const User = require("../models/user.model");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const { asyncHandler } = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const { validateId } = require("../utils/validations");
const { isOurCloudinaryUrl } = require("../utils/cloudinary");

const SHARED_MEDIA_TYPES = ["image", "video"];

exports.fetchUsers = asyncHandler(async (req, res, next) => {
    const userId = req.user._id.toString();
    const search = (req.query.search || "").trim();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const filter = {
        _id: { $ne: userId },
        $or: [
            { firstName: { $regex: escapedSearch, $options: 'i' } },
            { lastName: { $regex: escapedSearch, $options: 'i' } },
            {
                $expr: {
                    $regexMatch: {
                        input: { $concat: ["$firstName", " ", "$lastName"] },
                        regex: escapedSearch,
                        options: "i"
                    }
                }
            }
        ]
    };

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("-password")
            .sort({ firstName: 1, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit + 1),
        User.countDocuments(filter)
    ]);

    const hasMore = users.length > limit;
    if (hasMore) users.pop();

    return res.status(200).json({
        status: true,
        message: "Users fetched successfully.",
        data: { users, page, hasMore, total }
    })
})

exports.getUserById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!validateId(id)) {
        return next(new ErrorResponse("User not found.", 404));
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
        return next(new ErrorResponse("User not found.", 404));
    }

    return res.status(200).json({
        status: true,
        message: "User fetched successfully.",
        data: { user }
    })
})

exports.fetchSharedMedia = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { before } = req.query;
    const currentUserId = req.user._id.toString();
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

    if (!validateId(id)) {
        return next(new ErrorResponse("User not found.", 404));
    }

    if (before && !validateId(before)) {
        return next(new ErrorResponse("Media not found.", 404));
    }

    const conversationKey = [id, currentUserId].sort().join("_");
    const conversation = await Conversation.findOne({ conversationKey, type: "direct" }).select("_id");

    if (!conversation) {
        return res.status(200).json({
            status: true,
            message: "Shared media fetched successfully.",
            data: { media: [], nextCursor: null, hasMore: false }
        })
    }

    const filter = {
        conversationId: conversation._id,
        messageType: { $in: SHARED_MEDIA_TYPES }
    };

    if (before) {
        filter._id = { $lt: before };
    }

    const messages = await Message.find(filter)
        .select("messageType attachments createdAt")
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;
    const media = messages
        .filter((message) => message.attachments?.[0])
        .map((message) => ({
            _id: message._id,
            messageType: message.messageType,
            url: message.attachments[0],
            createdAt: message.createdAt
        }));

    return res.status(200).json({
        status: true,
        message: "Shared media fetched successfully.",
        data: { media, nextCursor, hasMore }
    })
})

exports.updateMyProfile = asyncHandler(async (req, res, next) => {
    const { about, designation, avatar } = req.body;
    const updates = {};

    if (about !== undefined) {
        if (typeof about !== "string" || about.trim().length > 200) {
            return next(new ErrorResponse("About must be text with up to 200 characters.", 400));
        }
        updates.about = about.trim();
    }

    if (designation !== undefined) {
        if (typeof designation !== "string" || designation.trim().length > 80) {
            return next(new ErrorResponse("Designation must be text with up to 80 characters.", 400));
        }
        updates.designation = designation.trim();
    }

    if (avatar !== undefined) {
        if (avatar !== "" && !isOurCloudinaryUrl(avatar)) {
            return next(new ErrorResponse("Invalid avatar link.", 400));
        }
        updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
        return next(new ErrorResponse("Nothing to update.", 400));
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
        status: true,
        message: "Profile updated successfully.",
        data: { user }
    })
})
