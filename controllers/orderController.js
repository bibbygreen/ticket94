//orderController.js
const SeatModel = require("../models/seatModel");
const OrderModel = require("../models/orderModel");

function generateOrderNumber() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

function generateIbonNumber() {
  return Math.floor(
    1000000000000000 + Math.random() * 9000000000000000
  ).toString();
}

exports.createOrder = async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const userId = req.user.id;
    const { prime, amount, cardholder, seatIds } = req.body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid or missing seat IDs." });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid amount value" });
    }

    if (
      !cardholder ||
      !cardholder.name ||
      !cardholder.email ||
      !cardholder.phone_number
    ) {
      return res
        .status(400)
        .json({ error: true, message: "Missing cardholder information" });
    }

    const orderNumber = generateOrderNumber();
    const ibonNumber = null;
    const paymentMethod = "信用卡";
    let paymentStatus = 0;
    let paymentMessage = "交易失敗";

    const tapPayData = {
      prime: prime,
      partner_key: process.env.PARTNER_KEY,
      merchant_id: process.env.MERCHANT_ID,
      details: "TapPay Test",
      amount: amount,
      cardholder: cardholder,
      remember: false,
    };

    const tapPayResponse = await fetch(
      "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.PARTNER_KEY,
        },
        body: JSON.stringify(tapPayData),
      }
    );

    const tapPayResult = await tapPayResponse.json();
    if (tapPayResult.status === 0) {
      paymentStatus = 1; // 成功
      paymentMessage = "付款成功";
    } else {
      paymentMessage = `付款失敗: ${tapPayResult.msg}`;
    }

    const orderId = await OrderModel.createOrder(
      userId,
      orderNumber,
      ibonNumber,
      paymentStatus,
      paymentMessage,
      amount,
      paymentMethod
    );

    // 檢查和保留座位
    const heldSeats = await SeatModel.checkSeatsStatus(seatIds);

    if (heldSeats.length !== seatIds.length) {
      return res
        .status(400)
        .json({ error: "Some seats are no longer available." });
    }

    await SeatModel.reserveSeats(seatIds, orderNumber);

    res.json({
      data: {
        number: orderNumber,
        payment: {
          status: paymentStatus,
          message: paymentMessage,
        },
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ error: true, message: `Unexpected error: ${error.message}` });
  }
};

exports.createIbonOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { seatIds, amount } = req.body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid or missing seat IDs." });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid amount value" });
    }

    const orderNumber = generateOrderNumber();
    const ibonNumber = generateIbonNumber();
    const paymentMethod = "ibon付款";
    const paymentStatus = 0;
    const paymentMessage = "待繳費";

    // 檢查座位狀態並保留座位
    const heldSeats = await SeatModel.checkSeatsStatus(seatIds);
    if (heldSeats.length !== seatIds.length) {
      return res
        .status(400)
        .json({ error: "Some seats are no longer available." });
    }

    // 更新座位狀態為 T，並設定 hold_expire_at
    const holdExpireAt = new Date(Date.now() + 60 * 60 * 1000); // 當前時間 + 1 小時

    await SeatModel.holdSeatsWithExpiration(
      seatIds,
      userId,
      holdExpireAt,
      orderNumber
    );

    // 創建訂單並儲存到資料庫
    const orderId = await OrderModel.createOrder(
      userId,
      orderNumber,
      ibonNumber,
      paymentStatus,
      paymentMessage,
      amount,
      paymentMethod
    );

    res.json({
      data: {
        orderId,
        number: orderNumber,
        ibonNumber,
        payment: {
          status: paymentStatus,
          message: paymentMessage,
        },
      },
    });
  } catch (error) {
    console.error("Error creating ibon order:", error);
    res
      .status(500)
      .json({ error: true, message: `Unexpected error: ${error.message}` });
  }
};

exports.getOrderSeats = async (req, res) => {
  const { orderNumber } = req.params;
  try {
    const seats = await SeatModel.getSeatsByOrderNumber(orderNumber);
    if (seats.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "No seats found for this order." });
    }
    res.json({ seats });
  } catch (error) {
    console.error("Error fetching seats:", error);
    res.status(500).json({ error: true, message: "Failed to fetch seats." });
  }
};

exports.getOrderDetails = async (req, res) => {
  const { orderNumber } = req.params;
  try {
    const orderDetails = await OrderModel.getOrderDetails(orderNumber);
    const seats = await SeatModel.getSeatsByOrderNumber(orderNumber);
    if (!orderDetails || seats.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Order not found or no seats found." });
    }
    res.json({
      order: orderDetails,
      seats: seats,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res
      .status(500)
      .json({ error: true, message: "Failed to fetch order details." });
  }
};
