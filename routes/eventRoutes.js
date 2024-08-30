const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

// Define routes
router.get("/events", eventController.getEvents);
router.get("/event/:id", eventController.getEventById);

module.exports = router;
