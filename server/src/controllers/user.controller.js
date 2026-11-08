const User = require("../models/user.model");
const { asyncHandler } = require("../utils/asyncHandler");

exports.fetchUsers = asyncHandler(async (req, res, next) => {
    const userId = req.user._id.toString();
    const search = (req.query.search || "").trim();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const users = await User.find({
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
    })
        .select("-password")
        .sort({ firstName: 1 })
        .skip((page - 1) * limit)
        .limit(limit + 1) // one extra row tells us if another page exists

    const hasMore = users.length > limit;
    if (hasMore) users.pop();

    return res.status(200).json({
        status: true,
        message: "Users fetched successfully.",
        data: { users, page, hasMore }
    })
})
