import { pollAtlasCheck, startAtlasCheck, normalizeIp, rateLimited } from "@/utils/ip-intel-service";
import { scoreIpIntel } from "@/utils/ip-intel";
import { isPublicIp } from "@/utils/server-network";

export const dynamic = "force-dynamic";

function validIp(value: unknown): string | null {
  const ip = normalizeIp(typeof value === "string" ? value : null);
  return ip && isPublicIp(ip) ? ip : null;
}

/** Starts a RIPE Atlas geolocation check. Costs credits, so it is capped per day. */
export async function POST(request: Request) {
  if (rateLimited(request)) return Response.json({ error: "Too many requests. Wait a minute." }, { status: 429 });
  const body = (await request.json().catch(() => null)) as { ip?: unknown; force?: unknown } | null;
  const ip = validIp(body?.ip);
  if (!ip) return Response.json({ error: "A public IP address is required." }, { status: 400 });
  const result = await startAtlasCheck(ip, body?.force === true);
  return Response.json(result, { status: result.started ? 202 : 200, headers: { "cache-control": "no-store" } });
}

/** Polls a running check; the final verdict is computed when enough probes have answered. */
export async function GET(request: Request) {
  const ip = validIp(new URL(request.url).searchParams.get("ip"));
  if (!ip) return Response.json({ error: "A public IP address is required." }, { status: 400 });
  const intel = await pollAtlasCheck(ip);
  if (!intel) return Response.json({ error: "Invalid IP address." }, { status: 400 });
  return Response.json({ intel, verdict: scoreIpIntel(intel, Number(process.env.VPN_RISK_PRIOR) || 0.05) }, { headers: { "cache-control": "no-store" } });
}
