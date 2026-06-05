# Environment and networking

This repository now uses Docker Compose for local development with three independent services:

- `postgres` — PostgreSQL database
- `api` — NestJS API
- `web` — Next.js frontend

## Host and container networking

Use the following addresses depending on where the process runs:

- Host to PostgreSQL: `postgresql://postgres:postgres@localhost:5433/persistech_360`
- API container to PostgreSQL: `postgresql://postgres:postgres@postgres:5432/persistech_360`
- Browser to API: `http://localhost:4000`
- Browser to web app: `http://localhost:3000`

Important rules:

1. `localhost:5433` is for tools running on the host machine.
2. `postgres:5432` is the Compose service name the API container must use.
3. Do not replace service names with container IP addresses.
4. Do not use `localhost:5433` from inside the API container.
5. Do not run the database, API and web app in one container.
6. The Compose override for the API database URL must remain `postgres:5432`.

## Docker Compose services

The local Compose stack must keep these services independent:

- `postgres`, based on `postgres:15-alpine`, exposes `5433:5432`.
- `api`, built from `apps/api`, exposes `4000:4000`.
- `web`, built from `apps/web`, exposes `3000:3000`.

The API service depends on a healthy `postgres` service. The web service depends on the API service. Code is mounted into each app container for local development, while container `node_modules` are kept separate from host `node_modules`.
