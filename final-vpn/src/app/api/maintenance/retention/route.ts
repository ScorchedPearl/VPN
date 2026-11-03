import { timingSafeEqual } from "node:crypto";
import { deleteObservationsOlderThan } from "@/utils/research-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = process.env.MAINTENANCE_TOKEN || "";
  const supplied = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!expected || !safeEqual(expected, supplied)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const retentionDays = Number(process.env.RAW_OBSERVATION_RETENTION_DAYS || "30");
  const deleted = await deleteObservationsOlderThan(Number.isFinite(retentionDays) ? retentionDays : 30);
  return Response.json({ deleted, retentionDays });
}

function safeEqual(expected: string, supplied: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}
