const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const strokeWidthInput = document.getElementById('strokeWidth');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');

const socket = io();

let isDrawing = false;
let currentColor = colorPicker.value;
let strokeWidth = strokeWidthInput.value;
let isEraser = false;


canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;


colorPicker.addEventListener('change', (e) => currentColor = e.target.value);
strokeWidthInput.addEventListener('change', (e) => strokeWidth = e.target.value);


eraserBtn.addEventListener('click', () => isEraser = !isEraser);


undoBtn.addEventListener('click', () => socket.emit('undo'));


function drawOnCanvas({ x, y, color, width }) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}


canvas.addEventListener('mousedown', () => isDrawing = true);
canvas.addEventListener('mouseup', () => {
  isDrawing = false;
  ctx.beginPath();
});
canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;

  const data = {
    x: e.offsetX,
    y: e.offsetY,
    color: isEraser ? '#FFFFFF' : currentColor,
    width: strokeWidth
  };

  drawOnCanvas(data);
  socket.emit('draw', data);
});


socket.on('draw', (data) => drawOnCanvas(data));


socket.on('undo', () => {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('requestHistory'); 
});


socket.on('history', (history) => {
  history.forEach(data => drawOnCanvas(data));
});
