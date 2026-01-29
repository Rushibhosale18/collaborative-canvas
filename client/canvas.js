const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');
const colorPicker = document.getElementById('colorPicker');
const strokeWidthInput = document.getElementById('strokeWidth');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

const socket = io();

let isDrawing = false;
let currentStroke = [];
let tool = 'brush';
let color = colorPicker.value;
let width = strokeWidthInput.value;

// Canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 60;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Tool selection
brushBtn.addEventListener('click', () => {
  tool = 'brush';
  brushBtn.classList.add('active');
  eraserBtn.classList.remove('active');
});
eraserBtn.addEventListener('click', () => {
  tool = 'eraser';
  eraserBtn.classList.add('active');
  brushBtn.classList.remove('active');
});

colorPicker.addEventListener('change', e => color = e.target.value);
strokeWidthInput.addEventListener('change', e => width = e.target.value);

// Mouse events
canvas.addEventListener('mousedown', () => {
  isDrawing = true;
  currentStroke = [];
});

canvas.addEventListener('mouseup', () => {
  if (!isDrawing) return;
  isDrawing = false;
  if (currentStroke.length > 0) {
    socket.emit('stroke', currentStroke);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;

  const point = {
    x: e.offsetX,
    y: e.offsetY,
    color: tool === 'eraser' ? '#FFFFFF' : color,
    width: width
  };

  currentStroke.push(point);
  drawStroke([point]);
});

// Undo / Redo
undoBtn.addEventListener('click', () => socket.emit('undo'));
redoBtn.addEventListener('click', () => socket.emit('redo'));

// Draw stroke
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

// Redraw full canvas
function redrawCanvas(strokes) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(stroke => drawStroke(stroke));
}

// Socket events
socket.on('stroke', (stroke) => drawStroke(stroke));
socket.on('load-strokes', (strokes) => redrawCanvas(strokes));
socket.on('update-canvas', (strokes) => redrawCanvas(strokes));
