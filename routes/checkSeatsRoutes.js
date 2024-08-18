const express = require("express");
const router = express.Router();
const pool = require("../config/dbConfig");

// API endpoint to check available seats
router.post("/check-seats", async (req, res) => {
  const { area, quantity } = req.body;
  const quantityNumber = Number(quantity);

  // Validate input
  if (!area || typeof quantityNumber !== "number" || quantityNumber <= 0) {
    console.error("Invalid input:", { area, quantityNumber });
    return res.status(400).json({ error: "Invalid area or quantity." });
  }

  try {
    // Query to find available seats in the specified area
    const [seats] = await pool.query(
      `SELECT seats.id, seats.seat_num AS number, seating_rows.row_num AS row_num, sections.price
      FROM seats
      JOIN seating_rows ON seats.row_id = seating_rows.id
      JOIN sections ON seating_rows.section_id = sections.id
      WHERE sections.section_name = ?
      AND seats.status = 'V'
      LIMIT ?`,
      [area, quantityNumber]
    );
    console.log("Seats:", seats);

    // Check if there are enough available seats
    if (seats.length >= quantityNumber) {
      response = {
        available: true,
        area: area,
        seats: seats.map((seat) => ({
          row: seat.row_num,
          number: seat.number,
          price: seat.price,
        })),
        price: seats.length > 0 ? seats[0].price : 0,
      };
    } else {
      response = {
        available: false,
      };
    }

    res.json(response);
  } catch (error) {
    console.error("Error checking seats:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking available seats." });
  }
});

module.exports = router;
