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

---

## Setup

### Prerequisites
- Docker and Docker Compose
- Node.js v20+
- Make

### Steps

```bash
git clone <repo-url>
cd task-activity-system
npm install
cp .env.example .env
make dev
make setup
```

`make setup` runs migrations and seeds a default user:

| Email | Password |
|---|---|
| test@example.com | password |

Verify the server is up:
```bash
curl http://localhost:3000/api/v1/healthcheck
```

### Available commands

| Command | Description |
|---|---|
| `make dev` | Build and start all containers |
| `make dev-drop` | Stop and remove all containers |
| `make dev-logs` | Tail live backend logs |
| `make prod` | Build and start production container (uses prod URLs) |
| `make prod-drop` | Stop production container |
| `make prod-logs` | Tail live production container logs |
| `make setup` | Run migrations + seed |
| `make migrate` | Apply pending migrations |
| `make migrate-create name=<name>` | Create a new migration |
| `make seed` | Seed the test user |
| `make generate` | Regenerate the Prisma client |

---

## Design decisions

**Layered architecture**

The codebase is split into strict layers — deliverymen (routing), handlers (req/res), usecases (business logic), repositories (DB). Each layer has one job and only talks to the layer below it. This makes the code easy to follow and easy to extend without touching unrelated parts.

**Redis pub/sub for real-time updates**

Task mutations publish to Redis rather than emitting directly to sockets. The subscription layer receives from Redis and handles socket delivery. This means HTTP and socket entry points both produce the same outcome — one publish, one place that handles delivery — with no duplication of notification logic.

**Redis adapter for Socket.IO**

Socket.IO is attached to a Redis adapter so that `emitToUser` works correctly when scaled to multiple server instances. Users join a personal room (`user:<userId>`) on connect and the adapter routes emits through Redis to whichever instance holds their socket.

**Cookie-based JWT auth**

Sessions are stored in HTTP-only cookies. This prevents JavaScript from accessing the token, removing a class of XSS-based token theft. The same cookie is forwarded in the Socket.IO handshake so the same auth mechanism covers both HTTP and real-time connections.

**Base repository pattern**

All database models extend a `BaseRepository` that provides `findOne`, `findMany`, `create`, `update`, `delete`, and `count`. Adding a new model requires one file that points to its Prisma delegate — no repeated CRUD boilerplate.

---

## Trade-offs

**In-memory connected users Map**

Each server instance maintains a local Map of `userId → socketId` for fast `isUserConnected()` checks. This Map is local only — it diverges across instances. This is intentional: emitting uses rooms (synced via Redis adapter), not the Map. The Map is cheap and accurate for local checks; it was never needed for cross-instance delivery.

**Manual pub/sub vs socket adapter for delivery**

The Redis adapter handles Socket.IO's internal room routing. The app-level pub/sub (PubSubManager) handles task event delivery. These are two separate Redis connection pairs doing different jobs. The duplication is intentional — mixing app-level event semantics with socket adapter internals would couple them in ways that are hard to debug and extend.

**Validation at the handler layer**

Joi validation runs in handlers before the usecase is called. Usecases assume their input is valid. This keeps business logic clean and means validation failures return immediately without touching the database.

**Cache invalidation on every mutation**

The task list cache is deleted on every create or status update rather than updating in place. This is a simpler, safer strategy — stale cache is impossible, and list queries are cheap enough that a full refetch on invalidation is not a problem at this scale.
