//orderRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/tokenUtils");
const orderController = require("../controllers/orderController");

router.post("/orders", verifyToken, orderController.createOrder);
router.post("/orders/ibon", verifyToken, orderController.createIbonOrder);
router.get(
  "/orders/:orderNumber/seats",
  verifyToken,
  orderController.getOrderSeats
);
router.get(
  "/orders/:orderNumber",
  verifyToken,
  orderController.getOrderDetails
);

module.exports = router;
