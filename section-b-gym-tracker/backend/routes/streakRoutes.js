const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// GET WORKOUT STREAK
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // DISTINCT ensures multiple workouts on same day count once
        const result = await pool.query(
            `SELECT DISTINCT workout_date
             FROM workouts
             WHERE user_id = $1
             ORDER BY workout_date ASC`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                current_streak: 0,
                longest_streak: 0
            });
        }

        // Convert dates to YYYY-MM-DD
        const dates = result.rows.map(row => {
            return new Date(row.workout_date)
                .toISOString()
                .split("T")[0];
        });

        let longestStreak = 1;
        let runningStreak = 1;

        for (let i = 1; i < dates.length; i++) {
            const previousDate = new Date(dates[i - 1] + "T00:00:00Z");
            const currentDate = new Date(dates[i] + "T00:00:00Z");

            const difference =
                (currentDate - previousDate) / (1000 * 60 * 60 * 24);

            if (difference === 1) {
                runningStreak++;
            } else {
                runningStreak = 1;
            }

            longestStreak = Math.max(longestStreak, runningStreak);
        }

        // Current streak = streak ending on most recent workout date
        let currentStreak = 1;

        for (let i = dates.length - 1; i > 0; i--) {
            const currentDate =
                new Date(dates[i] + "T00:00:00Z");

            const previousDate =
                new Date(dates[i - 1] + "T00:00:00Z");

            const difference =
                (currentDate - previousDate) / (1000 * 60 * 60 * 24);

            if (difference === 1) {
                currentStreak++;
            } else {
                break;
            }
        }

        res.json({
            current_streak: currentStreak,
            longest_streak: longestStreak
        });

    } catch (error) {
        console.error("Streak error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;