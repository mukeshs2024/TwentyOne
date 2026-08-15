import { getActiveChallenge } from "./actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChallengeClient } from "./ChallengeClient";

export default async function ChallengesPage() {
  const activeChallenge = await getActiveChallenge();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <header>
        <Link href="/today" className="text-slate-500 hover:text-slate-900 inline-flex items-center text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        {!activeChallenge && (
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">21-Day Challenges</h1>
            <p className="text-slate-500 mt-1">Transform your habits in 21 days.</p>
          </div>
        )}
      </header>

      <ChallengeClient activeChallenge={activeChallenge} />

    </div>
  );
}
