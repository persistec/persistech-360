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

## 5. Instance Hours and Free Tier

Render Free/Hobby services are allowed to spin down after inactivity.
The project does not use scheduled keep-alive pings to keep Render free services awake.
For demos, run the manual Render wake check workflow shortly before testing.
For production or 24/7 availability, upgrade the Render API service to a paid instance.

## 6. Next Steps for Production

Before considering this service fully production-ready for public internet access, the following must be implemented:
- Full integration with Google Workspace or an Identity Provider.
- Removal of the `x-user-id` bridging logic.
- Potential adjustment of `CORS` rules depending on final domain architecture.
