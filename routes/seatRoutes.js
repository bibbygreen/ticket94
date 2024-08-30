//seatRoutes.js
const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seatController");
const { verifyToken } = require("../utils/tokenUtils");

router.get(
  "/events/:eventId/seats",
  verifyToken,
  seatController.getAvailableSeats
);
router.post("/seats/hold", verifyToken, seatController.holdSeats); //////////
router.post("/seats/release", verifyToken, seatController.releaseSeats);
router.get("/seats/locked", verifyToken, seatController.getLockedSeats); ////////////
router.post("/cancel-hold", verifyToken, seatController.cancelHold);
router.post("/get-seat-ids", verifyToken, seatController.getSeatIds); //////////////
router.get("/seats/:eventId", seatController.getSeatsForEvent); //////
// router.post("/reserve-seats", verifyToken, seatController.reserveSeats);
module.exports = router;
