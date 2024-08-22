const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/tokenUtils"); // Adjust the path according to your project structure
// var fetch = require('node-fetch');

function generateOrderNumber() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

// API endpoint to create an order
router.post("/orders", async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    const token = req.headers.authorization.split(" ")[1];
    console.log("Token received:", token);

    const userInfo = verifyToken(token); // Use the verifyToken functionoded token
    const userId = userInfo.id;

    // Ensure the amount and cardholder are correctly received
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

    // Generate a random order number
    const orderNumber = generateOrderNumber();

    // Prepare TapPay data
    const tapPayData = {
      prime: req.body.prime,
      partner_key: process.env.PARTNER_KEY,
      merchant_id: process.env.MERCHANT_ID,
      details: "TapPay Test",
      amount: amount,
      cardholder: cardholder,
      remember: false,
    };
    console.log("Sending TapPay Data:", tapPayData); // Log the data being sent

    // Make a request to TapPay
    const tapPayResponse = await fetch(
      "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.TAPPAY_API_KEY,
        },
        body: JSON.stringify(tapPayData),
      }
    );

    const tapPayResult = await tapPayResponse.json();
    console.log("TapPay Response:", tapPayResult); // Log the full response for debugging

    // Check TapPay result and return the appropriate response
    if (tapPayResult.status === 0) {
      res.json({
        data: {
          number: orderNumber,
          payment: {
            status: 1,
            message: "付款成功",
          },
        },
      });
    } else {
      res.json({
        data: {
          number: orderNumber,
          payment: {
            status: 2,
            message: `付款失敗: ${tapPayResult.msg}`, // Include TapPay error message
          },
        },
      });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ error: true, message: `Unexpected error: ${error.message}` });
  }
});

module.exports = router;
