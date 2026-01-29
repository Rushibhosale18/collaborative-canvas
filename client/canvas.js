
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

const colorPicker = document.getElementById("colorPicker");
const sizePicker = document.getElementById("sizePicker");
const brushBtn = document.getElementById("brushBtn");
const eraserBtn = document.getElementById("eraserBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

let currentTool = "brush";
let isDrawing = false;
let lastX = 0;
let lastY = 0;

brushBtn.onclick = () => currentTool = "brush";
eraserBtn.onclick = () => currentTool = "eraser";


let history = [];
let redoStack = [];


const myId = Math.random().toString(36).substr(2, 9);
const myColor = "#" + Math.floor(Math.random()*16777215).toString(16);
const otherCursors = {};

const socket = io("http://localhost:3000");


canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mouseup", () => { isDrawing = false; });
canvas.addEventListener("mousemove", (e) => {
  
  socket.emit("cursor", { x: e.offsetX, y: e.offsetY, color: myColor, id: myId });

  if (!isDrawing) return;

  
  const action = {
    x1: lastX, y1: lastY,
    x2: e.offsetX, y2: e.offsetY,
    color: colorPicker.value,
    width: sizePicker.value,
    tool: currentTool
  };
  history.push(action);
  redoStack = [];
  drawLine(action);

  socket.emit("draw", action);

  lastX = e.offsetX;
  lastY = e.offsetY;
});


function drawLine(action) {
  ctx.beginPath();
  ctx.moveTo(action.x1, action.y1);
  ctx.lineTo(action.x2, action.y2);
  ctx.lineWidth = action.width;
  ctx.lineCap = "round";

  if (action.tool === "brush") {
    ctx.strokeStyle = action.color;
    ctx.globalCompositeOperation = "source-over";
  } else {
    ctx.globalCompositeOperation = "destination-out";
  }

  ctx.stroke();
}


function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let action of history) {
    drawLine(action);
  }

  for (let id in otherCursors) {
    const cursor = otherCursors[id];
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 5, 0, Math.PI*2);
    ctx.fillStyle = cursor.color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();
  }
}


undoBtn.onclick = () => {
  if (history.length === 0) return;
  redoStack.push(history.pop());
  socket.emit("undoRedo", { history, redoStack });
  redrawCanvas();
};

redoBtn.onclick = () => {
  if (redoStack.length === 0) return;
  history.push(redoStack.pop());
  socket.emit("undoRedo", { history, redoStack });
  redrawCanvas();
};


socket.on("draw", (data) => {
  history.push(data);
  drawLine(data);
});

socket.on("cursor", (data) => {
  if (data.id === myId) return;
  otherCursors[data.id] = { x: data.x, y: data.y, color: data.color };
  redrawCanvas();
});

socket.on("removeCursor", (id) => {
  delete otherCursors[id];
  redrawCanvas();
});

socket.on("undoRedo", (data) => {
  history = data.history;
  redoStack = data.redoStack;
  redrawCanvas();
});

socket.on("loadHistory", (serverHistory) => {
  history = serverHistory;
  redrawCanvas();
});
