const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seatController");
const { verifyToken } = require("../utils/tokenUtils");

// router.post("/select-seats", seatController.selectSeats);
router.post("/hold-seats", verifyToken, seatController.holdSeats);
router.post("/reserve-seats", verifyToken, seatController.reserveSeats);
router.post("/release-seats", verifyToken, seatController.releaseSeats);
router.post("/check-seats", verifyToken, seatController.checkSeats);

module.exports = router;
