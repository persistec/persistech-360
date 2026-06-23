import { NextResponse } from "next/server";

const MAX_UPSTREAM_BODY_LENGTH = 500;

const getHealthUrl = () => process.env.RENDER_API_HEALTH_URL?.trim();
const getScheduledTaskSecret = () => process.env.SCHEDULED_TASK_SECRET?.trim();

const isAllowedCaller = (request: Request) => {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const secret = getScheduledTaskSecret();
  if (!secret) {
    return false;
  }

  const authorization = request.headers.get("authorization") || "";
  return authorization === `Bearer ${secret}`;
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

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const FETCH_TIMEOUT_MS = 10000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  if (process.env.NODE_ENV === "production" && !getScheduledTaskSecret()) {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        checkedAt,
        error: "Missing SCHEDULED_TASK_SECRET",
      },
      { status: 500 },
    );
  }

  const startedAt = Date.now();
  let lastStatus = 0;
  let lastBody: string | undefined;
  let lastErrorMsg = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(healthUrl, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent": "persistech-360-keepalive/1.0",
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      lastStatus = response.status;
      lastBody = await readSmallBody(response);

      if (response.ok) {
        return NextResponse.json(
          {
            ok: true,
            target: "render-api",
            status: 200,
            checkedAt,
            durationMs: Date.now() - startedAt,
            ...(lastBody ? { upstreamBody: lastBody } : {}),
          },
          { status: 200 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          {
            ok: false,
            error: "Render API health check failed (404 Not Found)",
            status: 502,
            checkedAt,
            durationMs: Date.now() - startedAt,
          },
          { status: 502 }
        );
      }

      lastErrorMsg = `Upstream returned ${response.status}`;
    } catch (error) {
      lastErrorMsg = error instanceof Error ? error.message : "Fetch failed";
      lastStatus = 0;
    }

    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAY_MS);
    }
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Render API health check failed",
      status: 502,
      checkedAt,
      durationMs: Date.now() - startedAt,
      lastErrorMsg,
      lastStatus
    },
    { status: 502 }
  );
}
