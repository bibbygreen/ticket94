// seatController.js
const SeatModel = require("../models/seatModel");

exports.checkSeats = async (req, res) => {
  const { area, quantity } = req.body;
  const quantityNumber = Number(quantity);

  // Validate input
  if (!area || typeof quantityNumber !== "number" || quantityNumber <= 0) {
    console.error("Invalid input:", { area, quantityNumber });
    return res.status(400).json({ error: "Invalid area or quantity." });
  }

  try {
    // Fetch available seats from the model
    const seats = await SeatModel.checkAvailableSeats(area, quantityNumber);

    let response;
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
    console.error("Error checking seats:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while checking available seats." });
  }
};

exports.holdSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;
    const memberId = req.user.id;

    await SeatModel.holdSeats(seatIds, memberId);
    res.send("Seats held successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reserveSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;

    // 在确认之前，检查这些座位是否依然处于 temporary_hold 状态
    const heldSeats = await SeatModel.checkSeatsStatus(seatIds);

    if (heldSeats.length !== seatIds.length) {
      return res
        .status(400)
        .json({ error: "Some seats are no longer available." });
    }

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
