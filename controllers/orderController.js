const OrderModel = require("../models/orderModel");
const { processPayment } = require("../config/tapPayService");

exports.createOrder = async (req, res) => {
  try {
    const { orderNumber, prime, order, tickets } = req.body;
    const user_id = req.user.id; // Assuming req.user is populated from the auth middleware

    const payment_status = 0;
    const payment_message = "UNPAID";
    const total_price = tickets.reduce((acc, ticket) => acc + ticket.price, 0);

    // Create the order in the database
    const orderId = await OrderModel.createOrder(
      user_id,
      order_number,
      payment_status,
      payment_message,
      total_price
    );

    // Create tickets associated with this order
    for (const ticket of tickets) {
      await OrderModel.createTicket(
        orderId,
        ticket.event_id,
        ticket.seat_number,
        ticket.price
      );
    }

    // Process the payment with TapPay
    const paymentResult = await processPayment(prime, order);

    if (paymentResult.status === 0) {
      await OrderModel.updateOrderPayment(orderId, 1, "Payment successful");

      res.json({
        number: orderNumber,
        payment: {
          status: 1,
          message: "Payment successful",
        },
      });
    } else {
      await OrderModel.updateOrderPayment(orderId, 2, "Payment failed");

      res.status(400).json({
        error: true,
        message: "Payment failed: " + paymentResult.message,
      });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
};
