"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type DashboardData = {
  total_workouts: number;
  total_exercises: number;
  total_volume: number;
  workouts_this_week: number;
};

type StreakData = {
  current_streak: number;
  longest_streak: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [dashboardResponse, streakResponse] = await Promise.all([
          fetch("http://localhost:5000/api/dashboard", { headers }),
          fetch("http://localhost:5000/api/streak", { headers }),
        ]);

        if (
          dashboardResponse.status === 401 ||
          streakResponse.status === 401
        ) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const dashboardData = await dashboardResponse.json();
        const streakData = await streakResponse.json();

        setDashboard(dashboardData);
        setStreak(streakData);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b0a]">
        <p className="font-bold text-[#a3ff12]">
          LOADING REPTRACK...
        </p>
      </main>
    );
  }

  const cards = [
    {
      title: "TOTAL WORKOUTS",
      value: dashboard?.total_workouts ?? 0,
      subtitle: "All time",
    },
    {
      title: "EXERCISES PERFORMED",
      value: dashboard?.total_exercises ?? 0,
      subtitle: "Across workouts",
    },
    {
      title: "TOTAL VOLUME",
      value: `${Number(dashboard?.total_volume ?? 0).toLocaleString()} kg`,
      subtitle: "Weight × reps",
    },
    {
      title: "THIS WEEK",
      value: dashboard?.workouts_this_week ?? 0,
      subtitle: "Workouts completed",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080b0a] text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b border-[#252c28] px-6 py-5 lg:px-10">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a3ff12] font-black text-black">
            R
          </div>

          <span className="text-xl font-black tracking-wider">
            REPTRACK
          </span>
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-[#303833] px-4 py-2 text-sm font-semibold text-[#aeb8b2] hover:border-[#a3ff12] hover:text-white"
        >
          Logout
        </button>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-[#a3ff12]">
              PERFORMANCE OVERVIEW
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Your Dashboard
            </h1>

            <p className="mt-2 text-[#8b9690]">
              Keep showing up. The numbers will follow.
            </p>
          </div>

          <Link
            href="/workouts"
            className="rounded-xl bg-[#a3ff12] px-6 py-3 font-black text-black hover:bg-[#b5ff3d]"
          >
            + START WORKOUT
          </Link>

        </div>

        {/* STATS */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#252c28] bg-[#111513] p-6"
            >
              <p className="text-xs font-bold tracking-[0.15em] text-[#77827c]">
                {card.title}
              </p>

              <p className="mt-5 text-4xl font-black">
                {card.value}
              </p>

              <p className="mt-2 text-sm text-[#68736d]">
                {card.subtitle}
              </p>
            </div>
          ))}

        </section>

        {/* STREAK */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">

          <div className="relative overflow-hidden rounded-2xl border border-[#a3ff12]/20 bg-[#111513] p-7">

            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#a3ff12]/10 blur-3xl" />

            <p className="text-xs font-bold tracking-[0.2em] text-[#a3ff12]">
              CURRENT STREAK
            </p>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-6xl font-black">
                {streak?.current_streak ?? 0}
              </span>

              <span className="mb-2 text-[#8b9690]">
                days
              </span>
            </div>

            <p className="mt-4 text-sm text-[#8b9690]">
              Keep the momentum going.
            </p>
          </div>

          <div className="rounded-2xl border border-[#252c28] bg-[#111513] p-7">

            <p className="text-xs font-bold tracking-[0.2em] text-[#8b9690]">
              LONGEST STREAK
            </p>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-6xl font-black">
                {streak?.longest_streak ?? 0}
              </span>

              <span className="mb-2 text-[#8b9690]">
                days
              </span>
            </div>

            <p className="mt-4 text-sm text-[#8b9690]">
              Your personal consistency record.
            </p>

          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-10">

          <h2 className="text-xl font-black">
            Quick Actions
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <Link
              href="/exercises"
              className="group rounded-2xl border border-[#252c28] bg-[#111513] p-6 hover:border-[#a3ff12]/50"
            >
              <p className="text-2xl">🏋️</p>

              <h3 className="mt-5 text-lg font-bold">
                Exercises
              </h3>

              <p className="mt-2 text-sm text-[#8b9690]">
                Create and manage your exercise library.
              </p>

              <p className="mt-5 font-bold text-[#a3ff12]">
                Manage exercises →
              </p>
            </Link>

            <Link
              href="/workouts"
              className="group rounded-2xl border border-[#252c28] bg-[#111513] p-6 hover:border-[#a3ff12]/50"
            >
              <p className="text-2xl">⚡</p>

              <h3 className="mt-5 text-lg font-bold">
                Workouts
              </h3>

              <p className="mt-2 text-sm text-[#8b9690]">
                Log exercises, sets, weight and reps.
              </p>

              <p className="mt-5 font-bold text-[#a3ff12]">
                Start training →
              </p>
            </Link>

            <Link
              href="/progress"
              className="group rounded-2xl border border-[#252c28] bg-[#111513] p-6 hover:border-[#a3ff12]/50"
            >
              <p className="text-2xl">📈</p>

              <h3 className="mt-5 text-lg font-bold">
                Progress
              </h3>

              <p className="mt-2 text-sm text-[#8b9690]">
                View strength records and estimated 1RM.
              </p>

              <p className="mt-5 font-bold text-[#a3ff12]">
                View progress →
              </p>
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}