// seatModel.js
const db = require("../config/dbConfig");

exports.checkAvailableSeats = async (area, quantityNumber) => {
  try {
    const [seats] = await db.query(
      `SELECT seats.id, seats.seat_num AS number, seating_rows.row_num AS row_num, sections.price
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

// exports.holdSeats = (seatIds) => {
//   const sql = `UPDATE seats SET status = 'T', hold_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id IN (?) AND status = 'V'`;
//   return db.query(sql, [seatIds]);
// };
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
