"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Exercise = {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string | null;
};

type Session = {
  workout_id: number;
  workout_date: string;
  best_weight: number | string;
  best_reps: number;
  total_volume: number | string;
};

type ProgressData = {
  exercise: string;
  current_session: Session | null;
  previous_session: Session | null;
  best_weight: number;
  best_reps: number;
  estimated_1RM: number;
  progress: string;
};

export default function ProgressPage() {
  const router = useRouter();

  const API = "http://localhost:5000";

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState("");
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function getToken() {
    return localStorage.getItem("token");
  }

  async function loadExercises() {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API}/api/exercises`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setExercises(data);
      } else if (Array.isArray(data.exercises)) {
        setExercises(data.exercises);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to load exercises.");
    }
  }

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadProgress(id: string) {
    if (!id) {
      setProgress(null);
      return;
    }

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setProgress(null);

      const response = await fetch(
        `${API}/api/progress/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to load progress."
        );
        return;
      }

      setProgress(data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  function handleExerciseChange(id: string) {
    setExerciseId(id);
    loadProgress(id);
  }

  function formatDate(date: string | undefined) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
  }

  function progressSymbol(value: string) {
    if (value.includes("↑")) return "↑";
    if (value.includes("↓")) return "↓";
    return "→";
  }

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

        <Link
          href="/dashboard"
          className="rounded-lg border border-[#303833] px-4 py-2 text-sm font-semibold hover:border-[#a3ff12]"
        >
          ← Dashboard
        </Link>

      </nav>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">

        {/* HEADER */}

        <p className="text-xs font-bold tracking-[0.3em] text-[#a3ff12]">
          PERFORMANCE ANALYTICS
        </p>

        <h1 className="mt-3 text-4xl font-black">
          Progress Tracking
        </h1>

        <p className="mt-2 text-[#8b9690]">
          Compare your workouts and track strength improvements.
        </p>

        {/* SELECT EXERCISE */}

        <div className="mt-8 rounded-2xl border border-[#252c28] bg-[#111513] p-6">

          <label className="mb-3 block text-sm font-bold text-[#aeb8b2]">
            Select Exercise
          </label>

          <select
            value={exerciseId}
            onChange={(e) =>
              handleExerciseChange(e.target.value)
            }
            className="w-full rounded-xl border border-[#303833] bg-[#080b0a] px-4 py-3 outline-none focus:border-[#a3ff12]"
          >
            <option value="">
              Choose an exercise...
            </option>

            {exercises.map((exercise) => (
              <option
                key={exercise.id}
                value={exercise.id}
              >
                {exercise.name} — {exercise.muscle_group}
              </option>
            ))}

          </select>

        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {message}
          </div>
        )}

        {loading && (
          <div className="mt-10 text-center font-bold text-[#a3ff12]">
            Loading progress...
          </div>
        )}

        {/* PROGRESS */}

        {progress && !loading && (
          <>

            {/* EXERCISE TITLE */}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">

              <div>

                <p className="text-sm text-[#8b9690]">
                  Exercise
                </p>

                <h2 className="mt-1 text-3xl font-black">
                  {progress.exercise}
                </h2>

              </div>

              <div className="rounded-xl border border-[#a3ff12]/30 bg-[#a3ff12]/10 px-6 py-3">

                <span className="mr-2 text-2xl font-black text-[#a3ff12]">
                  {progressSymbol(progress.progress)}
                </span>

                <span className="font-bold text-[#a3ff12]">
                  {progress.progress}
                </span>

              </div>

            </div>

            {/* BEST STATS */}

            <div className="mt-7 grid gap-4 sm:grid-cols-3">

              <StatCard
                label="BEST WEIGHT"
                value={`${progress.best_weight} kg`}
              />

              <StatCard
                label="BEST REPS"
                value={String(progress.best_reps)}
              />

              <StatCard
                label="ESTIMATED 1RM"
                value={`${Number(
                  progress.estimated_1RM
                ).toFixed(2)} kg`}
              />

            </div>

            {/* SESSION COMPARISON */}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">

              {/* PREVIOUS */}

              <SessionCard
                title="Previous Session"
                session={progress.previous_session}
                formatDate={formatDate}
              />

              {/* CURRENT */}

              <SessionCard
                title="Current Session"
                session={progress.current_session}
                formatDate={formatDate}
                current
              />

            </div>

            {/* FORMULA */}

            <div className="mt-8 rounded-2xl border border-[#252c28] bg-[#111513] p-6">

              <p className="text-xs font-bold tracking-[0.2em] text-[#a3ff12]">
                ESTIMATED 1RM FORMULA
              </p>

              <p className="mt-3 text-lg font-bold">
                Weight × (1 + Reps / 30)
              </p>

              <p className="mt-2 text-sm text-[#8b9690]">
                Used to estimate your theoretical
                one-repetition maximum.
              </p>

            </div>

          </>
        )}

        {/* EMPTY STATE */}

        {!progress &&
          !loading &&
          !message &&
          exerciseId === "" && (
            <div className="mt-10 rounded-2xl border border-dashed border-[#303833] p-12 text-center">

              <div className="text-4xl">
                📈
              </div>

              <h3 className="mt-4 text-lg font-black">
                Select an exercise
              </h3>

              <p className="mt-2 text-sm text-[#8b9690]">
                Choose an exercise above to view your
                performance history.
              </p>

            </div>
          )}

      </div>

    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#252c28] bg-[#111513] p-6">

      <p className="text-xs font-bold tracking-[0.15em] text-[#8b9690]">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black text-[#a3ff12]">
        {value}
      </p>

    </div>
  );
}

function SessionCard({
  title,
  session,
  formatDate,
  current = false,
}: {
  title: string;
  session: Session | null;
  formatDate: (date: string | undefined) => string;
  current?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-[#111513] p-7 ${
        current
          ? "border-[#a3ff12]/30"
          : "border-[#252c28]"
      }`}
    >

      <div className="flex items-center justify-between">

        <h3 className="text-xl font-black">
          {title}
        </h3>

        {current && (
          <span className="rounded-full bg-[#a3ff12]/10 px-3 py-1 text-xs font-bold text-[#a3ff12]">
            LATEST
          </span>
        )}

      </div>

      {!session ? (
        <p className="mt-8 text-[#8b9690]">
          No session data available.
        </p>
      ) : (
        <div className="mt-6 space-y-4">

          <Row
            label="Date"
            value={formatDate(session.workout_date)}
          />

          <Row
            label="Best Weight"
            value={`${session.best_weight} kg`}
          />

          <Row
            label="Best Reps"
            value={String(session.best_reps)}
          />

          <Row
            label="Total Volume"
            value={`${session.total_volume} kg`}
          />

        </div>
      )}

    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#252c28] pb-3">

      <span className="text-sm text-[#8b9690]">
        {label}
      </span>

      <span className="font-bold">
        {value}
      </span>

    </div>
  );
}