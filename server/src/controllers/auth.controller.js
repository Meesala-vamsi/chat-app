const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Session = require("../models/sessions.model");

exports.signup = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const userExists = await User.findOne({ email: email });

    if (userExists) {
        return next(new ErrorResponse("User already exists.", 400))
    }

    await User.create({
        firstName,
        lastName,
        password,
        email
    })

    return res.status(201).json({
        status: false,
        message: "Account created successfully."
    })
})

// SameSite=None is only accepted by browsers together with Secure (HTTPS).
// In dev, localhost:5173 -> localhost:3002 is same-site, so Lax works over plain http.
const isProd = process.env.NODE_ENV === "production"
const refreshCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
}

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body
    const user = await User.findOne({ email: email });

    if (!user) {
        return next(new ErrorResponse("User not found.", 404))
    }

    const checkPassword = await user.comparePasswords(password, user.password);

    if (!checkPassword) {
        return next(new ErrorResponse("Incorrect password.", 401))
    }

    const refreshToken = jwt.sign({
        email
    }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: "7d" })

    await Session.create({
        userId: user._id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    const token = jwt.sign({
        email,
        userId: user._id
    }, process.env.ACCESS_TOKEN_SECRET_KEY, {
        expiresIn: "20m"
    })

    res.cookie("refreshToken", refreshToken, refreshCookieOptions)

    return res.status(200).json({
        status: true,
        message: "Logged in successfully",
        data: {
            accessToken: token,
            user: {
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email
            }
        }
    })
})

exports.refreshToken = asyncHandler(async (req, res, next) => {
    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken) {
        return next(new ErrorResponse("Refresh token not found.", 400))
    }

    let decoded;

    try{
        decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET_KEY)
    }catch(error){
        return next(new ErrorResponse("Failed to verify refresh token.", 401))
    }

    const session = await Session.findOne({refreshToken: oldRefreshToken}).populate("userId", "-password -__v -createdAt -updatedAt");

    if(!session){
        return next(new ErrorResponse("Session not found. Please log in", 401))
    }

    if(session.isRevoked){
        await Session.deleteMany({userId: decoded.userId})
        res.clearCookie("refreshToken")
        return next(new ErrorResponse('Security breach detected. All sessions revoked. Log in again.', 403));
    }

    session.isRevoked = true
    await session.save();

    const newRefreshToken = jwt.sign({
        email: session.userId.email,
        userId: session.userId._id
    }, process.env.REFRESH_TOKEN_SECRET_KEY, {expiresIn: "7d"})

    const newAccessToken = jwt.sign({
        email: session.userId.email,
        userId: session.userId._id
    },process.env.ACCESS_TOKEN_SECRET_KEY, {expiresIn: "20m"})
    
    await Session.create({
        userId: session.userId._id,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions)

    return res.status(200).json({
        status: true,
        data: {
            accessToken: newAccessToken,
            user: session.userId
        }
    })

})