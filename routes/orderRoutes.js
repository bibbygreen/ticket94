const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/tokenUtils");
const db = require("../config/dbConfig");
const SeatModel = require("../models/seatModel");

function generateOrderNumber() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

router.post("/orders", verifyToken, async (req, res) => {
  const fetch = (await import("node-fetch")).default;
  const userId = req.user.id;
  const { prime, amount, cardholder } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount value");
  }

  if (
    !cardholder ||
    !cardholder.name ||
    !cardholder.email ||
    !cardholder.phone_number
  ) {
    throw new Error("Missing cardholder information");
  }

  const orderNumber = generateOrderNumber();
  const paymentMethod = "信用卡"; // 根據您使用的付款方式設置
  let paymentStatus = 0;
  let paymentMessage = "交易失敗";

  try {
    const tapPayData = {
      prime: req.body.prime,
      partner_key: process.env.PARTNER_KEY,
      merchant_id: process.env.MERCHANT_ID,
      details: "TapPay Test",
      amount: amount,
      cardholder: cardholder,
      remember: false,
    };
    //console.log("Sending TapPay Data:", tapPayData); // Log the data being sent

    // Make a request to TapPay
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
    //console.log("TapPay Response:", tapPayResult); // Log the full response for debugging
    if (tapPayResult.status === 0) {
      paymentStatus = 1; // 成功
      paymentMessage = "付款成功";
    } else {
      paymentMessage = `付款失敗: ${tapPayResult.msg}`;
    }
    // 儲存訂單資料到資料庫
    const [orderResult] = await db.query(
      "INSERT INTO orders (user_id, order_number, ibon_number, payment_status, payment_message, total_price, payment_method) VALUES (?, ?, NULL, ?, ?, ?, ?)",
      [
        userId,
        orderNumber,
        paymentStatus,
        paymentMessage,
        amount,
        paymentMethod,
      ]
    );

    const orderId = orderResult.insertId;

    // 儲存票務資訊
    for (const ticket of tickets) {
      await db.query(
        "INSERT INTO tickets (order_id, event_id, seat_id, price) VALUES (?, ?, ?, ?)",
        [orderId, ticket.eventId, ticket.seatId, ticket.price]
      );
    }
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
  //     // Check TapPay result and return the appropriate response
  //     if (tapPayResult.status === 0) {
  //       res.json({
  //         data: {
  //           number: orderNumber,
  //           payment: {
  //             status: 1,
  //             message: "付款成功",
  //           },
  //         },
  //       });
  //     } else {
  //       res.json({
  //         data: {
  //           number: orderNumber,
  //           payment: {
  //             status: 2,
  //             message: `付款失敗: ${tapPayResult.msg}`, // Include TapPay error message
  //           },
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error creating order:", error);
  //     res
  //       .status(500)
  //       .json({ error: true, message: `Unexpected error: ${error.message}` });
  //   }
});

module.exports = router;
