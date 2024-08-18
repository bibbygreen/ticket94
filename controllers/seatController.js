// seatController.js
const SeatModel = require("../models/seatModel");

// exports.checkSeats = async (req, res) => {
//   const { area, quantity } = req.body;
//   const quantityNumber = Number(quantity);

//   // Validate input
//   if (!area || typeof quantityNumber !== "number" || quantityNumber <= 0) {
//     console.error("Invalid input:", { area, quantityNumber });
//     return res.status(400).json({ error: "Invalid area or quantity." });
//   }

//   try {
//     const seats = await SeatModel.findAvailableSeats(area, quantityNumber);
//     console.log("Seats:", seats);

//     // Check if there are enough available seats
//     if (seats.length >= quantityNumber) {
//       res.json({
//         available: true,
//         seats: seats.map((seat) => ({
//           row: seat.row_num,
//           number: seat.number,
//           price: seat.price,
//         })),
//         price: seats.length > 0 ? seats[0].price : 0,
//       });
//     } else {
//       res.json({
//         available: false,
//       });
//     }
//   } catch (error) {
//     console.error("Error checking seats:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while checking available seats." });
//   }
// };

// exports.selectSeats = async (req, res) => {
//   try {
//     const { sectionId, numSeats } = req.body;
//     if (!sectionId || !numSeats) {
//       throw new Error("Missing required parameters");
//     }

//     const availableSeats = await SeatModel.findAvailableSeats(
//       sectionId,
//       parseInt(numSeats)
//     );
//     res.json({ availableSeats });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.holdSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;
    await SeatModel.holdSeats(seatIds);
    res.send("Seats held successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reserveSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;
    await SeatModel.reserveSeats(seatIds);
    res.send("Seats reserved successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.releaseSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;
    await SeatModel.releaseSeats(seatIds);
    res.send("Seats released successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
