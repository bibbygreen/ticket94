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
};

exports.holdSeats = (seatIds, memberId) => {
  const sql = `UPDATE seats 
               SET status = 'T', 
                   member_id = ?, 
                   hold_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE) 
               WHERE id IN (?) AND status = 'V'`;
  return db.query(sql, [memberId, seatIds]);
};

exports.releaseSeats = (seatIds) => {
  const sql = `UPDATE seats SET status = 'V', member_id = NULL, hold_expires_at = NULL WHERE id IN (?) AND status = 'T'`;
  return db.query(sql, [seatIds]);
};

exports.reserveSeats = (seatIds) => {
  const sql = `UPDATE seats SET status = 'R', hold_expires_at = NULL WHERE id IN (?) AND status = 'T'`;
  return db.query(sql, [seatIds]);
};

exports.checkSeatsStatus = async (seatIds) => {
  const sql = `SELECT id FROM seats WHERE id IN (?) AND status = 'T'`;
  const [seats] = await db.query(sql, [seatIds]);
  return seats;
};

exports.getLockedSeatsByMemberId = async (memberId) => {
  try {
    const sql = `
      SELECT seats.id, seats.seat_num AS number, seating_rows.row_num AS row_num, sections.section_name, sections.price, sections.event_id
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
};

exports.getExpiredSeats = async () => {
  const sql = `
    SELECT id, member_id FROM seats
    WHERE status = 'T' AND hold_expires_at < NOW()
  `;
  const [seats] = await db.query(sql);
  return seats;
};

exports.releaseSeatsByMember = async () => {
  const sql = `
    UPDATE seats
    SET status = 'V', member_id = NULL, hold_expires_at = NULL
    WHERE status = 'T' AND hold_expires_at < NOW()
  `;
  return db.query(sql);
};

exports.findSeatIdsByDetails = async (area, seats) => {
  try {
    const seatIds = [];
    for (const seat of seats) {
      console.log(
        `Querying seat for area: ${area}, row: ${seat.row}, number: ${seat.number}`
      ); // 調試輸出
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
        ); // 錯誤情況下的輸出
      }
    }
    return seatIds;
  } catch (error) {
    console.error("Database query failed:", error.message); // 詳細打印數據庫錯誤
    throw new Error("Database query failed: " + error.message);
  }
};
