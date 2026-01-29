const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ✅ IMPORTANT: Serve frontend files
app.use(express.static(path.join(__dirname, "../client")));

// ✅ If someone opens "/", send index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// ================== SOCKET LOGIC ==================

let history = [];
let redoStack = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send existing drawing to new user
  socket.emit("loadHistory", history);

  socket.on("draw", (data) => {
    history.push(data);
    socket.broadcast.emit("draw", data);
  });

  socket.on("cursor", (data) => {
    socket.broadcast.emit("cursor", data);
  });

  socket.on("undo", () => {
    if (history.length > 0) {
      redoStack.push(history.pop());
      io.emit("redraw", history);
    }
  });

  socket.on("redo", () => {
    if (redoStack.length > 0) {
      history.push(redoStack.pop());
      io.emit("redraw", history);
    }
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("removeCursor", socket.id);
    console.log("User disconnected:", socket.id);
  });
});

// ✅ IMPORTANT: Render uses PORT env variable
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
