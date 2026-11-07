const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");

const authentication = asyncHandler(async (req,res, next) => {
    const authHead = request.headers.authorization;
    const accessToken = authHead.split(" ")[1];

    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY)
    if(decodedToken.userId){
        req.userId = decodedToken.userId
    } else{
        return next(new ErrorResponse("You do not have permission"))
    }

    next()
})

module.exports = {authentication};