const express = require("express");
const router = express.Router();
const pool = require("../config/dbConfig");

// API endpoint to check available seats
router.post("/check-seats", async (req, res) => {
  const { area, quantity } = req.body;

  // Validate input
  if (!area || typeof quantity !== "number" || quantity <= 0) {
    return res.status(400).json({ error: "Invalid area or quantity." });
  }

  try {
    // Query to find available seats in the specified area
    const [rows] = await pool.query(
      `
      SELECT s.id, s.seat_num
      FROM seats s
      JOIN seating_rows r ON s.row_id = r.id
      JOIN sections sec ON r.section_id = sec.id
      WHERE sec.section_name = ?
      AND s.status = 'vacant'
      LIMIT ?
    `,
      [area, quantity]
    );

    // Check if there are enough available seats
    if (rows.length >= quantity) {
      res.json({
        available: true,
        seats: rows,
      });
    } else {
      res.json({
        available: false,
      });
    }
  } catch (error) {
    console.error("Error checking seats:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking available seats." });
  }
});

module.exports = router;
