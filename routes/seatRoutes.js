//seatRoutes.js
const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seatController");
const { verifyToken } = require("../utils/tokenUtils");

router.post("/check-seats", verifyToken, seatController.checkSeats);
router.post("/hold-seats", verifyToken, seatController.holdSeats);
router.post("/reserve-seats", verifyToken, seatController.reserveSeats);
router.post("/release-seats", verifyToken, seatController.releaseSeats);
router.get("/locked-seats", verifyToken, seatController.getLockedSeats);
router.post("/cancel-hold", verifyToken, seatController.cancelHold);
router.post("/get-seat-ids", verifyToken, seatController.getSeatIds);

module.exports = router;
