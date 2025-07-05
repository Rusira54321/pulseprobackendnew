// app.js or server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const Notification = require("./model/NotificationSchema"); // Your Mongoose model

// Import your routers (adjust paths as necessary)
const classroute = require("./router/Class");
const member = require("./router/member");
const trainerroute = require("./router/trainer");
const geminirouter = require("./router/gemini");
const attendanceRoute = require("./router/Attendance");
const workoutRouter = require("./router/WorkoutPlan");
const paymentrouter = require("./router/payment");
const striperoute = require("./router/stripe");
const multerroute = require("./router/multer");
const memberplanroute = require("./router/memberplan");
const dietplanRoute = require("./router/Dietplan");
const supplimentroute = require("./router/Suppliment");
const authrouter = require("./router/addgym");

// Checkers (side-effect modules)
require("./router/checkexpireaidietplan");
require("./router/checkexpireaischedule");
require("./router/classchecker");
require("./router/dietplanchecker");
require("./router/membershipchecker");
require("./router/workoutplanchecker");

app.use(express.static("./public"));
app.use(express.json());
app.use(cors());

app.use("/memberplan", memberplanroute);
app.use("/workout", workoutRouter);
app.use("/get", member);
app.use("/auth", authrouter);
app.use("/multer", multerroute);
app.use("/trainer", trainerroute);
app.use("/diet", dietplanRoute);
app.use("/suppliment", supplimentroute);
app.use("/ai", geminirouter);
app.use("/Attendance", attendanceRoute);
app.use("/class", classroute);
app.use("/stripes", striperoute);
app.use("/payment", paymentrouter);
app.use("/webhook", require("./router/webhook"));

require("dotenv").config();
const port = process.env.PORT || 5000;

const createConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDb connection is successful");
    server.listen(port, () => {
      console.log("Server is running on port " + port);
    });
  } catch (error) {
    console.error(error);
  }
};
createConnection();

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

// Map username_role => socket.id to handle unique user socket per role
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  // Register event must receive { username, role }
  socket.on("register", ({ username, role } = {}) => {
    if (!username || !role) {
      console.log("⚠️ register event missing username or role", { username, role });
      return;
    }

    const key = `${username}_${role}`;

    // If already connected, disconnect the old socket for this user-role combo
    if (onlineUsers.has(key)) {
      const oldSocketId = onlineUsers.get(key);
      if (oldSocketId !== socket.id) {
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket) {
          oldSocket.disconnect(true);
          console.log(`Disconnected old socket for ${key}: ${oldSocketId}`);
        }
      }
    }

    onlineUsers.set(key, socket.id);
    console.log(`User ${key} registered with socket ${socket.id}`);
  });

  socket.on("sendNotification", async ({ sender, receiver, message }) => {
    console.log("⚡ Notification received on server", { sender, receiver, message });

    // Validate sender and receiver
    if (
      !sender?.username || !sender?.role ||
      !receiver?.username || !receiver?.role
    ) {
      console.log("⚠️ Invalid notification sender or receiver data");
      return;
    }

    // Save notification in DB
    const notif = new Notification({
      senderUsername: sender.username,
      senderRole: sender.role,
      receiverUsername: receiver.username,
      receiverRole: receiver.role,
      message,
    });

    await notif.save();

    // Send to receiver socket if online
    const receiverKey = `${receiver.username}_${receiver.role}`;
    const receiverSocketId = onlineUsers.get(receiverKey);

    console.log("📡 Receiver socket ID:", receiverSocketId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveNotification", notif);
      console.log("✅ Notification sent via socket to", receiverKey);
    } else {
      console.log("❌ Receiver is offline");
    }
  });

  socket.on("disconnect", () => {
    for (const [key, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(key);
        console.log(`User ${key} disconnected`);
        break;
      }
    }
  });
});
