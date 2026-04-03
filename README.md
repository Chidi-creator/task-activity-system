# Task Activity System

A real-time task management backend built with Node.js, TypeScript, PostgreSQL, and Redis.

Users can create and manage tasks, update their status, and receive live updates the moment anything changes — across any number of connected clients.

---

## What it does

- **Auth** — Register, login and logout with JWT sessions stored in HTTP-only cookies
- **Tasks** — Create tasks, list your tasks, and update their status (`PENDING` → `IN_PROGRESS` → `COMPLETED`)
- **Real-time** — Every task create and status update is pushed to the user's connected clients instantly via Socket.IO and Redis pub/sub
- **Caching** — Task lists are cached in Redis and invalidated automatically on any change

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express v5 |
| Database | PostgreSQL (via Prisma v7) |
| Cache | Redis (ioredis) |
| Real-time | Socket.IO + Redis adapter |
| Pub/Sub | Redis pub/sub |
| Auth | JWT + HTTP-only cookies |
| Containers | Docker + Docker Compose |

---

## Architecture

```
HTTP / Socket.IO
      ↓
  Handler         (request/response)
      ↓
  UseCase         (business logic)
      ↓
  Repository      (database operations)
      ↓
  PubSubManager   (publishes event to Redis)
      ↓
  Subscription    (receives from Redis, delivers via socket)
      ↓
  Client          (receives real-time update)
```

Every task mutation — whether triggered by HTTP or a socket event — goes through the same usecase, publishes to Redis, and gets delivered to the user's browser in real time.

---

## Project structure

```
src/
├── app.ts                  # Server entry point
├── config/                 # JWT, Redis config
├── db/                     # Prisma client singleton
├── deliverymen/            # Route definitions
├── handlers/               # Request/response handlers
├── managers/               # Cache, PubSub, Response, Error managers
├── middleware/             # Express middleware + auth middleware
├── repositories/           # DB operations (base + per-model)
├── services/               # Auth service, Cache service
├── socket/                 # Socket.IO manager + event modules
├── subscriptions/          # Redis pub/sub subscription handlers
└── usecases/               # Business logic
```

---

## Docs

- [Getting Started](getting-started.md) — setup, environment, make commands
- [API Reference](api.md) — HTTP endpoints and Socket.IO events
