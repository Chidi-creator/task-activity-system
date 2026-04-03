# Getting Started

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) v20+
- [Make](https://www.gnu.org/software/make/)

---

## 1. Clone and install dependencies

```bash
git clone <repo-url>
cd task-activity-system
npm install
```

---

## 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and update if needed. The defaults work out of the box for local development:

```env
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=taskactivitydevelopment
JWT_EXPIRES_IN=30d
COOKIE_NAME=task_activity_session

# Postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=task_activity
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/task_activity"

# Redis
REDIS_URL="redis://redis:6379"
```

---

## 3. Start the containers

```bash
make dev
```

This builds the backend image and starts three containers:
- **backend** — Node.js API on port `3000`
- **postgres** — PostgreSQL on port `5432`
- **redis** — Redis on port `6379`

---

## 4. Run migrations and seed

On first run, apply the database schema and create the test user:

```bash
make setup
```

This runs migrations then seeds a default user:

| Field    | Value              |
|----------|--------------------|
| Email    | test@example.com   |
| Password | password           |

If the seed user already exists it will say so and skip safely.

---

## 5. Verify it's running

```bash
curl http://localhost:3000/api/v1/healthcheck
```

Expected response:
```
task-activity Server is up and running!
```

---

## Available commands

| Command | Description |
|---|---|
| `make dev` | Build and start all containers in the background |
| `make dev-drop` | Stop and remove all containers |
| `make dev-logs` | Tail live logs from the backend container |
| `make setup` | Run migrations + seed (use on first run or new machine) |
| `make migrate` | Apply all pending migrations |
| `make migrate-create name=<name>` | Create a new migration from schema changes |
| `make seed` | Seed the test user (safe to run multiple times) |
| `make generate` | Regenerate the Prisma client |

---

## Workflow on a new machine

```bash
git clone <repo-url>
cd task-activity-system
npm install
cp .env.example .env
make dev
make setup
```

That's it. The server is ready at `http://localhost:3000`.
