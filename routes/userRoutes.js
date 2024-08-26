//userRoutes
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../utils/tokenUtils");

router.post("/", userController.signUp);
router.put("/auth", userController.signIn);
router.get("/auth", verifyToken, userController.getUserInfo);
router.get("/profile", verifyToken, userController.getProfile);
router.put("/phone", verifyToken, userController.updatePhone);
router.put("/password", verifyToken, userController.updatePassword);
module.exports = router;
