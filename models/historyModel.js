//historyModel
const db = require("../config/dbConfig");

exports.fetchHistoryOrders = async (userId) => {
  const query = `
    SELECT 
      event_lists.eventName,
      event_lists.date,
      event_lists.time,
      event_lists.location,
      orders.order_number,
      orders.payment_method,
      orders.ibon_number,
      orders.payment_status,
      orders.payment_message,
      orders.total_price,
      orders.created_time,
      sections.section_name,
      seating_rows.row_num,
      seats.seat_num AS number,
      sections.price
    FROM orders
    JOIN seats ON orders.order_number = seats.order_number
    JOIN seating_rows ON seats.row_id = seating_rows.id
    JOIN sections ON seating_rows.section_id = sections.id
    JOIN event_lists ON sections.event_id = event_lists.id
    WHERE orders.user_id = ?
    ORDER BY orders.created_time DESC
  `;

  const [results] = await db.execute(query, [userId]);
  return results;
};
