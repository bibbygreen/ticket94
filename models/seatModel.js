// seatModel.js
const db = require("../config/dbConfig");

exports.checkAvailableSeats = async (area, quantityNumber) => {
  try {
    const [seats] = await db.query(
      `SELECT seats.id, seats.seat_num AS number, seating_rows.row_num AS row_num, sections.price, sections.event_id
      FROM seats
      JOIN seating_rows ON seats.row_id = seating_rows.id
      JOIN sections ON seating_rows.section_id = sections.id
      WHERE sections.section_name = ?
      AND seats.status = 'V'
      LIMIT ?`,
      [area, quantityNumber]
    );
    return seats;
  } catch (error) {
    throw new Error("Database query failed: " + error.message);
  }
}; //seatController.getAvailableSeats

exports.holdSeats = async (seatIds, memberId) => {
  try {
    if (!seatIds || seatIds.length === 0) {
      throw new Error("No seats selected.");
    }

    const placeholders = seatIds.map(() => "?").join(", ");
    const sql = `UPDATE seats 
                 SET status = 'T', 
                     member_id = ?, 
                     hold_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE) 
                 WHERE id IN (${placeholders}) AND status = 'V'`;

    // console.log("With memberId:", memberId, "and seatIds:", seatIds);

    const [results] = await db.query(sql, [memberId, ...seatIds]);

    return results;
  } catch (error) {
    console.error("Error executing SQL:", error);
    throw error;
  }
}; //seatController.holdSeats

exports.releaseSeats = (memberId) => {
  const sql = `UPDATE seats SET status = 'V', member_id = NULL, hold_expires_at = NULL WHERE member_id = ? AND status = 'T'`;
  return db.query(sql, [memberId]);
}; //seatController.cancelHold

exports.reserveSeats = (seatIds, orderNumber) => {
  const sql = `UPDATE seats SET status = 'R', hold_expires_at = NULL, order_number = ? WHERE id IN (?) AND status = 'T'`;
  return db.query(sql, [orderNumber, seatIds]);
}; //orderController.createOrder

exports.checkSeatsStatus = async (seatIds) => {
  const sql = `SELECT id FROM seats WHERE id IN (?) AND status = 'T'`;
  const [seats] = await db.query(sql, [seatIds]);
  return seats;
}; //orderController.createOrder

exports.getLockedSeatsByMemberId = async (memberId) => {
  try {
    const sql = `
      SELECT seats.id, seats.seat_num AS number, seating_rows.row_num AS row_num, sections.section_name, sections.price, sections.event_id, seats.hold_expires_At
      FROM seats
      JOIN seating_rows ON seats.row_id = seating_rows.id
      JOIN sections ON seating_rows.section_id = sections.id
      WHERE seats.member_id = ? AND seats.status = 'T'
    `;
    const [lockedSeats] = await db.query(sql, [memberId]);
    return lockedSeats;
  } catch (error) {
    throw new Error("Database query failed: " + error.message);
  }
}; //seatController.cancelHold 以使用者id獲得暫時保留的座位info

exports.releaseTempSeatsByMember = async () => {
  const sqlTempHold = `
    UPDATE seats
    SET status = 'V', member_id = NULL, hold_expires_at = NULL, order_number = NULL
    WHERE status = 'T' AND hold_expires_at < NOW() AND id BETWEEN 1 AND 1000000;
  `;

  try {
    const [result] = await db.query(sqlTempHold);
    return result.affectedRows; // 返回被更新的行數
  } catch (error) {
    console.error("Error releasing temporary hold seats:", error);
    throw new Error("Failed to release temporary hold seats");
  }
}; //utils.seatCleaner

