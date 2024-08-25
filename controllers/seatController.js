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
        event_id: seats.length > 0 ? seats[0].event_id : null,
        seats: seats.map((seat) => ({
          id: seat.id,
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
    const { seatIds, orderNumber } = req.body;

    // 在確認前，檢查座位是否為 temporary_hold
    const heldSeats = await SeatModel.checkSeatsStatus(seatIds);

    if (heldSeats.length !== seatIds.length) {
      return res
        .status(400)
        .json({ error: "Some seats are no longer available." });
    }

    await SeatModel.reserveSeats(seatIds, orderNumber);
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

exports.getLockedSeats = async (req, res) => {
  try {
    const memberId = req.user.id;

    const lockedSeats = await SeatModel.getLockedSeatsByMemberId(memberId);

    res.json({
      event_id: lockedSeats.length > 0 ? lockedSeats[0].event_id : null,
      seats: lockedSeats,
    });
  } catch (error) {
    console.error("Error fetching locked seats:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching locked seats." });
  }
};

// 取消暫時保留的座位
exports.cancelHold = async (req, res) => {
  try {
    const { seatIds } = req.body;
    const memberId = req.user.id;

    // 確認這些座位是否屬於該用戶並且處於 temporary_hold 狀態
    const seatsToCancel = await SeatModel.getLockedSeatsByMemberId(memberId);

    const validSeatIds = seatsToCancel
      .map((seat) => seat.id)
      .filter((id) => seatIds.includes(id));

    if (validSeatIds.length !== seatIds.length) {
      return res.status(400).json({
        error:
          "Some seats are not held by this user or are not in hold status.",
      });
    }

    // 取消暫時保留，將座位狀態設置為 available
    await SeatModel.releaseSeats(seatIds);
    res.send("Hold canceled successfully.");
  } catch (error) {
    console.error("Error canceling hold:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while canceling the hold." });
  }
};

exports.getSeatIds = async (req, res) => {
  const { area, seats } = req.body;

  if (!area || !seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: "Invalid area or seats data." });
  }

  try {
    const seatIds = await SeatModel.findSeatIdsByDetails(area, seats);
    res.json({ seatIds });
  } catch (error) {
    console.error("Error getting seat IDs:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while getting seat IDs." });
  }
};
