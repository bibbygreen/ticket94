const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/", userController.signUp);
router.put("/auth", userController.signIn);
router.get("/auth", userController.getUserInfo);

module.exports = router;
