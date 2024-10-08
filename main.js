// 載入模組
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./utils/seatCleaner");

// 建立Application 物件
const app = express();

// 配置 CORS
const corsOptions = {
  origin: "*", // 允許所有來源訪問，根據需要可以修改為特定的域名
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // 使用 cors 中間件

// app.use(express.static("static"));
app.use(express.static(__dirname + "/static"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // For parsing JSON bodies

// Import routes
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const seatRoutes = require("./routes/seatRoutes");
const orderRoutes = require("./routes/orderRoutes");
const historyRoutes = require("./routes/historyRoutes");

// Use routes
app.use("/api", userRoutes);
app.use("/api", eventRoutes);
app.use("/api", seatRoutes);
app.use("/api", orderRoutes);
app.use("/api", historyRoutes);
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.get("/loaderio-784b0f7ef89615181f4a079f5395d350.html", function (req, res) {
  res.send("loaderio-784b0f7ef89615181f4a079f5395d350");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/static/index.html");
});

app.get("/signin", (req, res) => {
  res.sendFile(__dirname + "/static/signin.html");
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/static/signup.html");
});

app.get("/event/:id", function (req, res) {
  res.sendFile(__dirname + "/static/event.html");
});

app.get("/area/:id", function (req, res) {
  res.sendFile(__dirname + "/static/area.html");
});

app.get("/checkout/:id", function (req, res) {
  res.sendFile(__dirname + "/static/checkout.html");
});

app.get("/booking/:id", function (req, res) {
  res.sendFile(__dirname + "/static/booking.html");
});

app.get("/profile", function (req, res) {
  res.sendFile(__dirname + "/static/profile.html");
});

app.get("/history", function (req, res) {
  res.sendFile(__dirname + "/static/history.html");
});

app.get("/error", function (req, res) {
  res.send("something wrong");
});

app.listen(8001, function () {
  console.log("server running on port 8001");
});
