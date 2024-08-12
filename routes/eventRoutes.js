const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

// Define routes
router.get("/api/events", eventController.getEvents);
router.get("/api/event/:id", eventController.getEventById);

module.exports = router;
