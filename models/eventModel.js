const pool = require("../config/dbConfig");

// Function to execute SQL queries
const executeSql = (query, params) => {
  return pool.query(query, params).then(([results]) => results);
};

// Model methods
const getEvents = async (page, pageSize) => {
  const offset = page * pageSize;
  const query = `SELECT * FROM event_lists ORDER BY id LIMIT ? OFFSET ?`;
  return executeSql(query, [pageSize, offset]);
};

const getEventById = async (id) => {
  const query = `SELECT * FROM event_lists WHERE id = ?`;
  return executeSql(query, [id]);
};

module.exports = {
  getEvents,
  getEventById,
};
