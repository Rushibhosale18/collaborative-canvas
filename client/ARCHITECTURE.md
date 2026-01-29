# Collaborative Canvas Architecture

## 1. Data Flow Diagram
1. User draws on canvas
2. Frontend captures drawing events
3. Frontend sends drawing events via WebSocket to server
4. Server broadcasts events to all connected clients
5. Clients update their canvases in real-time

## 2. WebSocket Protocol
- **Events sent from client to server:**
  - `draw_start` {x, y, color, width, userId}
  - `draw_move` {x, y, color, width, userId}
  - `draw_end` {userId}
  - `undo` {userId}
  - `redo` {userId}
- **Events sent from server to clients:**
  - `draw_start`, `draw_move`, `draw_end`, `undo`, `redo`

## 3. Undo / Redo Strategy
- Maintain a **global history array** of drawing actions
- Each action has: userId, tool, color, width, path points
- Undo removes the **last action** globally, visible to all users
- Redo reapplies the last undone action

## 4. Performance Decisions
- Send drawing events **throttled** (e.g., every 10ms)
- Only redraw affected canvas regions
- Assign unique colors to users to minimize confusion

## 5. Conflict Handling
- If multiple users draw at the same coordinates simultaneously:
  - Draw in order received by server
  - Each user sees others’ drawing in real-time
  - Undo/redo works on global history
