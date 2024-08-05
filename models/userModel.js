const promisePool = require("../config/dbConfig");
const bcrypt = require("bcryptjs");

// Sign Up
exports.createUser = async (name, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await promisePool.query(
      "INSERT INTO members (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    return result;
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

// Find User by Email
exports.findUserByEmail = async (email) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM members WHERE email = ?",
      [email]
    );
    return rows;
  } catch (error) {
    throw new Error("Error finding user by email: " + error.message);
  }
};

// Get User Info
exports.getUserInfoByEmail = async (email) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT id, name, email FROM members WHERE email = ?",
      [email]
    );
    return rows;
  } catch (error) {
    throw new Error("Error getting user info: " + error.message);
  }
};
