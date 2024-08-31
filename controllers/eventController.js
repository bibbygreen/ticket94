const eventModel = require("../models/eventModel");

exports.getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const PAGE_SIZE = 12;

    const result = await eventModel.getEvents(page, PAGE_SIZE);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "No matching events found" });
    }

    // Check if there are more pages
    const hasNextPage = result.length === PAGE_SIZE;
    const nextPage = hasNextPage ? page + 1 : null;

    const jsonResponse = { nextPage, data: result };
    res.json(jsonResponse);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params; // Get the event ID from the URL parameters
    const result = await eventModel.getEventById(id);

    if (result.length === 0) {
      return res.status(404).json({ error: true, message: "Event not found" });
    }

    const jsonResult = result[0]; // Only one event is expected
    res.json(jsonResult);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
