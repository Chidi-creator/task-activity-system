# API Documentation

**Base URL:** `http://localhost:3000/api/v1`

All responses follow this shape:

```json
{
  "success": true,
  "status": 200,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2026-04-03T00:00:00.000Z"
}
```

Authentication uses **HTTP-only cookies**. The session cookie (`task_activity_session`) is set automatically on login/register and sent with every subsequent request by the browser.

---

## Auth

### POST /auth/register

Create a new account. Sets the session cookie on success.

**Request body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "status": 201,
  "message": "Account created successfully",
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "createdAt": "2026-04-03T00:00:00.000Z"
  }
}
```

**Errors:**
| Status | Reason |
|---|---|
| `409` | Email already in use |

---

### POST /auth/login

Log in with email and password. Sets the session cookie on success.

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "status": 200,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "createdAt": "2026-04-03T00:00:00.000Z"
  }
}
```

**Errors:**
| Status | Reason |
|---|---|
| `401` | Invalid email or password |

---

### POST /auth/logout

🔒 Requires authentication.

Clears the session cookie.

**Response `200`:**
```json
{
  "success": true,
  "status": 200,
  "message": "Logged out successfully",
  "data": {}
}
```

---

## Tasks

All task endpoints require authentication.

### POST /tasks

Create a new task for the authenticated user.

**Request body:**
```json
{
  "title": "My task",
  "description": "Optional description"
}
```

**Response `201`:**
```json
{
  "success": true,
  "status": 201,
  "message": "Task created",
  "data": {
    "id": "uuid",
    "title": "My task",
    "description": "Optional description",
    "status": "PENDING",
    "createdAt": "2026-04-03T00:00:00.000Z",
    "userId": "uuid"
  }
}
```

**Real-time:** All connected clients of this user receive a `task:created` socket event with the new task.

---

### GET /tasks

Get all tasks for the authenticated user. Results are cached for 1 hour.

**Response `200`:**
```json
{
  "success": true,
  "status": 200,
  "message": "Tasks retrieved",
  "data": [
    {
      "id": "uuid",
      "title": "My task",
      "description": "Optional description",
      "status": "PENDING",
      "createdAt": "2026-04-03T00:00:00.000Z",
      "userId": "uuid"
    }
  ]
}
```

---

### PATCH /tasks/:id

Update the status of a task. Only the task owner can update it.

**Request body:**
```json
{
  "status": "IN_PROGRESS"
}
```

Valid status values: `PENDING` `IN_PROGRESS` `COMPLETED`

**Response `200`:**
```json
{
  "success": true,
  "status": 200,
  "message": "Task status updated",
  "data": {
    "id": "uuid",
    "title": "My task",
    "description": "Optional description",
    "status": "IN_PROGRESS",
    "createdAt": "2026-04-03T00:00:00.000Z",
    "userId": "uuid"
  }
}
```

**Real-time:** All connected clients of this user receive a `task:updated` socket event with the updated task.

**Errors:**
| Status | Reason |
|---|---|
| `404` | Task not found |
| `403` | Task belongs to another user |

---

## Health

### GET /healthcheck

Check if the server is running. No authentication required.

**Response `200`:**
```
task-activity Server is up and running!
```

---

## Error response shape

```json
{
  "success": false,
  "status": 401,
  "message": "Unauthorized access",
  "timestamp": "2026-04-03T00:00:00.000Z"
}
```

---

## Real-time (Socket.IO)

Connect to `http://localhost:3000` using Socket.IO. Authentication is required — pass the JWT token from the session cookie via the `Authorization` header or `auth` object.

### Connection

```javascript
const socket = io("http://localhost:3000", {
  auth: { token: "<jwt_token>" }
});
```

### Emitting events (client → server)

| Event | Payload | Ack response |
|---|---|---|
| `task:create` | `{ title, description? }` | `{ success: true }` |
| `task:get-all` | _(none)_ | `{ success: true, data: Task[] }` |
| `task:update-status` | `{ taskId, status }` | `{ success: true }` |
| `ping:check` | _(none)_ | _(none)_ |

### Listening for events (server → client)

| Event | Payload | Trigger |
|---|---|---|
| `task:created` | `Task` | A task was created (via HTTP or socket) |
| `task:updated` | `Task` | A task status was updated (via HTTP or socket) |
| `ping:response` | `{ status, userId, connectedUsers, timestamp }` | Response to `ping:check` |
