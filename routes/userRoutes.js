//userRoutes
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../utils/tokenUtils");

router.post("/users", userController.signUp);
router.put("/auth", userController.signIn);
router.get("/users/me", verifyToken, userController.getUserInfo);
router.put("/users/me/phone", verifyToken, userController.updatePhone);
router.put("/users/me/password", verifyToken, userController.updatePassword);
module.exports = router;
