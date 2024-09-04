//historyController
const historyModel = require("../models/historyModel");

exports.getHistoryOrderInfo = async (req, res) => {
  try {
    const memberId = req.user.id;

    if (!memberId) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const results = await historyModel.fetchHistoryOrders(memberId);

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

    // Object.values(orders) 會將 orders 物件中所有的值取出來，並返回一個包含這些值的陣列。
    const formattedResults = Object.values(orders);

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).json({ error: true, message: "資料庫發生錯誤" });
  }
};
