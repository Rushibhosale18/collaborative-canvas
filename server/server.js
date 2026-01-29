const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static(__dirname + "/../client"));


let globalHistory = [];
let redoStack = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  
  socket.emit("loadHistory", globalHistory);

  
  socket.on("draw", (data) => {
    globalHistory.push(data); 
    socket.broadcast.emit("draw", data); 
  });

  
  socket.on("cursor", (data) => {
    socket.broadcast.emit("cursor", data);
  });

 
  socket.on("undoRedo", (data) => {
    globalHistory = data.history;
    redoStack = data.redoStack;
    socket.broadcast.emit("undoRedo", data); 
  });

 
  socket.on("disconnect", () => {
    socket.broadcast.emit("removeCursor", socket.id);
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
