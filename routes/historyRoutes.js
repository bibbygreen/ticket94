const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");
const { verifyToken } = require("../utils/tokenUtils");

router.get(
  "/history/orders",
  verifyToken,
  historyController.getHistoryOrderInfo
);
module.exports = router;
