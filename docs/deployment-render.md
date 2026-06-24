# Deployment Guide: Render (Backend MVP)

This guide provides instructions for deploying the Persistech 360 backend API to Render as a Web Service using Docker. 

> [!WARNING]
> **Authentication Status:** The MVP currently uses a temporary `x-user-id` header mechanism for authentication. This must NOT be used as a public API without further securing it with robust authentication (e.g., Google Workspace SSO and JWTs). Treat this deployment as an internal staging environment.

## 1. Render Service Configuration

When creating a new "Web Service" in Render, connect your Git repository and apply the following settings:

- **Name:** `persistech-360-api` (or preferred name)
- **Environment:** `Docker`
- **Branch:** `main` (or the branch you are deploying from)
- **Root Directory:** `apps/api`
- **Dockerfile Path:** `./Dockerfile`
- **Instance Type:** "Starter" or "Standard" is recommended for staging given that Prisma generation and Node.js typescript compilation occur during the Docker build process.

## 2. Environment Variables

Define the following environment variables in your Render Web Service dashboard:

- `NODE_ENV`: `production`
- `DATABASE_URL`: Provide the connection string to your Render Managed PostgreSQL instance.
- `CORS_ALLOWED_ORIGINS`: Explicit origins allowed to call the API (e.g., `https://persistech-360.vercel.app`). For local development against remote API, append `,http://localhost:3000`. Note: Vercel preview environments (`https://*.vercel.app`) are automatically permitted by a safe regex.
- `WEB_APP_URL`: (Optional) Fallback backwards compatibility for frontend URL.
- `PORT`: *Automatically managed by Render (defaults to 10000, no need to manually set).*

> [!IMPORTANT]
> Keep `DATABASE_URL` secure and never commit it to source control. Use Render's Environment Groups or Secrets functionality.

## 3. Database Setup & Migrations

The API relies on a managed PostgreSQL database. 

1. Create a "PostgreSQL" service on Render.
2. Copy the "Internal Database URL" provided by Render and paste it as the `DATABASE_URL` environment variable for your API Web Service.
3. **Migrations:** The `Dockerfile` is configured with `CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]`. This guarantees that your database schema will automatically migrate before the Node.js application boots, eliminating the need for manual migration commands.

## 4. Health Check & Validation

Once deployed, Render will start routing traffic to your instance. 

- **Health Endpoint:** You can verify the API is running by navigating to `https://<YOUR_RENDER_URL>/api/v1/health` (should return `UP`).
- **Swagger Documentation:** Available at `https://<YOUR_RENDER_URL>/docs`.

## 5. Next Steps for Production

Before considering this service fully production-ready for public internet access, the following must be implemented:
- Full integration with Google Workspace or an Identity Provider.
- Removal of the `x-user-id` bridging logic.
- Potential adjustment of `CORS` rules depending on final domain architecture.

## 6. Free Tier Sleep Behavior

Os serviços Free/Hobby da Render podem entrar em repouso após um período de inactividade.
O projecto não usa pings agendados para manter serviços gratuitos da Render sempre activos.
Para demonstrações, execute manualmente o workflow "Manual Render Wake Check" pouco antes dos testes.
Para produção ou disponibilidade 24/7, actualize o serviço da API na Render para uma instância paga.
