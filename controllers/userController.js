const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../utils/tokenUtils");

// Sign Up
exports.signUp = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "資料欄位填寫有誤或留白" });
  }

  try {
    await userModel.createUser(name, email, phone, password);
    res.status(201).json({ message: "註冊成功" });
  } catch (error) {
    console.error("註冊時發生錯誤：", error);
    res.status(500).json({ error: "伺服器發生錯誤" });
  }
};

// Sign In
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "請填寫所有欄位" });
  }

  try {
    const rows = await userModel.findUserByEmail(email);

    if (rows.length === 0) {
      return res.status(401).json({ error: "您輸入的帳號有誤" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = generateToken(user);
      res.status(200).json({ message: "登入成功", token });
    } else {
      res.status(401).json({ error: "您輸入的密碼有誤" });
    }
  } catch (error) {
    console.error("登入時發生錯誤：", error);
    res.status(500).json({ error: "伺服器發生錯誤" });
  }
};

// Get User Info
exports.getUserInfo = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = verifyToken(token);
    const rows = await userModel.getUserInfoByEmail(decoded.email);

    if (rows.length === 0) {
      return res.status(404).json({ error: "查無使用者帳號" });
    }

    const user = rows[0];
    res.status(200).json(user);
  } catch (error) {
    console.error("錯誤", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
