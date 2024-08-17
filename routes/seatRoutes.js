const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seatController");

router.post("/select-seats", seatController.selectSeats);
router.post("/hold-seats", seatController.holdSeats);
router.post("/reserve-seats", seatController.reserveSeats);
router.post("/release-seats", seatController.releaseSeats);

module.exports = router;
