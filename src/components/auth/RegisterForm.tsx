"use client";

import { useState, useTransition } from "react";
import { register } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export function RegisterForm({ initialMessage }: { initialMessage?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialMessage || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await register(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <form className="space-y-5 mt-6" onSubmit={handleSubmit} suppressHydrationWarning>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-900">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail className="w-5 h-5 text-slate-400" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-orange-500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-900">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Create a strong password"
            className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-orange-500"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full h-12 text-base font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors">
        {isPending ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
