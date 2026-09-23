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

export default function ExercisesPage() {
  const router = useRouter();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:5000";

  // =========================
  // GET TOKEN
  // =========================

  function getToken() {
    return localStorage.getItem("token");
  }

  // =========================
  // LOAD EXERCISES
  // =========================

  async function loadExercises() {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API}/api/exercises`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        console.log("Failed to load exercises");
        setMessage("Unable to load exercises.");
        return;
      }

      const data = await response.json();

      console.log("Exercises from backend:", data);

      // Handles both possible backend response formats:
      // [ {...}, {...} ]
      // OR
      // { exercises: [ {...}, {...} ] }

      if (Array.isArray(data)) {
        setExercises(data);
      } else if (Array.isArray(data.exercises)) {
        setExercises(data.exercises);
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error("Exercise loading error:", error);
      setMessage("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD ON PAGE OPEN
  // =========================

  useEffect(() => {
    loadExercises();
  }, []);

  // =========================
  // ADD / UPDATE EXERCISE
  // =========================

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const isEditing = editingId !== null;

    const url = isEditing
      ? `${API}/api/exercises/${editingId}`
      : `${API}/api/exercises`;

    const method = isEditing ? "PUT" : "POST";

    try {
      setMessage("");

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          muscle_group: muscleGroup,
          equipment: equipment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong.");
        return;
      }

      // Clear form
      setName("");
      setMuscleGroup("");
      setEquipment("");
      setEditingId(null);

      setMessage(
        isEditing
          ? "Exercise updated successfully."
          : "Exercise added successfully."
      );

      // IMPORTANT: Reload exercises after add/update
      await loadExercises();
    } catch (error) {
      console.error("Save exercise error:", error);
      setMessage("Unable to save exercise.");
    }
  }

  // =========================
  // EDIT
  // =========================

  function editExercise(exercise: Exercise) {
    setEditingId(exercise.id);

    setName(exercise.name);
    setMuscleGroup(exercise.muscle_group);
    setEquipment(exercise.equipment || "");

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================
  // CANCEL EDIT
  // =========================

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setMuscleGroup("");
    setEquipment("");
    setMessage("");
  }

  // =========================
  // DELETE
  // =========================

  async function deleteExercise(id: number) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exercise?"
    );

    if (!confirmDelete) return;

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API}/api/exercises/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();

        setMessage(
          data.message || "Unable to delete exercise."
        );

        return;
      }

      setMessage("Exercise deleted successfully.");

      // Reload after delete
      await loadExercises();
    } catch (error) {
      console.error("Delete exercise error:", error);
      setMessage("Unable to delete exercise.");
    }
  }

  // =========================
  // UI
  // =========================

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

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">

        {/* HEADER */}

        <div>

          <p className="text-xs font-bold tracking-[0.3em] text-[#a3ff12]">
            EXERCISE LIBRARY
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Manage Exercises
          </h1>

          <p className="mt-2 text-[#8b9690]">
            Create and manage your personal exercise library.
          </p>

        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[380px_1fr]">

          {/* FORM */}

          <section className="h-fit rounded-2xl border border-[#252c28] bg-[#111513] p-6">

            <h2 className="text-xl font-black">
              {editingId ? "Edit Exercise" : "Add Exercise"}
            </h2>

            <p className="mt-2 text-sm text-[#8b9690]">
              {editingId
                ? "Update your exercise details."
                : "Add a new exercise to your library."}
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm text-[#aeb8b2]">
                  Exercise Name
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Barbell Bench Press"
                  className="w-full rounded-xl border border-[#303833] bg-[#080b0a] px-4 py-3 text-white outline-none placeholder:text-[#555e59] focus:border-[#a3ff12]"
                />

              </div>

              {/* MUSCLE GROUP */}

              <div>

                <label className="mb-2 block text-sm text-[#aeb8b2]">
                  Muscle Group
                </label>

                <input
                  type="text"
                  required
                  value={muscleGroup}
                  onChange={(e) =>
                    setMuscleGroup(e.target.value)
                  }
                  placeholder="e.g. Chest"
                  className="w-full rounded-xl border border-[#303833] bg-[#080b0a] px-4 py-3 text-white outline-none placeholder:text-[#555e59] focus:border-[#a3ff12]"
                />

              </div>

              {/* EQUIPMENT */}

              <div>

                <label className="mb-2 block text-sm text-[#aeb8b2]">
                  Equipment
                </label>

                <input
                  type="text"
                  value={equipment}
                  onChange={(e) =>
                    setEquipment(e.target.value)
                  }
                  placeholder="e.g. Barbell"
                  className="w-full rounded-xl border border-[#303833] bg-[#080b0a] px-4 py-3 text-white outline-none placeholder:text-[#555e59] focus:border-[#a3ff12]"
                />

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="w-full rounded-xl bg-[#a3ff12] py-3 font-black text-black hover:bg-[#b5ff3d]"
              >
                {editingId
                  ? "UPDATE EXERCISE"
                  : "+ ADD EXERCISE"}
              </button>

              {/* CANCEL */}

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full rounded-xl border border-[#303833] py-3 font-semibold hover:border-[#a3ff12]"
                >
                  CANCEL EDIT
                </button>
              )}

            </form>

            {/* MESSAGE */}

            {message && (
              <div className="mt-5 rounded-xl border border-[#a3ff12]/20 bg-[#a3ff12]/5 p-3 text-sm text-[#a3ff12]">
                {message}
              </div>
            )}

          </section>

          {/* EXERCISE LIST */}

          <section>

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-black">
                Your Exercises
              </h2>

              <span className="rounded-full bg-[#111513] px-3 py-1 text-sm text-[#8b9690]">
                {exercises.length} exercises
              </span>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="rounded-2xl border border-[#252c28] bg-[#111513] p-10 text-center text-[#a3ff12]">
                Loading exercises...
              </div>

            ) : exercises.length === 0 ? (

              /* EMPTY STATE */

              <div className="rounded-2xl border border-dashed border-[#303833] p-12 text-center">

                <div className="text-4xl">
                  🏋️
                </div>

                <h3 className="mt-4 font-bold">
                  No exercises yet
                </h3>

                <p className="mt-2 text-sm text-[#8b9690]">
                  Add your first exercise using the form.
                </p>

              </div>

            ) : (

              /* EXERCISES */

              <div className="grid gap-4 sm:grid-cols-2">

                {exercises.map((exercise) => (

                  <div
                    key={exercise.id}
                    className="rounded-2xl border border-[#252c28] bg-[#111513] p-6 transition hover:border-[#a3ff12]/40"
                  >

                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a3ff12]">
                      {exercise.muscle_group}
                    </p>

                    <h3 className="mt-3 text-xl font-black">
                      {exercise.name}
                    </h3>

                    <p className="mt-2 text-sm text-[#8b9690]">
                      {exercise.equipment ||
                        "No equipment"}
                    </p>

                    <div className="mt-6 flex gap-3">

                      {/* EDIT */}

                      <button
                        onClick={() =>
                          editExercise(exercise)
                        }
                        className="flex-1 rounded-lg border border-[#303833] px-3 py-2 text-sm font-semibold hover:border-[#a3ff12]"
                      >
                        Edit
                      </button>

                      {/* DELETE */}

                      <button
                        onClick={() =>
                          deleteExercise(exercise.id)
                        }
                        className="flex-1 rounded-lg border border-red-500/20 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

      </div>

    </main>
  );
}