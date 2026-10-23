import { createHash } from "node:crypto";
import { MAX_PASSWORD_LENGTH, verifyPassword } from "@/utils/password";
import { archiveActiveObservations, registerAuthAttempt, resetAuthThrottle } from "@/utils/research-store";
import { canonicalClientAddress } from "@/utils/server-network";
import { CLIENT_LIMITS, GLOBAL_LIMITS } from "@/utils/throttle-policy";

export const dynamic = "force-dynamic";

/** Every failed or refused request takes at least this long to answer. */
const MIN_FAILURE_MS = 1_200;

/**
 * Moves all active scans into the archive so new scans start a fresh
 * comparison set. Protected by an scrypt-hashed password plus persistent
 * per-client and global attempt limits.
 */
export async function POST(request: Request) {
  const started = Date.now();
  const fail = async (status: number, error: string, headers: Record<string, string> = {}, extra: Record<string, unknown> = {}) => {
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, MIN_FAILURE_MS - (Date.now() - started))));
    return Response.json({ error, ...extra }, { status, headers: { "cache-control": "no-store", ...headers } });
  };

  const storedHash = process.env.ARCHIVE_PASSWORD_HASH;
  if (!storedHash) return fail(503, "Archiving is disabled until ARCHIVE_PASSWORD_HASH is configured on the server.");
  if (!isSameOrigin(request)) return fail(403, "Request refused.");
  if (Number(request.headers.get("content-length") || "0") > 2_000) return fail(413, "Request refused.");
  if (!(request.headers.get("content-type") || "").includes("application/json")) return fail(415, "Request refused.");

  let password = "";
  try {
    const body = await request.json() as { password?: unknown; confirm?: unknown };
    if (body.confirm !== true || typeof body.password !== "string") return fail(400, "Request refused.");
    password = body.password;
  } catch {
    return fail(400, "Request refused.");
  }
  if (!password || password.length > MAX_PASSWORD_LENGTH) return fail(401, "Incorrect password.");

  // Only the configured ingress header is trusted for the client address;
  // without it every caller shares one bucket, which errs on the safe side.
  const client = canonicalClientAddress(request.headers);
  const clientKey = `archive:client:${createHash("sha256").update(client.trusted ? client.ip : "untrusted").digest("hex").slice(0, 32)}`;

  try {
    const gate = await registerAuthAttempt([
      { key: clientKey, limits: CLIENT_LIMITS },
      { key: "archive:global", limits: GLOBAL_LIMITS },
    ]);
    if (!gate.allowed) {
      const retryAfterSeconds = Math.ceil(gate.retryAfterMs / 1000);
      return fail(429, "Too many attempts. Archiving is locked for now.", { "retry-after": String(retryAfterSeconds) }, { retryAfterSeconds });
    }
    if (!(await verifyPassword(password, storedHash))) {
      console.warn("[archive] rejected password attempt");
      return fail(401, "Incorrect password.");
    }
    await resetAuthThrottle(clientKey);
    const result = await archiveActiveObservations();
    console.info(`[archive] moved ${result.archived} scans to batch ${result.batchId}`);
    return Response.json(result, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[archive] failed", error instanceof Error ? error.message : error);
    return fail(503, "The archive could not be completed. No scans were moved.");
  }
}

/** Blocks cross-site form posts and scripted requests from other origins. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
