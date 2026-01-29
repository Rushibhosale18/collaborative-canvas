const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const strokeWidthInput = document.getElementById('strokeWidth');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

const socket = io();

let isDrawing = false;
let currentStroke = [];
let color = colorPicker.value;
let width = strokeWidthInput.value;
let isEraser = false;

// Canvas size
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

// Tool events
colorPicker.addEventListener('change', e => color = e.target.value);
strokeWidthInput.addEventListener('change', e => width = e.target.value);
eraserBtn.addEventListener('click', () => isEraser = !isEraser);

// Mouse events
canvas.addEventListener('mousedown', () => {
  isDrawing = true;
  currentStroke = [];
});

canvas.addEventListener('mouseup', () => {
  if (!isDrawing) return;
  isDrawing = false;
  if (currentStroke.length > 0) {
    socket.emit('stroke', currentStroke); // send stroke to server
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;

  const point = {
    x: e.offsetX,
    y: e.offsetY,
    color: isEraser ? '#FFFFFF' : color,
    width: width
  };

  currentStroke.push(point);
  drawStroke([point]); // draw locally
});

// Undo / Redo buttons
undoBtn.addEventListener('click', () => socket.emit('undo'));
redoBtn.addEventListener('click', () => socket.emit('redo'));

// Draw function
function drawStroke(stroke) {
  stroke.forEach((point, i) => {
    if (i === 0) ctx.beginPath();
    ctx.strokeStyle = point.color;
    ctx.lineWidth = point.width;
    ctx.lineCap = 'round';
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  });
}

// Clear and redraw entire canvas
function redrawCanvas(strokes) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(stroke => drawStroke(stroke));
}

// Socket.io events
socket.on('stroke', (stroke) => drawStroke(stroke));
socket.on('load-strokes', (strokes) => redrawCanvas(strokes));
socket.on('update-canvas', (strokes) => redrawCanvas(strokes));
