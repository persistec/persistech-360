# Frontend Environment Configuration

The `apps/web` application requires the following environment variables to run locally and in production/staging environments.

## Required Variables

### `NEXT_PUBLIC_API_BASE_URL`
The base URL for the Persistech 360 API. 
- **Local:** `http://localhost:4000/api/v1`
- **Render Staging:** `https://persistech-360-api.onrender.com/api/v1`

*Note: Make sure to include `/api/v1` at the end of the URL. The API client uses this base URL and appends the resource paths (e.g., `/departments`).*

### `NEXT_PUBLIC_ADMIN_USER_ID`
> [!WARNING]
> This is a temporary mechanism for the MVP to authenticate API requests via the `x-user-id` header.
> This value is exposed in the browser bundle and is **not secure for production use**. 
> Treat the deployed frontend/API as a private staging environment until a proper authentication provider (like Google Workspace + JWT) is integrated.

Provide a valid user UUID from your database that has the `app_role` set to `ADMIN`.

## Setup

1. Copy `.env.example` to `.env.local` inside the `apps/web` directory.
2. Update the values accordingly.
3. Run `npm run dev` to start the frontend.
