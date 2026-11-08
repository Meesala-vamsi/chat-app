const express = require("express");
const { fetchUsers } = require("../controllers/user.controller");
const { authentication } = require("../middlewares/authMiddleware");

const userRoute = express.Router();
userRoute.use(authentication);

userRoute.get("/", fetchUsers)

module.exports = userRoute;
