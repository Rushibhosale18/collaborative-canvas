const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve client files
app.use(express.static(path.join(__dirname, '../client')));

// Global drawing state
let strokes = [];
let undoneStrokes = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send existing strokes to new user
  socket.emit('load-strokes', strokes);

  // New stroke from user
  socket.on('stroke', (stroke) => {
    strokes.push(stroke);
    undoneStrokes = []; // clear redo stack
    socket.broadcast.emit('stroke', stroke);
  });

  // Undo last stroke
  socket.on('undo', () => {
    if (strokes.length > 0) {
      const undone = strokes.pop();
      undoneStrokes.push(undone);
      io.emit('update-canvas', strokes);
    }
  });

  // Redo last undone stroke
  socket.on('redo', () => {
    if (undoneStrokes.length > 0) {
      const redoStroke = undoneStrokes.pop();
      strokes.push(redoStroke);
      io.emit('update-canvas', strokes);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
