up:
	docker compose up --build -d

down:
	docker compose down

clean:
	docker compose down -v --remove-orphans

logs:
	docker compose logs -f

dev:
	corepack pnpm dev

build:
	corepack pnpm build

lint:
	corepack pnpm lint

typecheck:
	corepack pnpm typecheck

test:
	corepack pnpm test

migrate:
	corepack pnpm db:migrate

seed:
	corepack pnpm db:seed
