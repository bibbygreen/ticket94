const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");
const { verifyToken } = require("../utils/tokenUtils");

// 查詢資料庫的 API
router.get("/query", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // 從 token 中獲取 user_id

    if (!userId) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // 更新的資料庫查詢語句
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

    // 重構查詢結果，使其按照訂單號合併座位信息
    const orders = {};

    results.forEach((row) => {
      if (!orders[row.order_number]) {
        orders[row.order_number] = {
          eventName: row.eventName,
          date: row.date,
          time: row.time,
          location: row.location,
          order_number: row.order_number,
          payment_method: row.payment_method,
          ibon_number: row.ibon_number,
          payment_status: row.payment_status,
          payment_message: row.payment_message,
          total_price: row.total_price,
          created_time: row.created_time,
          seats: [],
        };
      }
      orders[row.order_number].seats.push({
        section_name: row.section_name,
        row_num: row.row_num,
        number: row.number,
        price: row.price,
      });
    });

    // 將結果轉換為數組格式
    const formattedResults = Object.values(orders);

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: "無法查詢資料庫" });
  }
});

module.exports = router;
