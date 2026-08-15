"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
         <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        We encountered an error while trying to load this page. Please try again.
      </p>
      <Button 
         onClick={() => reset()}
         className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 font-bold"
      >
        Try again
      </Button>
    </div>
  );
}
