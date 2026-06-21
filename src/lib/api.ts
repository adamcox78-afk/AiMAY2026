/**
 * Shared API utilities for the route handlers.
 *
 * Centralizes JSON responses, Ruflo webhook auth, and zod-based body validation
 * so every endpoint validates input at the boundary (per project rules).
 */

import { z } from "zod";

export function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
}

export function apiOk(payload: Record<string, unknown>): Response {
  return json({ ok: true, ...payload });
}

export function apiError(message: string, status = 400): Response {
  return json({ ok: false, error: message }, { status });
}

/**
 * Guard for /api/ruflo/* endpoints. Returns a 401 Response when the shared
 * secret is configured and the caller doesn't present it. In local dev (no
 * secret set) it allows the call so the endpoints are easy to exercise.
 */
export function rufloGuard(req: Request): Response | null {
  const expected = process.env.RUFLO_WEBHOOK_SECRET;
  if (!expected) return null; // dev mode — open
  const got = req.headers.get("x-ruflo-secret");
  if (got !== expected) return apiError("Unauthorized: invalid Ruflo secret", 401);
  return null;
}

/** Parse + validate a JSON body. Returns data or a 400 Response. */
export async function parseBody<T>(
  req: Request,
  schema: z.ZodType<T>
): Promise<{ data: T } | { error: Response }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { error: apiError(`Invalid request: ${result.error.issues[0]?.message ?? "bad body"}`) };
  }
  return { data: result.data };
}

export const symbolSchema = z
  .string()
  .trim()
  .min(1)
  .max(12)
  .regex(/^[A-Za-z0-9.\-]+$/, "symbol must be alphanumeric");

export const timeframeSchema = z.enum(["15m", "1H", "4H", "1D", "1W"]);