exports.releaseIbonSeatsByMember = async () => {
  const sqlUpdateOrders = `
    UPDATE orders
    SET payment_status = 2, payment_message = '逾時繳費，訂單不成立'
    WHERE order_number IN (
      SELECT DISTINCT order_number
      FROM seats
      WHERE status = 'I' AND hold_expires_at < NOW()
    );
  `;

  const sqlUpdateIbonSeats = `
    UPDATE seats
    SET status = 'V', member_id = NULL, hold_expires_at = NULL, order_number = NULL
    WHERE status = 'I' AND hold_expires_at < NOW() AND id BETWEEN 1 AND 1000000;
  `;

  try {
    await db.query("START TRANSACTION");

    const [resultOrders] = await db.query(sqlUpdateOrders);
    const [resultSeats] = await db.query(sqlUpdateIbonSeats);

    await db.query("COMMIT");

    console.log(
      `Released ${resultSeats.affectedRows} expired ibon hold seats.`
    );
    console.log(
      `Updated ${resultOrders.affectedRows} orders to payment status 2.`
    );

    return {
      seats: resultSeats.affectedRows,
      orders: resultOrders.affectedRows,
    };
  } catch (error) {
    await db.query("ROLLBACK");
    console.error(
      "Error releasing intermediate hold seats and updating orders:",
      error
    );
    throw new Error(
      "Failed to release intermediate hold seats and update orders"
    );
  }
}; //utils.seatCleaner 刪除ibon保留的過期座位

exports.findSeatIdsByDetails = async (area, seats) => {
  try {
    const seatIds = [];
    for (const seat of seats) {
      console.log(
        `Querying seat for area: ${area}, row: ${seat.row}, number: ${seat.number}`
      );
      const sql = `
        SELECT seats.id 
        FROM seats
        JOIN seating_rows ON seats.row_id = seating_rows.id
        JOIN sections ON seating_rows.section_id = sections.id
        WHERE sections.section_name = ? 
          AND seating_rows.row_num = ? 
          AND seats.seat_num = ?
      `;
      const [result] = await db.query(sql, [seat.area, seat.row, seat.number]);
      if (result.length > 0) {
        seatIds.push(result[0].id);
      } else {
        console.error(
          `No seat found for area: ${seat.area}, row: ${seat.row}, number: ${seat.number}`
        );
      }
    }
    return seatIds;
  } catch (error) {
    console.error("Database query failed:", error.message);
    throw new Error("Database query failed: " + error.message);
  }
}; //seatController.getSeatIds

exports.getSeatsByOrderNumber = async (orderNumber) => {
  const sql = `
    SELECT sections.section_name, seating_rows.row_num, seats.seat_num AS number, sections.price
    FROM seats
    JOIN seating_rows ON seats.row_id = seating_rows.id
    JOIN sections ON seating_rows.section_id = sections.id
    WHERE seats.order_number = ?
  `;
  try {
    const [seats] = await db.query(sql, [orderNumber]);
    return seats;
  } catch (error) {
    throw new Error("Failed to fetch seats: " + error.message);
  }
}; //orderController.getOrderSeats, orderController.getOrderDetails

exports.holdSeatsWithExpiration = (
  seatIds,
  memberId,
  holdExpireAt,
  orderNumber
) => {
  const sql = `
    UPDATE seats 
    SET status = 'I',
        member_id = ?, 
        hold_expires_at = ?, 
        order_number = ?
    WHERE id IN (?) AND status = 'T'
  `;
  return db.query(sql, [memberId, holdExpireAt, orderNumber, seatIds]);
}; //orderController.createIbonOrder

exports.seatIdforSeatDiagramByEventId = async (eventId) => {
  const sql = `
  SELECT seats.id, seats.status
  FROM seats
  INNER JOIN seating_rows ON seats.row_id = seating_rows.id
  INNER JOIN sections ON seating_rows.section_id = sections.id
  WHERE sections.event_id = ?;
  `;

  try {
    const [results] = await db.query(sql, [eventId]);
    return results;
  } catch (error) {
    console.error("Error fetching seat data:", error);
    throw error;
  }
}; //seatController.getSeatsForEvent

exports.getHeldSeatsDetails = async (seatIds) => {
  const placeholders = seatIds.map(() => "?").join(", ");

  const sql = `
    SELECT s.id, s.seat_num AS number, sr.row_num, sec.section_name, sec.price
    FROM seats s
    INNER JOIN seating_rows sr ON s.row_id = sr.id
    INNER JOIN sections sec ON sr.section_id = sec.id
    WHERE s.id IN (${placeholders});
  `;

  try {
    const [results] = await db.query(sql, seatIds);
    return results;
  } catch (error) {
    console.error("Error fetching held seats details:", error);
    throw error;
  }
}; //orderController.getOrderDetails
