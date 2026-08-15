import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function Register({
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
            Join TwentyOne
          </h1>
          <p className="text-sm text-slate-500">
            Create an account to start your execution journey.
          </p>
        </div>

        <RegisterForm initialMessage={message} />

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-orange-600 hover:text-orange-500 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
