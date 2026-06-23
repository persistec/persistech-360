import { NextResponse } from "next/server";

const MAX_UPSTREAM_BODY_LENGTH = 500;

const getHealthUrl = () => process.env.RENDER_API_HEALTH_URL?.trim();

const isAllowedCaller = (request: Request) => {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const userAgent = request.headers.get("user-agent") || "";
  return userAgent.includes("vercel-cron/1.0");
};

const readSmallBody = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  return text.length > MAX_UPSTREAM_BODY_LENGTH
    ? `${text.slice(0, MAX_UPSTREAM_BODY_LENGTH)}...`
    : text;
};

export async function GET(request: Request) {
  if (!isAllowedCaller(request)) {
    return NextResponse.json(
      {
        ok: false,
        status: 403,
        checkedAt: new Date().toISOString(),
        error: "Forbidden",
      },
      { status: 403 },
    );
  }

  const checkedAt = new Date().toISOString();
  const healthUrl = getHealthUrl();

  if (!healthUrl) {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        checkedAt,
        error: "Missing RENDER_API_HEALTH_URL",
      },
      { status: 500 },
    );
  }

  const startedAt = Date.now();

  try {
    const response = await fetch(healthUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "persistech-360-keepalive/1.0",
      },
      signal: AbortSignal.timeout(10_000),
    });
    const durationMs = Date.now() - startedAt;
    const body = await readSmallBody(response);

    return NextResponse.json(
      {
        ok: response.ok,
        status: response.status,
        checkedAt,
        durationMs,
        ...(body ? { upstreamBody: body } : {}),
      },
      { status: response.ok ? 200 : 502 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 0,
        checkedAt,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : "Render health check failed",
      },
      { status: 502 },
    );
  }
}
