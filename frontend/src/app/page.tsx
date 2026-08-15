import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-6xl font-bold tracking-tight text-slate-900">
          TwentyOne.
        </h1>
        <p className="text-2xl font-medium text-slate-800">
          Plan. Execute. Learn. Improve.
        </p>
        <p className="text-lg text-slate-600 pt-2 pb-6">
          A personal execution, learning, productivity, and self-improvement system. 
          Stop tracking to-dos. Start tracking execution.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register">
            <Button className="px-8 py-6 text-lg bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl">
              Start Your Journey
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="px-8 py-6 text-lg border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
