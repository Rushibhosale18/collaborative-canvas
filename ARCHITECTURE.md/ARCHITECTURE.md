# Collaborative Canvas Architecture

## 1. Overview

This application is a **real-time collaborative drawing canvas** where multiple users can draw together.  
It uses **Node.js + Express + Socket.io** for backend and **HTML Canvas API** for the frontend.

---

## 2. Data Flow

1. User draws on canvas → client creates a **drawing action object**:
```json
{
  "x1": 10, "y1": 20,
  "x2": 50, "y2": 60,
  "color": "#ff0000",
  "width": 5,
  "tool": "brush"
}
