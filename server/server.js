const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const http = require("http")
const {Server} = require("socket.io");
const app = express()
const server = http.createServer(app)
const dotenv = require("dotenv");
const cors = require("cors");
const authRouter = require("./src/routes/auth.routes");
const cookieParser = require("cookie-parser");
const errorHandler = require("./src/utils/globalErrorHandler");

dotenv.config()

const io = new Server(server, {
    cors:{
        origin:process.env.FRONTEND_URL
    }
})

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Connected to database")
})

app.use(express.json())
app.use(morgan())
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials: true
}))
app.use(cookieParser())
app.use("/api/auth", authRouter)

io.on("connection", (socket) => {
    console.log("Socket connected")
    socket.on("close", () => {
        console.log("Socket disconnected...")
    })
})

app.use(errorHandler);
const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})