const db = require("../config/dbConfig");

exports.createOrder = async (
  userId,
  orderNumber,
  paymentStatus,
  paymentMessage,
  amount,
  paymentMethod
) => {
  const [orderResult] = await db.query(
    "INSERT INTO orders (user_id, order_number, ibon_number, payment_status, payment_message, total_price, payment_method) VALUES (?, ?, NULL, ?, ?, ?, ?)",
    [userId, orderNumber, paymentStatus, paymentMessage, amount, paymentMethod]
  );
  return orderResult.insertId;
};
