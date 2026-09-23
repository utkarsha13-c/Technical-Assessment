const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// ADD EXERCISE
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { name, muscle_group, equipment } = req.body;

        if (!name || !muscle_group) {
            return res.status(400).json({
                message: "Exercise name and muscle group are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO exercises
            (user_id, name, muscle_group, equipment)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                req.user.userId,
                name,
                muscle_group,
                equipment
            ]
        );

        res.status(201).json({
            message: "Exercise added successfully",
            exercise: result.rows[0]
        });

    } catch (error) {
        console.error("Add exercise error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});
// GET ALL EXERCISES OF LOGGED-IN USER
router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM exercises
             WHERE user_id = $1
             ORDER BY id DESC`,
            [req.user.userId]
        );

        res.json({
            exercises: result.rows
        });

    } catch (error) {
        console.error("Get exercises error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});
// UPDATE EXERCISE
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, muscle_group, equipment } = req.body;

        if (!name || !muscle_group) {
            return res.status(400).json({
                message: "Exercise name and muscle group are required"
            });
        }

        const result = await pool.query(
            `UPDATE exercises
             SET name = $1,
                 muscle_group = $2,
                 equipment = $3
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [
                name,
                muscle_group,
                equipment,
                id,
                req.user.userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Exercise not found"
            });
        }

        res.json({
            message: "Exercise updated successfully",
            exercise: result.rows[0]
        });

    } catch (error) {
        console.error("Update exercise error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});
// DELETE EXERCISE
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM exercises
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Exercise not found"
            });
        }

        res.json({
            message: "Exercise deleted successfully"
        });

    } catch (error) {
        console.error("Delete exercise error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});
module.exports = router;