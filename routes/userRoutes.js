const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Sign Up
router.post("/", userController.signUp);

// Sign In
router.put("/auth", userController.signIn);

// Get User Info
router.get("/auth", userController.getUserInfo);

module.exports = router;
