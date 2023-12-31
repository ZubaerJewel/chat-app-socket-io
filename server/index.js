const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const conversationMap = new Map(); // Map to store conversation history by room

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);

    // Send previous conversation to the user when they join a room
    const roomConversation = conversationMap.get(data) || [];
    socket.emit("previous_conversation", roomConversation);
  });

  socket.on("get_conversation", (room) => {
    const roomConversation = conversationMap.get(room) || [];
    socket.emit("previous_conversation", roomConversation);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);

    // Add the message to the conversationMap
    if (!conversationMap.has(data.room)) {
      conversationMap.set(data.room, []);
    }
    conversationMap.get(data.room).push(data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});


// const express = require("express");
// const app = express();
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
// app.use(cors());

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

// // Create a map to store socket IDs and usernames
// const users = new Map();

// io.on("connection", (socket) => {
//   console.log(`User Connected: ${socket.id}`);

//   socket.on("join_room", (data) => {
//     socket.join(data);
//     console.log(`User with ID: ${socket.id} joined room: ${data}`);
//     users.set(socket.id, data); // Store socket ID and room mapping
//   });

//   socket.on("send_message", (data) => {
//     socket.to(data.room).emit("receive_message", data);

//     // Notify the sender when the message is received by the recipient
//     const senderRoom = users.get(socket.id);
//     if (senderRoom !== data.room) {
//       socket.emit("message_received", { recipient: data.author });
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("User Disconnected", socket.id);
//     users.delete(socket.id); // Remove user from the map
//   });
// });

// server.listen(3001, () => {
//   console.log("SERVER RUNNING");
// });

