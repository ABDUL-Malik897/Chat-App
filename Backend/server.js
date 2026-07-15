import "./config/env.js"
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mssgRoutes from "./routes/mssgRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import users from "./models/users.js";
import grpRoutes from "./routes/grpRoutes.js";


connectDB()

const app = express()
export let io
const server = createServer(app)

io = new Server(server ,{
    cors : {
        origin : ["http://localhost:3000",process.env.CLIENT_URL],
        methods : ["GET","POST"],
        credentials: true
    }
})

app.use(cors({
    origin: [
        "http://localhost:3000",
        process.env.CLIENT_URL
    ],
    credentials: true
}));
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/users' , userRoutes)
app.use('/mssg', mssgRoutes)
app.use('/groups', grpRoutes);
app.get('/',(req ,res) =>{
    res.send("API Running...")
})

const PORT = process.env.PORT || 4000;

export const onlineUsers = new Map()

io.on("connection", (socket) => {
    socket.on("addUser", (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit("getOnlineUsers", [...onlineUsers.keys()]);
    });
    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
        console.log(
            `${socket.id} joined group ${groupId}`
        );
    });
    socket.on("leaveGroup", (groupId) => {
        socket.leave(groupId);
    });
    socket.on("typing",({ senderId , receiverId}) => {
        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping" , senderId)
        }
    })
    socket.on("groupTyping", ({ senderId, groupId }) => {
        socket.to(groupId).emit("groupUserTyping", {
            senderId,
            groupId
        });
    });
    socket.on("stopTyping", ({senderId , receiverId }) => {
        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userStoppedTyping", senderId)
        }
    })
    socket.on("groupStopTyping", ({ senderId, groupId }) => {
        socket.to(groupId).emit("groupUserStoppedTyping", {
            senderId,
            groupId
        });
    });
    socket.on("markMssgRead", ({senderId , receiverId}) => {
        const senderSocketId = onlineUsers.get(senderId)
        if (senderSocketId) {
            io.to(senderSocketId).emit("mssgRead" ,{
                senderId,
                receiverId
            })
        }
    })
    socket.on("disconnect" , async () => {
        for (const [userId , socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                await users.findByIdAndUpdate(userId, {lastSeen: new Date()});
                break;
            }
        }
        io.emit("getOnlineUsers", [...onlineUsers.keys()])
        console.log("User Disconnected :" , socket.id);
    })
})

server.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`);
})