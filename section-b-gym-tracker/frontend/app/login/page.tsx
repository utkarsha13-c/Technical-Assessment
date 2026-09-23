"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid email or password.");
        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Go to dashboard after successful login
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">

      {/* LEFT SIDE */}
      <section className="relative hidden overflow-hidden border-r border-[#252c28] p-14 lg:flex lg:flex-col lg:justify-between">

        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#a3ff12]/10 blur-[100px]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#a3ff12] text-xl font-black text-black">
            R
          </div>

          <span className="text-xl font-black tracking-wider">
            REPTRACK
          </span>
        </div>

        {/* Hero */}
        <div className="relative max-w-xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.35em] text-[#a3ff12]">
            Train · Track · Improve
          </p>

          <h1 className="text-6xl font-black leading-[1.05] tracking-tight">
            Your progress.
            <br />

            <span className="text-[#a3ff12]">
              Measured.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-[#8b9690]">
            Log every workout, track every set and turn your training
            into measurable progress.
          </p>

          <div className="mt-10 flex gap-8">

            <div>
              <p className="text-2xl font-black text-white">01</p>
              <p className="mt-1 text-sm text-[#8b9690]">
                Log workouts
              </p>
            </div>

            <div>
              <p className="text-2xl font-black text-white">02</p>
              <p className="mt-1 text-sm text-[#8b9690]">
                Track strength
              </p>
            </div>

            <div>
              <p className="text-2xl font-black text-white">03</p>
              <p className="mt-1 text-sm text-[#8b9690]">
                Beat your best
              </p>
            </div>

          </div>
        </div>

        <p className="relative text-sm text-[#667069]">
          Built for consistent progress.
        </p>

      </section>

      {/* RIGHT SIDE */}
      <section className="flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a3ff12] font-black text-black">
              R
            </div>

            <span className="font-black tracking-wider">
              REPTRACK
            </span>
          </div>

          <p className="text-sm font-bold tracking-[0.2em] text-[#a3ff12]">
            WELCOME BACK
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight">
            Ready to train?
          </h2>

          <p className="mt-3 text-[#8b9690]">
            Sign in to continue tracking your progress.
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-9 space-y-5"
          >

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#c9d0cc]">
                Email address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#252c28] bg-[#111513] px-4 py-3.5 text-white outline-none placeholder:text-[#555e59] focus:border-[#a3ff12]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#c9d0cc]">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-[#252c28] bg-[#111513] px-4 py-3.5 text-white outline-none placeholder:text-[#555e59] focus:border-[#a3ff12]"
              />
            </div>

            {/* Error */}
            {message && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {message}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#a3ff12] px-5 py-3.5 font-black text-black hover:bg-[#b5ff3d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "SIGNING IN..." : "SIGN IN →"}
            </button>

          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#252c28]" />
            <span className="text-xs text-[#667069]">
              NEW HERE?
            </span>
            <div className="h-px flex-1 bg-[#252c28]" />
          </div>

          <Link
            href="/register"
            className="block w-full rounded-xl border border-[#303833] px-5 py-3.5 text-center font-semibold text-white hover:border-[#a3ff12]/60 hover:bg-[#111513]"
          >
            Create an account
          </Link>

        </div>
      </section>

    </main>
  );
}