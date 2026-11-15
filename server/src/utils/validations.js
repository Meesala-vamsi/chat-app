const mongoose = require("mongoose")
const ErrorResponse = require("./errorResponse")
const User = require("../models/user.model")

const validateId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return false
    }
    return true
}

const verifyUsersExist = async (userIds, type) => {

    if (type === "direct") {
        const user = await User.findById([...userIds]).select("-password");

        if (!user) {
            return {
                status: false,
                message: "Selected user not exists."
            }
        }

        return {
            status: true,
            message: ""
        }
    }

    const uniqueIds = [...new Set(userIds)]
    const allUsersAreValid = uniqueIds.every((user) => validateId(user))

    if (!allUsersAreValid) {
        return { status: false, message: "Invalid selected user" }
    }

    const foundCount = await User.countDocuments({
        _id: { $in: uniqueIds }
    })

    if (foundCount !== uniqueIds.length) {
        return {
            status: false,
            message: "Invalid selected user"
        }
    }

    return {
        status: true,
        message: ""
    }
}


module.exports = { validateId, verifyUsersExist }