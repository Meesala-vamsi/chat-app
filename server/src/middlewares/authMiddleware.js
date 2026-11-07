const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/user.model");

const authentication = asyncHandler(async (req,res, next) => {
    const authHead = req.headers.authorization;
    const accessToken = authHead.split(" ")[1];

    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY)
    if(decodedToken.userId){
        const user = await User.findById(decodedToken.userId).select("-password");
        req.user = user
    } else{
        return next(new ErrorResponse("You do not have permission", 401))
    }

    next()
})

module.exports = {authentication};