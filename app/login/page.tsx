
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Atom, Eye, EyeOff, LoaderCircle, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");
  setLoading(true);

  try {
    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    window.location.href = "/dashboard";
  } catch {
    setError("Unable to log in. Please try again.");
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080D1B] px-5 py-12 text-slate-100">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-sky-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-violet-500/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="rounded-3xl border border-white/10 bg-[#10182B] p-7 shadow-2xl sm:p-9">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400 text-slate-950">
              <Atom size={27} />
            </div>
            <div>
              <p className="text-2xl font-black">
                Calph<span className="text-sky-400">++</span>
              </p>
              <p className="text-xs text-slate-500">Physics, made interactive</p>
            </div>
          </Link>

          <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Log in to continue your Physics learning journey.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#0B1222] px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1222] px-4 py-3 pr-12 text-sm outline-none focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-400 px-4 py-3.5 font-bold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60"
            >
              {loading && <LoaderCircle className="animate-spin" size={18} />}
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-sky-300 hover:text-sky-200">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
