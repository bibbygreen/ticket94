//orderModel.js
const db = require("../config/dbConfig");

exports.createOrder = async (
  userId,
  orderNumber,
  ibonNumber,
  paymentStatus,
  paymentMessage,
  amount,
  paymentMethod
) => {
  const [orderResult] = await db.query(
    "INSERT INTO orders (user_id, order_number, ibon_number, payment_status, payment_message, total_price, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      userId,
      orderNumber,
      ibonNumber,
      paymentStatus,
      paymentMessage,
      amount,
      paymentMethod,
    ]
  );
  return orderResult.insertId;
};

exports.getOrderDetails = async (orderNumber) => {
  const sql = `
    SELECT order_number, payment_method, ibon_number, payment_status, payment_message, total_price 
    FROM orders 
    WHERE order_number = ?
  `;
  const [rows] = await db.query(sql, [orderNumber]);
  return rows[0];
};
