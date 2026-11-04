import { integrationStatus, lookupIpIntel, normalizeIp, rateLimited, resolveMyIp } from "@/utils/ip-intel-service";
import { scoreIpIntel } from "@/utils/ip-intel";
import { isPublicIp } from "@/utils/server-network";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (rateLimited(request)) return Response.json({ error: "Too many lookups. Wait a minute." }, { status: 429 });
  const requested = new URL(request.url).searchParams.get("ip")?.trim() || "";
  const ip = requested === "" || requested === "me" ? await resolveMyIp(request) : normalizeIp(requested);
  if (!ip) return Response.json({ error: requested && requested !== "me" ? "That is not a valid IP address." : "Could not reach IPinfo to find your public IP address (network hiccup, VPN switching, or the IPinfo quota). Try again in a moment, or type the IP in." }, { status: 400 });
  if (!isPublicIp(ip)) return Response.json({ error: "Only public IP addresses can be checked (this one is private or reserved)." }, { status: 400 });
  const intel = await lookupIpIntel(ip);
  if (!intel) return Response.json({ error: "Invalid IP address." }, { status: 400 });
  return Response.json({ intel, verdict: scoreIpIntel(intel, Number(process.env.VPN_RISK_PRIOR) || 0.05), integrations: integrationStatus() }, { headers: { "cache-control": "no-store" } });
}
