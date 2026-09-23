const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// GET DASHBOARD STATS
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Total workouts
        const workoutsResult = await pool.query(
            `SELECT COUNT(*) AS total_workouts
             FROM workouts
             WHERE user_id = $1`,
            [userId]
        );

        // 2. Total exercises performed
        const exercisesResult = await pool.query(
            `SELECT COUNT(*) AS total_exercises
             FROM workout_exercises we
             JOIN workouts w ON we.workout_id = w.id
             WHERE w.user_id = $1`,
            [userId]
        );

        // 3. Total volume lifted
        const volumeResult = await pool.query(
            `SELECT COALESCE(SUM(ws.weight * ws.reps), 0) AS total_volume
             FROM workout_sets ws
             JOIN workout_exercises we
                ON ws.workout_exercise_id = we.id
             JOIN workouts w
                ON we.workout_id = w.id
             WHERE w.user_id = $1`,
            [userId]
        );

        // 4. Workouts completed this week
        const weekResult = await pool.query(
            `SELECT COUNT(*) AS workouts_this_week
             FROM workouts
             WHERE user_id = $1
             AND workout_date >= DATE_TRUNC('week', CURRENT_DATE)
             AND workout_date < DATE_TRUNC('week', CURRENT_DATE)
                                + INTERVAL '7 days'`,
            [userId]
        );

        res.json({
            total_workouts:
                Number(workoutsResult.rows[0].total_workouts),

            total_exercises:
                Number(exercisesResult.rows[0].total_exercises),

            total_volume:
                Number(volumeResult.rows[0].total_volume),

            workouts_this_week:
                Number(weekResult.rows[0].workouts_this_week)
        });

    } catch (error) {
        console.error("Dashboard error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;