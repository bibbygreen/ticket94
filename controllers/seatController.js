// seatController.js
const SeatModel = require("../models/seatModel");

exports.selectSeats = async (req, res) => {
  try {
    const { sectionId, numSeats } = req.body;
    if (!sectionId || !numSeats) {
      throw new Error("Missing required parameters");
    }

    const availableSeats = await SeatModel.findAvailableSeats(
      sectionId,
      parseInt(numSeats)
    );
    res.json({ availableSeats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
