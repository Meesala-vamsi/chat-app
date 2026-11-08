const { Server } = require("socket.io");
const ErrorResponse = require("./errorResponse");

let io;

exports.socketIo = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true
        }
    })

    return io
}



exports.getIo = () => {
    if(!io){
        return new ErrorResponse("Socket connection failed..", 500)
    }

    return io
}