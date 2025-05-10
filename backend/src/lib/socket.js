import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// ✅ Setup CORS for both local and deployed frontend
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",                // Local frontend
          // Deployed frontend
    ],
    methods: ["GET", "POST"], // Optional but recommended
    credentials: true         // Optional: allow cookies/auth headers
  },
});

// ✅ Used to store online users
const userSocketMap = {}; // { userId: socketId }

// ✅ Get receiver's socket ID for direct messaging
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// ✅ Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Broadcast updated list of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
