const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE WORKOUT
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { name, workout_date } = req.body;

        if (!name || !workout_date) {
            return res.status(400).json({
                message: "Workout name and date are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO workouts (user_id, name, workout_date)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                req.user.userId,
                name,
                workout_date
            ]
        );

        res.status(201).json({
            message: "Workout created successfully",
            workout: result.rows[0]
        });

    } catch (error) {
        console.error("Create workout error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});
// ADD EXERCISE WITH MULTIPLE SETS TO WORKOUT
router.post("/:workoutId/exercises", authenticateToken, async (req, res) => {
    const client = await pool.connect();

    try {
        const { workoutId } = req.params;
        const { exercise_id, sets } = req.body;

        if (!exercise_id || !sets || !Array.isArray(sets) || sets.length === 0) {
            return res.status(400).json({
                message: "Exercise and at least one set are required"
            });
        }

        // Make sure workout belongs to logged-in user
        const workout = await client.query(
            `SELECT id FROM workouts
             WHERE id = $1 AND user_id = $2`,
            [workoutId, req.user.userId]
        );

        if (workout.rows.length === 0) {
            return res.status(404).json({
                message: "Workout not found"
            });
        }

        // Make sure exercise also belongs to logged-in user
        const exercise = await client.query(
            `SELECT id FROM exercises
             WHERE id = $1 AND user_id = $2`,
            [exercise_id, req.user.userId]
        );

        if (exercise.rows.length === 0) {
            return res.status(404).json({
                message: "Exercise not found"
            });
        }

        await client.query("BEGIN");

        // Connect exercise to workout
        const workoutExercise = await client.query(
            `INSERT INTO workout_exercises (workout_id, exercise_id)
             VALUES ($1, $2)
             RETURNING *`,
            [workoutId, exercise_id]
        );

        const workoutExerciseId = workoutExercise.rows[0].id;

        // Add all sets
        const createdSets = [];

        for (let i = 0; i < sets.length; i++) {
            const { weight, reps } = sets[i];

            const setResult = await client.query(
                `INSERT INTO workout_sets
                 (workout_exercise_id, set_number, weight, reps)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [
                    workoutExerciseId,
                    i + 1,
                    weight,
                    reps
                ]
            );

            createdSets.push(setResult.rows[0]);
        }

        await client.query("COMMIT");

        res.status(201).json({
            message: "Exercise and sets added successfully",
            workout_exercise: workoutExercise.rows[0],
            sets: createdSets
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Add workout exercise error:", error.message);

        res.status(500).json({
            message: "Server error"
        });

    } finally {
        client.release();
    }
});
// GET COMPLETE WORKOUT
router.get("/:workoutId", authenticateToken, async (req, res) => {
    try {
        const { workoutId } = req.params;

        // Get workout and ensure it belongs to logged-in user
        const workoutResult = await pool.query(
            `SELECT id, name, workout_date, created_at
             FROM workouts
             WHERE id = $1 AND user_id = $2`,
            [workoutId, req.user.userId]
        );

        if (workoutResult.rows.length === 0) {
            return res.status(404).json({
                message: "Workout not found"
            });
        }

        // Get exercises and sets
        const exerciseResult = await pool.query(
            `SELECT
                we.id AS workout_exercise_id,
                e.id AS exercise_id,
                e.name,
                e.muscle_group,
                e.equipment,
                ws.id AS set_id,
                ws.set_number,
                ws.weight,
                ws.reps
             FROM workout_exercises we
             JOIN exercises e
                ON we.exercise_id = e.id
             LEFT JOIN workout_sets ws
                ON ws.workout_exercise_id = we.id
             WHERE we.workout_id = $1
             ORDER BY we.id, ws.set_number`,
            [workoutId]
        );

        const exercises = [];

        for (const row of exerciseResult.rows) {
            let exercise = exercises.find(
                (item) =>
                    item.workout_exercise_id === row.workout_exercise_id
            );

            if (!exercise) {
                exercise = {
                    workout_exercise_id: row.workout_exercise_id,
                    exercise_id: row.exercise_id,
                    name: row.name,
                    muscle_group: row.muscle_group,
                    equipment: row.equipment,
                    sets: []
                };

                exercises.push(exercise);
            }

            if (row.set_id) {
                exercise.sets.push({
                    id: row.set_id,
                    set_number: row.set_number,
                    weight: row.weight,
                    reps: row.reps
                });
            }
        }

        res.json({
            workout: {
                ...workoutResult.rows[0],
                exercises
            }
        });

    } catch (error) {
        console.error("Get workout error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});
module.exports = router;
