.PHONY: dev dev-drop dev-logs prod prod-drop prod-logs migrate migrate-create generate seed setup

dev:
	@echo "[dev]: Starting containers..."
	@docker compose up --build -d
	@echo "[dev]: All containers up"

dev-drop:
	@echo "[dev]: Stopping containers..."
	@docker compose down
	@echo "[dev]: All containers stopped"

dev-logs:
	@docker compose logs -f backend

prod:
	@echo "[prod]: Building and starting production container..."
	@docker compose -f docker-compose.prod.yml up --build -d
	@echo "[prod]: Container up — connecting to external Postgres and Redis"

prod-drop:
	@echo "[prod]: Stopping production container..."
	@docker compose -f docker-compose.prod.yml down
	@echo "[prod]: Done"

prod-logs:
	@docker compose -f docker-compose.prod.yml logs -f backend

migrate:
	@echo "[migrate]: Applying migrations..."
	@docker compose exec backend npx prisma migrate deploy
	@echo "[migrate]: Done"

migrate-create:
	@echo "[migrate]: Creating migration $(name)..."
	@docker compose exec backend npx prisma migrate dev --name $(name)
	@echo "[migrate]: Done"

generate:
	@echo "[prisma]: Generating client..."
	@docker compose exec backend npx prisma generate
	@echo "[prisma]: Done"

seed:
	@echo "[seed]: Running seed..."
	@docker compose exec backend npx ts-node -r tsconfig-paths/register prisma/seed.ts
	@echo "[seed]: Done"

setup: migrate seed
