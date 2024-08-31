//userController
const UserModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/tokenUtils");

// Sign Up
exports.signUp = async (req, res) => {
  const { name, email, phone, password } = req.body; //解構賦值
  ////不使用解構賦值的傳統寫法
  // const name = req.body.name;
  // const email = req.body.email;
  // const phone = req.body.phone;
  // const password = req.body.password;

  if (!name || !email || !phone || !password) {
    return res
      .status(400)
      .json({ error: true, message: "資料欄位填寫有誤或留白" });
  }

  try {
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ error: true, message: "此email帳號已註冊" });
    }

    const existingPhone = await UserModel.findUserByPhone(phone);
    if (existingPhone.length > 0) {
      return res.status(409).json({ error: true, message: "此手機號碼已註冊" });
    }

    await UserModel.createUser(name, email, phone, password);
    res.status(201).json({ message: "註冊成功" });
  } catch (error) {
    console.error("註冊時發生錯誤：", error);
    res.status(500).json({ error: true, message: "伺服器發生錯誤" });
  }
};

// Sign In
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: "請填寫所有欄位" });
  }

  try {
    const rows = await UserModel.findUserByEmail(email);

    if (rows.length === 0) {
      return res.status(401).json({ error: true, message: "您輸入的帳號有誤" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = generateToken(user);
      res.status(200).json({ message: "登入成功", token });
    } else {
      res.status(401).json({ error: true, message: "您輸入的密碼有誤" });
    }
  } catch (error) {
    console.error("登入時發生錯誤：", error);
    res.status(500).json({ error: true, message: "伺服器發生錯誤" });
  }
};

// New Get User Info
exports.getUserInfo = async (req, res) => {
  try {
    const email = req.user.email;
    const rows = await UserModel.getUserInfoByEmail(email);

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: "查無使用者帳號" });
    }

    const user = rows[0];
    res.status(200).json(user);
  } catch (error) {
    console.error("錯誤", error);
    res.status(500).json({ error: true, message: "伺服器發生錯誤" });
  }
};

// 取得會員個人資料
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// 更新手機號碼
exports.updatePhone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: true, message: "請填入手機號碼" });
    }

    await UserModel.updateUserPhone(userId, phone);
    res.json({ message: "手機號碼更新成功" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// 更新密碼
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.getUserById(userId);
    if (
      !user ||
      !(await UserModel.comparePassword(currentPassword, user.password))
    ) {
      return res
        .status(401)
        .json({ error: true, message: "Current password is incorrect" });
    }

    await UserModel.updateUserPassword(userId, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: true, message: error.message });
  }
};
