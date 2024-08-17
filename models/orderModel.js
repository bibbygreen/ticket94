const db = require("../config/dbConfig");

exports.createOrder = async (
  user_id,
  order_number,
  payment_status,
  payment_message,
  total_price
) => {
  const insertOrderQuery = `
    INSERT INTO orders (user_id, order_number, payment_status, payment_message, total_price)
    VALUES (?, ?, ?, ?, ?)
  `;
  const result = await db.query(insertOrderQuery, [
    user_id,
    order_number,
    payment_status,
    payment_message,
    total_price,
  ]);
  return result.insertId;
};

exports.updateOrderPayment = async (id, payment_status, payment_message) => {
  const updateOrderQuery = `
    UPDATE orders
    SET payment_status = ?, payment_message = ?
    WHERE id = ?
  `;
  await db.query(updateOrderQuery, [payment_status, payment_message, id]);
};

exports.createTicket = async (order_id, event_id, seat_number, price) => {
  const insertTicketQuery = `
    INSERT INTO tickets (order_id, event_id, seat_number, price)
    VALUES (?, ?, ?, ?)
  `;
  await db.query(insertTicketQuery, [order_id, event_id, seat_number, price]);
};
