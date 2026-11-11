const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const http = require("http")
const app = express()
const server = http.createServer(app)
const dotenv = require("dotenv");
const cors = require("cors");
const authRouter = require("./src/routes/auth.routes");
const cookieParser = require("cookie-parser");
const errorHandler = require("./src/utils/globalErrorHandler");
const conversationRoute = require("./src/routes/conversation.routes");
const messageRoutes = require("./src/routes/messages.routes");
const { socketIo, getIo } = require("./src/utils/socket");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("./src/utils/errorResponse");
const Conversation = require("./src/models/conversation.model");
const userRoute = require("./src/routes/user.routes");
const Message = require("./src/models/message.model");
const User = require("./src/models/user.model");
const { joinConversation, markMessagesAsRead, onTyping } = require("./src/utils/socketHandlers");

dotenv.config()

socketIo(server)

const io = getIo()

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Invalid token."))
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (error, data) => {
        if (error) {
            return next(new Error("Invalid or expired access token"))
        }
        socket.userId = data.userId;
        next()
    })
})



app.use(express.json())
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"))
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/conversation", conversationRoute)
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoute);

const onlineUserIds = new Map()

io.on("connection", (socket) => {
    const userId = socket.userId
    console.log("🚀 ~ userId:", userId)
    socket.join(`user:${userId}`)
    console.log("Socket connected")
    let sockets = new Set();
    console.log("🚀 ~ onlineUserIds.get(userId):", onlineUserIds.get(userId))
    if(onlineUserIds.get(userId)){
        sockets.add(onlineUserIds.get(userId))
    }

    console.log("🚀 ~ sockets:", Boolean(sockets))
    if(sockets.size<=0){
        sockets = new Set();
        onlineUserIds.set(userId, socket.id)
    }

    const usersObj = Object.fromEntries(onlineUserIds)
    console.log("🚀 ~ usersObj:", usersObj)
    io.emit("onlineUsers", {onlineUserIds: usersObj})
    // socket.broadcast.emit("onlineUsers", {onlineUserIds: usersObj})
    sockets.add(socket.id)
    // console.log([...socket.rooms], "hello sockets")
    socket.on("joinConversation", async (conversationId, callback) => {
        return joinConversation(conversationId, callback, socket)
    });

    socket.on("leaveConversation", (conversationId) => {
        socket.leave(`conversation:${conversationId}`)
    })

    socket.on("markMessagesAsRead", async (conversationId, callback) => {
        return markMessagesAsRead(conversationId, callback, io)
    });

    // Tell the other people in the conversation that this user is typing.
    // The user comes from the verified token (socket.userId), never from the client payload.
    socket.on("onTyping", async (data, callback) => {
        return onTyping(data, callback, socket);
    })

    console.log("🚀 ~ onlineUserIds:", onlineUserIds)

    socket.on("onStopTyping", (data) => {
        const conversationId = data?.conversationId
        socket.to(`conversation:${conversationId}`).emit("stopTyping", { conversationId, userId: socket.userId })
    })

    socket.on("disconnect", () => {
        const sockets = new Set();
        sockets.add(onlineUserIds.get(userId))
        if(!sockets){
            return
        }
        sockets.delete(socket.id)
        if(sockets.size <= 0){
            onlineUserIds.delete(userId)
            const onlineObj = Object.fromEntries(onlineUserIds)
            socket.broadcast.emit("offlineUsers", {onlineUserIds:onlineObj})
        }

        console.log("Socket disconnected...")
    })
})

app.use(errorHandler);
const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to database")
    })