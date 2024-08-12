const mysql = require("mysql2");
require("dotenv").config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "root",
//   database: process.env.DB_NAME || "ticket94",
//   port: 3306,
// });

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "ticket94",
  port: 3306,
});

const promisePool = pool.promise();

module.exports = promisePool;
