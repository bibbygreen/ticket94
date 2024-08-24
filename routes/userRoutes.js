//userRoutes
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../utils/tokenUtils");

router.post("/", userController.signUp);
router.put("/auth", userController.signIn);
router.get("/auth", verifyToken, userController.getUserInfo);

module.exports = router;
