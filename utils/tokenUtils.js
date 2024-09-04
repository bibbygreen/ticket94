const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "2m",
  }); // Token expires in 1 hour
};

// 驗證 JWT 並將 payload 存入 req.user 的中間件
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization token is missing or invalid." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 驗證 token 並將解碼的 payload 存入 req.user
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next(); // 驗證成功，繼續處理請求
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = { generateToken, verifyToken };
