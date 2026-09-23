"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Exercise = {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string | null;
};

type SetInput = {
  weight: string;
  reps: string;
};

export default function WorkoutsPage() {
  const router = useRouter();

  const API = "http://localhost:5000";

  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [workoutId, setWorkoutId] = useState<number | null>(null);

  const [exerciseId, setExerciseId] = useState("");

  const [sets, setSets] = useState<SetInput[]>([
    {
      weight: "",
      reps: "",
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function getToken() {
    return localStorage.getItem("token");
  }

  // ==========================
  // LOAD EXERCISES
  // ==========================

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
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to load exercises.");
    }
  }

  useEffect(() => {
    loadExercises();
  }, []);

  // ==========================
  // CREATE WORKOUT
  // ==========================

  async function createWorkout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API}/api/workouts`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: workoutName,
          workout_date: workoutDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create workout.");
        return;
      }

      // Handles common backend response shapes
      const createdId =
        data.id ||
        data.workout?.id ||
        data.workout_id;

      if (!createdId) {
        console.log("Workout response:", data);
        setMessage("Workout created, but workout ID was not returned.");
        return;
      }

      setWorkoutId(Number(createdId));

      setMessage(
        "Workout created! Now add exercises and sets."
      );
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================
  // ADD ANOTHER SET
  // ==========================

  function addSet() {
    setSets([
      ...sets,
      {
        weight: "",
        reps: "",
      },
    ]);
  }

  // ==========================
  // REMOVE SET
  // ==========================

  function removeSet(index: number) {
    if (sets.length === 1) return;

    const updatedSets = sets.filter(
      (_, currentIndex) => currentIndex !== index
    );

    setSets(updatedSets);
  }

  // ==========================
  // UPDATE SET
  // ==========================

  function updateSet(
    index: number,
    field: "weight" | "reps",
    value: string
  ) {
    const updatedSets = [...sets];

    updatedSets[index] = {
      ...updatedSets[index],
      [field]: value,
    };

    setSets(updatedSets);
  }

  // ==========================
  // ADD EXERCISE + SETS
  // ==========================

  async function addExerciseToWorkout(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!workoutId) {
      setMessage("Create a workout first.");
      return;
    }

    if (!exerciseId) {
      setMessage("Select an exercise.");
      return;
    }

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const formattedSets = sets.map((set, index) => ({
      set_number: index + 1,
      weight: Number(set.weight),
      reps: Number(set.reps),
    }));

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API}/api/workouts/${workoutId}/exercises`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            exercise_id: Number(exerciseId),
            sets: formattedSets,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to add exercise."
        );
        return;
      }

      setMessage(
        "Exercise and sets added successfully!"
      );

      setExerciseId("");

      setSets([
        {
          weight: "",
          reps: "",
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessage("Unable to add exercise.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================
  // UI
  // ==========================

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

        <div>

          <p className="text-xs font-bold tracking-[0.3em] text-[#a3ff12]">
            WORKOUT LOGGER
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Log Your Workout
          </h1>

          <p className="mt-2 text-[#8b9690]">
            Create a workout and record every set.
          </p>

        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mt-6 rounded-xl border border-[#a3ff12]/20 bg-[#a3ff12]/5 px-5 py-4 text-sm text-[#a3ff12]">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* ===================== */}
          {/* CREATE WORKOUT */}
          {/* ===================== */}

          <section className="rounded-2xl border border-[#252c28] bg-[#111513] p-7">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold tracking-widest text-[#a3ff12]">
                  STEP 01
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Create Workout
                </h2>
              </div>

              {workoutId && (
                <div className="rounded-full bg-[#a3ff12]/10 px-3 py-1 text-xs font-bold text-[#a3ff12]">
                  CREATED ✓
                </div>
              )}

            </div>

            <form
              onSubmit={createWorkout}
              className="mt-7 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm text-[#aeb8b2]">
                  Workout Name
                </label>

                <input
                  type="text"
                  required
                  disabled={workoutId !== null}
                  value={workoutName}
                  onChange={(e) =>
                    setWorkoutName(e.target.value)
                  }
                  placeholder="e.g. Push Day"
                  className="w-full rounded-xl border border-[#303833] bg-[#080b0a] px-4 py-3 outline-none focus:border-[#a3ff12] disabled:opacity-50"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm text-[#aeb8b2]">
                  Workout Date
                </label>

                <input
                  type="date"
                  required
                  disabled={workoutId !== null}
                  value={workoutDate}
                  onChange={(e) =>
                    setWorkoutDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-[#303833] bg-[#080b0a] px-4 py-3 outline-none focus:border-[#a3ff12] disabled:opacity-50"
                />

              </div>

              <button
                type="submit"
                disabled={loading || workoutId !== null}
                className="w-full rounded-xl bg-[#a3ff12] py-3.5 font-black text-black disabled:opacity-40"
              >
                {workoutId
                  ? "WORKOUT CREATED ✓"
                  : "CREATE WORKOUT"}
              </button>

            </form>

          </section>

          {/* ===================== */}
          {/* ADD EXERCISE */}
          {/* ===================== */}

          <section
            className={`rounded-2xl border bg-[#111513] p-7 ${
              workoutId
                ? "border-[#a3ff12]/30"
                : "border-[#252c28] opacity-60"
            }`}
          >

            <p className="text-xs font-bold tracking-widest text-[#a3ff12]">
              STEP 02
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Add Exercise & Sets
            </h2>

            {!workoutId && (
              <p className="mt-3 text-sm text-[#8b9690]">
                Create your workout first.
              </p>
            )}

            <form
              onSubmit={addExerciseToWorkout}
              className="mt-7"
            >

              {/* EXERCISE */}

              <label className="mb-2 block text-sm text-[#aeb8b2]">
                Exercise
              </label>

              <select
                required
                disabled={!workoutId}
                value={exerciseId}
                onChange={(e) =>
                  setExerciseId(e.target.value)
                }
                className="w-full rounded-xl border border-[#303833] bg-[#080b0a] px-4 py-3 outline-none focus:border-[#a3ff12]"
              >
                <option value="">
                  Select exercise
                </option>

                {exercises.map((exercise) => (
                  <option
                    key={exercise.id}
                    value={exercise.id}
                  >
                    {exercise.name} —{" "}
                    {exercise.muscle_group}
                  </option>
                ))}

              </select>

              {/* SETS */}

              <div className="mt-7">

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="font-bold">
                    Sets
                  </h3>

                  <button
                    type="button"
                    disabled={!workoutId}
                    onClick={addSet}
                    className="rounded-lg border border-[#a3ff12]/30 px-3 py-2 text-sm font-bold text-[#a3ff12] hover:bg-[#a3ff12]/10"
                  >
                    + Add Set
                  </button>

                </div>

                <div className="space-y-3">

                  {sets.map((set, index) => (

                    <div
                      key={index}
                      className="grid grid-cols-[50px_1fr_1fr_40px] items-center gap-3"
                    >

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a201d] text-sm font-bold text-[#a3ff12]">
                        {index + 1}
                      </div>

                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        required
                        disabled={!workoutId}
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(
                            index,
                            "weight",
                            e.target.value
                          )
                        }
                        placeholder="Weight kg"
                        className="w-full rounded-lg border border-[#303833] bg-[#080b0a] px-3 py-2.5 outline-none focus:border-[#a3ff12]"
                      />

                      <input
                        type="number"
                        min="1"
                        required
                        disabled={!workoutId}
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(
                            index,
                            "reps",
                            e.target.value
                          )
                        }
                        placeholder="Reps"
                        className="w-full rounded-lg border border-[#303833] bg-[#080b0a] px-3 py-2.5 outline-none focus:border-[#a3ff12]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeSet(index)
                        }
                        disabled={sets.length === 1}
                        className="text-lg text-red-400 disabled:opacity-20"
                      >
                        ×
                      </button>

                    </div>

                  ))}

                </div>

              </div>

              <button
                type="submit"
                disabled={!workoutId || loading}
                className="mt-7 w-full rounded-xl bg-[#a3ff12] py-3.5 font-black text-black disabled:cursor-not-allowed disabled:opacity-30"
              >
                ADD EXERCISE TO WORKOUT
              </button>

            </form>

          </section>

        </div>

        {/* HELP */}

        <div className="mt-6 rounded-2xl border border-[#252c28] bg-[#111513] p-6">

          <p className="font-bold">
            Quick workflow
          </p>

          <p className="mt-2 text-sm leading-6 text-[#8b9690]">
            Create workout → select exercise → add multiple
            sets → enter weight and reps → save. You can add
            another exercise after saving the first one.
          </p>

        </div>

      </div>

    </main>
  );
}