const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/tokenUtils");
const orderController = require("../controllers/orderController");

router.post("/orders", verifyToken, orderController.createOrder);
router.get(
  "/orders/:orderNumber/seats",
  verifyToken,
  orderController.getOrderSeats
);
module.exports = router;
