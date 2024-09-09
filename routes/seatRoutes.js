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
router.put("/seats/hold", verifyToken, seatController.holdSeats);
router.put("/seats/release", verifyToken, seatController.releaseSeats);
router.get("/seats/locked", verifyToken, seatController.getLockedSeats);
router.get("/seats/:eventId", seatController.getSeatsForEvent);

module.exports = router;
