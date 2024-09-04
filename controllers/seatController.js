// seatController.js
const SeatModel = require("../models/seatModel");

exports.getAvailableSeats = async (req, res) => {
  const { eventId } = req.params;
  const { area, quantity } = req.query;
  const quantityNumber = Number(quantity);

  if (!area || typeof quantityNumber !== "number" || quantityNumber <= 0) {
    console.error("Invalid input:", { area, quantityNumber });
    return res
      .status(400)
      .json({ error: true, message: "Invalid area or quantity." });
  }

  try {
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
      };
    } else {
      response = {
        available: false,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error checking seats:", error.message);
    res.status(500).json({
      error: true,
      message: "An error occurred while checking available seats.",
    });
  }
};

exports.holdSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;
    const memberId = req.user.id;

    if (!seatIds || seatIds.length === 0) {
      return res
        .status(400)
        .json({ error: true, message: "No seats selected." });
    }

    await SeatModel.holdSeats(seatIds, memberId); //更改座位狀態

    // 已保留座位的info
    const heldSeatsDetails = await SeatModel.getHeldSeatsDetails(seatIds);

    res.status(200).json({
      message: "Seats held successfully.",
      seats: heldSeatsDetails,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

exports.reserveSeats = async (req, res) => {
  try {
    const { seatIds, orderNumber } = req.body;

    // 訂購前，檢查座位是否為 temporary_hold
    const heldSeats = await SeatModel.checkSeatsStatus(seatIds);

    if (heldSeats.length !== seatIds.length) {
      return res
        .status(400)
        .json({ error: true, message: "Some seats are no longer available." });
    }

    await SeatModel.reserveSeats(seatIds, orderNumber);
    res.status(200).send("Seats reserved successfully.");
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

exports.releaseSeats = async (req, res) => {
  try {
    const memberId = req.user.id;
    await SeatModel.releaseSeats(memberId);
    res.status(200).send("Seats released successfully.");
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

exports.getLockedSeats = async (req, res) => {
  try {
    const memberId = req.user.id;

    const lockedSeats = await SeatModel.getLockedSeatsByMemberId(memberId);

    res.status(200).json({
      event_id: lockedSeats.length > 0 ? lockedSeats[0].event_id : null,
      seats: lockedSeats,
    });
  } catch (error) {
    console.error("Error fetching locked seats:", error.message);
    res.status(500).json({
      error: true,
      message: "An error occurred while fetching locked seats.",
    });
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
        error: true,
        message:
          "Some seats are not held by this user or are not in hold status.",
      });
    }

    // 取消暫時保留，將座位狀態設置為 available
    await SeatModel.releaseSeats(seatIds);
    res.status(200).send("Hold canceled successfully.");
  } catch (error) {
    console.error("Error canceling hold:", error.message);
    res.status(500).json({
      error: true,
      message: "An error occurred while canceling the hold.",
    });
  }
};

exports.getSeatIds = async (req, res) => {
  const { area, seats } = req.body;

  if (!area || !seats || !Array.isArray(seats) || seats.length === 0) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid area or seats data." });
  }

  try {
    const seatIds = await SeatModel.findSeatIdsByDetails(area, seats);
    res.status(200).json({ seatIds });
  } catch (error) {
    console.error("Error getting seat IDs:", error.message);
    res.status(500).json({
      error: true,
      message: "An error occurred while getting seat IDs.",
    });
  }
};

exports.getSeatsForEvent = async (req, res) => {
  const eventId = req.params.eventId;

  try {
    const seats = await SeatModel.seatIdforSeatDiagramByEventId(eventId);
    res.status(200).json(seats);
  } catch (error) {
    console.error("Error fetching seats:", error);
    res.status(500).json({ error: true, message: "Failed to fetch seats" });
  }
};
