# AI Usage

This project was built with Claude (Anthropic) as a development assistant.

---

## How I used it

I drove all architectural decisions and used Claude to execute them. The workflow was closer to delegation than collaboration — I would decide what the system needed to do and why, then hand off the implementation.

Examples of this:

- **Multi-instance socket delivery** — I identified that a `userId → socketId` Map would break across multiple server instances and directed Claude to solve it using the Redis adapter with user rooms. Claude implemented it; the architectural reasoning was mine.
- **Pub/sub separation** — I decided that task mutations should publish to Redis rather than emit directly to sockets, keeping HTTP and socket entry points decoupled. Claude built the `PubSubManager`, subscription layer, and wired it up.
- **Layered architecture** — I defined the layer boundaries (deliverymen, handlers, usecases, repositories) and enforced them throughout. Claude generated code within those constraints.

---

## What it helped with

- Boilerplate and scaffolding — base repository pattern, socket event abstractions, subscription registry
- Environment setup — Docker Compose, Makefile, multi-stage production Dockerfile
- Configuration — Prisma v7 driver adapter setup, Redis adapter for Socket.IO, cookie-based JWT auth
- Documentation — README, API reference, getting started guide

---

## Examples of What I had to correct or improve

- **Export pattern** — Claude defaulted to exporting instances (`export default new ClassName()`). I corrected this to exporting classes and instantiating at the call site, which is the right pattern for testability and clarity.
- **Socket manager design** — The initial implementation didn't use Maps or a singleton. I directed a full redesign.
- **File naming** — Enforced the `.delivery.ts` suffix convention for routing files.
- **Documentation scope** — Trimmed the README down to what matters: setup, design decisions, trade-offs. Removed filler content Claude added by default.
- **Production environment** — Identified that Render's free Redis wouldn't support persistent pub/sub connections and directed the switch to Redis Cloud.

---

## Summary

Claude handled execution. I handled judgment — what to build, how it should scale, where the boundaries should be, and what to push back on.