// seatModel.js
const db = require("../config/dbConfig");

exports.findAvailableSeats = (sectionId, numSeats) => {
  const sql = `SELECT * FROM seats WHERE status = 'V' AND row_id IN (SELECT id FROM seating_rows WHERE section_id = ?) LIMIT ?`;
  return db.query(sql, [sectionId, parseInt(numSeats)]);
};

exports.holdSeats = (seatIds) => {
  const sql = `UPDATE seats SET status = 'T', hold_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id IN (?) AND status = 'V'`;
  return db.query(sql, [seatIds]);
};

exports.releaseSeats = (seatIds) => {
  const sql = `UPDATE seats SET status = 'V', hold_expires_at = NULL WHERE id IN (?) AND status = 'T'`;
  return db.query(sql, [seatIds]);
};

exports.reserveSeats = (seatIds) => {
  const sql = `UPDATE seats SET status = 'R', hold_expires_at = NULL WHERE id IN (?) AND status = 'T'`;
  return db.query(sql, [seatIds]);
};
