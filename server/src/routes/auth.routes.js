const express = require("express");
const { signup, login, refreshToken, logout } = require("../controllers/auth.controller");
const { authentication } = require("../middlewares/authMiddleware");

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh", refreshToken);
authRouter.post("/logout", authentication, logout);

module.exports = authRouter;