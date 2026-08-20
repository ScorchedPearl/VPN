import type { ResearchObservation } from "@/utils/fingerprint";
import {
  observationCount,
  recentObservations,
  saveObservation,
} from "@/utils/research-store";
import { compareObservations } from "@/utils/similarity";

export const dynamic = "force-dynamic";

function isObservation(value: unknown): value is ResearchObservation {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ResearchObservation>;
  return Boolean(
    typeof candidate.deviceLabel === "string" &&
    candidate.deviceLabel.trim().length > 0 &&
    candidate.deviceLabel.length <= 60 &&
    ["normal", "private", "unknown"].includes(candidate.browserMode || "") &&
    ["off", "on", "unknown"].includes(candidate.vpnGroundTruth || "") &&
    candidate.fingerprint &&
    candidate.fingerprint.schemaVersion === "2.0.0" &&
    typeof candidate.effectivePublicIp === "string" &&
    typeof candidate.serverSeenIp === "string",
  );
}

export async function GET() {
  try {
    return Response.json({ count: await observationCount(), backend: "postgresql" });
  } catch {
    return Response.json({ error: "Research database is unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    if (!isObservation(payload)) {
      return Response.json({ error: "Invalid research observation" }, { status: 400 });
    }

    const observation: ResearchObservation = {
      ...payload,
      deviceLabel: payload.deviceLabel.trim(),
      observationId: crypto.randomUUID(),
    };
    const previousObservations = await recentObservations(200);
    const matches = previousObservations
      .map((previous) => compareObservations(observation, previous))
      .sort((a, b) => b.deviceSimilarity.score - a.deviceSimilarity.score)
      .slice(0, 5);

    await saveObservation(observation);
    const count = await observationCount();
    return Response.json({ observation, matches, count, backend: "postgresql" });
  } catch {
    return Response.json({ error: "Could not store the research observation" }, { status: 503 });
  }
}
