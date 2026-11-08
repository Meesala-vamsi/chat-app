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

dotenv.config()

socketIo(server)

const io = getIo()

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if(!token){
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

io.on("connection", (socket) => {
    const userId = socket.userId
    console.log("🚀 ~ userId:", userId)
    socket.join(`user:${userId}`)

    // console.log([...socket.rooms], "hello sockets")
    socket.on("joinConversation", async (conversationId, callback) => {
        if(!mongoose.Types.ObjectId.isValid(conversationId)){
            return callback({
                status: false,
                message: "Invalid conversation."
            })
        }

        const userId = socket.userId;
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        })

        if(!conversation){
            return callback({
                status: false,
                message: "Conversation not found"
            })
        }

        socket.join(`conversation:${conversationId}`);
        return callback({
            status: true,
            message: "Joined in conversation successfully."
        })
    });

    socket.on("leaveConversation", (conversationId)=> {
        socket.leave(`conversation:${conversationId}`)
    })

    socket.on("disconnect", () => {
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