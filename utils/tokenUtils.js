const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;
// Function to generate a JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "1h",
  }); // Token expires in 1 hour
};

// Function to verify a JWT
const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

module.exports = { generateToken, verifyToken };
