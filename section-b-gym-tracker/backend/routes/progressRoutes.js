const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// GET PROGRESS FOR AN EXERCISE
router.get("/:exerciseId", authenticateToken, async (req, res) => {
    try {
        const { exerciseId } = req.params;
        const userId = req.user.userId;

        // Verify exercise belongs to logged-in user
        const exerciseResult = await pool.query(
            `SELECT id, name
             FROM exercises
             WHERE id = $1 AND user_id = $2`,
            [exerciseId, userId]
        );

        if (exerciseResult.rows.length === 0) {
            return res.status(404).json({
                message: "Exercise not found"
            });
        }

        // Get performance history
        const historyResult = await pool.query(
            `SELECT
                w.id AS workout_id,
                w.workout_date,
                MAX(ws.weight) AS best_weight,
                MAX(ws.reps) AS best_reps,
                SUM(ws.weight * ws.reps) AS total_volume
             FROM workouts w
             JOIN workout_exercises we
                ON we.workout_id = w.id
             JOIN workout_sets ws
                ON ws.workout_exercise_id = we.id
             WHERE w.user_id = $1
             AND we.exercise_id = $2
             GROUP BY w.id, w.workout_date
             ORDER BY w.workout_date DESC, w.id DESC`,
            [userId, exerciseId]
        );

        if (historyResult.rows.length === 0) {
            return res.status(404).json({
                message: "No workout history found"
            });
        }

        const current = historyResult.rows[0];
        const previous = historyResult.rows[1] || null;

        // Best weight and reps across all sessions
        const bestResult = await pool.query(
            `SELECT
                MAX(ws.weight) AS best_weight,
                MAX(ws.reps) AS best_reps
             FROM workout_sets ws
             JOIN workout_exercises we
                ON ws.workout_exercise_id = we.id
             JOIN workouts w
                ON we.workout_id = w.id
             WHERE w.user_id = $1
             AND we.exercise_id = $2`,
            [userId, exerciseId]
        );

        const bestWeight = Number(bestResult.rows[0].best_weight);
        const bestReps = Number(bestResult.rows[0].best_reps);

        // Estimated 1RM
        const estimated1RM =
            bestWeight * (1 + bestReps / 30);

        // Compare current and previous session volume
        let indicator = "→ Maintained";

        if (previous) {
            const currentVolume = Number(current.total_volume);
            const previousVolume = Number(previous.total_volume);

            if (currentVolume > previousVolume) {
                indicator = "↑ Improved";
            } else if (currentVolume < previousVolume) {
                indicator = "↓ Decreased";
            }
        } else {
            indicator = "No previous session";
        }

        res.json({
            exercise: exerciseResult.rows[0].name,

            current_session: current,

            previous_session: previous,

            best_weight: bestWeight,

            best_reps: bestReps,

            estimated_1RM: Number(estimated1RM.toFixed(2)),

            progress: indicator
        });

    } catch (error) {
        console.error("Progress error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;