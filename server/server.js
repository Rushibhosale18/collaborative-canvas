const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static(path.join(__dirname, '../client')));


let drawingHistory = [];


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  
  socket.emit('history', drawingHistory);

  
  socket.on('draw', (data) => {
    drawingHistory.push(data);      
    socket.broadcast.emit('draw', data); 
  });

  
  socket.on('undo', () => {
    drawingHistory.pop();
    io.emit('undo'); 
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
