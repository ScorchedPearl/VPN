import { isPublicAddress } from "@/utils/fingerprint";

export const dynamic = "force-dynamic";

function firstAddress(value: string | null): string {
  if (!value) return "Unknown";
  return value.split(",")[0]?.trim().replace(/^\[|\]$/g, "") || "Unknown";
}

export async function GET(request: Request) {
  const headers = request.headers;
  const candidates: Array<[string, string | null]> = [
    ["cf-connecting-ip", headers.get("cf-connecting-ip")],
    ["x-vercel-forwarded-for", headers.get("x-vercel-forwarded-for")],
    ["x-real-ip", headers.get("x-real-ip")],
    ["x-forwarded-for", headers.get("x-forwarded-for")],
  ];
  const selected = candidates.find(([, value]) => Boolean(value));
  const ip = firstAddress(selected?.[1] ?? null);

  return Response.json({
    ip,
    isPublicIp: isPublicAddress(ip),
    source: selected?.[0] ?? "not-available-in-local-development",
    headers: {
      "user-agent": headers.get("user-agent") || "Unknown",
      "accept-language": headers.get("accept-language") || "Unknown",
      "sec-ch-ua": headers.get("sec-ch-ua") || "Unknown",
      "sec-ch-ua-mobile": headers.get("sec-ch-ua-mobile") || "Unknown",
      "sec-ch-ua-platform": headers.get("sec-ch-ua-platform") || "Unknown",
    },
    trustNotice: "Forwarded IP headers are trustworthy only when a configured ingress proxy overwrites client-supplied values.",
  });
}
