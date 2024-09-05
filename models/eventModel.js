const db = require("../config/dbConfig");

// Function to execute SQL queries
const executeSql = (query, params) => {
  return db.query(query, params).then(([results]) => results);
};

// Model methods
exports.getEvents = async (page, pageSize) => {
  const offset = page * pageSize;
  const query = `SELECT * FROM event_lists ORDER BY id LIMIT ? OFFSET ?`;
  return executeSql(query, [pageSize, offset]);
};

exports.getEventById = async (id) => {
  const query = `SELECT * FROM event_lists WHERE id = ?`;
  return executeSql(query, [id]);
};

exports.getEventSectionsById = async (id) => {
  const query = `SELECT section_name, price FROM sections WHERE event_id = ?`;
  const result = await executeSql(query, [id]);

  return {
    sections: result,
  };
};
