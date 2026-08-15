import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 items-center justify-center">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Loading your day...</p>
    </div>
  );
}
