// 載入模組
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

// 建立Application 物件
const app = express();

app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // For parsing JSON bodies

// Import routes
const userRoutes = require("./routes/userRoutes");
const checkSeatsRoutes = require("./routes/checkSeatsRoutes");

// Use routes
app.use("/api/user", userRoutes);
app.use("/api", checkSeatsRoutes);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/static/index.html");
});

// app.get("/member", function (req, res) {
//   res.sendFile(__dirname + "/static/index.html");
// });

app.get("/error", function (req, res) {
  res.send("something wrong");
});

app.listen(8001, function () {
  console.log("server running on port 8001");
});
