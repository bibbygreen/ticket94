//userModel
const bcrypt = require("bcryptjs");
const db = require("../config/dbConfig");

// Sign Up
exports.createUser = async (name, email, phone, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO members (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, email, phone, hashedPassword]
    );
    return result;
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

exports.findUserByEmail = async (email) => {
  try {
    const [rows] = await db.query("SELECT * FROM members WHERE email = ?", [
      email,
    ]);
    return rows;
  } catch (error) {
    throw new Error("Error finding user by email: " + error.message);
  }
};

exports.findUserByPhone = async (phone) => {
  try {
    const [rows] = await db.query("SELECT * FROM members WHERE phone = ?", [
      phone,
    ]);
    return rows;
  } catch (error) {
    throw new Error("Error finding user by phone: " + error.message);
  }
};

exports.getUserInfoByEmail = async (email) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone FROM members WHERE email = ?",
      [email]
    );
    return rows;
  } catch (error) {
    throw new Error("Error getting user info: " + error.message);
  }
};

// 取得會員資料
exports.getUserById = async (userId) => {
  const sql =
    "SELECT id, name, email, phone, password FROM members WHERE id = ?";
  const [rows] = await db.query(sql, [userId]);
  return rows[0];
};

// 更新手機號碼
exports.updateUserPhone = async (userId, phone) => {
  const sql = "UPDATE members SET phone = ? WHERE id = ?";
  return db.query(sql, [phone, userId]);
};

// 更新密碼
exports.updateUserPassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const sql = "UPDATE members SET password = ? WHERE id = ?";
  return db.query(sql, [hashedPassword, userId]);
};

// 比較密碼
exports.comparePassword = async (inputPassword, storedPassword) => {
  return bcrypt.compare(inputPassword, storedPassword);
};
