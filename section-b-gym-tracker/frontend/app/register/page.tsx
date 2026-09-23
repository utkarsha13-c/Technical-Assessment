"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      router.push("/login");
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

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#a3ff12] text-xl font-black text-black">
            R
          </div>

          <span className="text-xl font-black tracking-wider">
            REPTRACK
          </span>
        </div>

        <div className="relative max-w-xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.35em] text-[#a3ff12]">
            Start · Train · Progress
          </p>

          <h1 className="text-6xl font-black leading-[1.05] tracking-tight">
            Build strength.
            <br />
            <span className="text-[#a3ff12]">
              Track everything.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-[#8b9690]">
            Create your account and start turning every workout into
            measurable progress.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">

            <div>
              <p className="text-2xl font-black">01</p>
              <p className="mt-1 text-sm text-[#8b9690]">
                Create exercises
              </p>
            </div>

            <div>
              <p className="text-2xl font-black">02</p>
              <p className="mt-1 text-sm text-[#8b9690]">
                Log your sets
              </p>
            </div>

            <div>
              <p className="text-2xl font-black">03</p>
              <p className="mt-1 text-sm text-[#8b9690]">
                See progress
              </p>
            </div>

          </div>
        </div>

        <p className="relative text-sm text-[#667069]">
          Your training. Your data. Your progress.
        </p>

      </section>

      {/* RIGHT SIDE */}
      <section className="flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          <p className="text-sm font-bold tracking-[0.2em] text-[#a3ff12]">
            GET STARTED
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight">
            Create your account.
          </h2>

          <p className="mt-3 text-[#8b9690]">
            Start tracking your workouts today.
          </p>

          <form
            onSubmit={handleRegister}
            className="mt-9 space-y-5"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-[#c9d0cc]">
                Full name
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                className="w-full rounded-xl border border-[#252c28] bg-[#111513] px-4 py-3.5 text-white outline-none placeholder:text-[#555e59] focus:border-[#a3ff12]"
              />
            </div>

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
                autoComplete="email"
                className="w-full rounded-xl border border-[#252c28] bg-[#111513] px-4 py-3.5 text-white outline-none placeholder:text-[#555e59] focus:border-[#a3ff12]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#c9d0cc]">
                Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#252c28] bg-[#111513] px-4 py-3.5 text-white outline-none placeholder:text-[#555e59] focus:border-[#a3ff12]"
              />
            </div>

            {message && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#a3ff12] px-5 py-3.5 font-black text-black hover:bg-[#b5ff3d] disabled:opacity-60"
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
            </button>

          </form>

          <p className="mt-7 text-center text-sm text-[#8b9690]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#a3ff12] hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>

      </section>

    </main>
  );
}