import Link from "next/link";
import ObservationsDashboard from "./observations-dashboard";
import { recentObservations } from "@/utils/research-store";

export const dynamic = "force-dynamic";

export default async function ObservationsPage() {
  let observations;
  try {
    observations = await recentObservations(1000);
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-6 text-slate-100">
        <div className="max-w-lg rounded-2xl border border-rose-400/20 bg-rose-400/5 p-8 text-center">
          <h1 className="text-2xl font-black text-white">Research database unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Check the server-side DATABASE_URL and Supabase network availability, then reload this page.</p>
          <Link href="/" className="mt-6 inline-flex rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-white">Return to scanner</Link>
        </div>
      </main>
    );
  }

  return <ObservationsDashboard initialObservations={observations} />;
}
