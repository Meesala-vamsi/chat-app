const express = require("express");
const { fetchUsers, getUserById, fetchSharedMedia, updateMyProfile } = require("../controllers/user.controller");
const { authentication } = require("../middlewares/authMiddleware");

const userRoute = express.Router();
userRoute.use(authentication);

userRoute.get("/", fetchUsers)
userRoute.patch("/me", updateMyProfile)
userRoute.get("/:id", getUserById)
userRoute.get("/:id/media", fetchSharedMedia)

module.exports = userRoute;
