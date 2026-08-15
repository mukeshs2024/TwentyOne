import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">
            Enter your email to sign in to TwentyOne.
          </p>
        </div>

        <LoginForm initialMessage={message} />

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-orange-600 hover:text-orange-500 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
