// 載入模組
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./utils/seatCleaner");

// 建立Application 物件
const app = express();

// app.use(express.static("static"));
app.use(express.static(__dirname + "/static"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // For parsing JSON bodies

// Import routes
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const areaRoutes = require("./routes/areaRoutes");
const seatRoutes = require("./routes/seatRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Use routes
app.use("/api/user", userRoutes);
app.use("/", eventRoutes);
app.use("/api", areaRoutes);
app.use("/api", seatRoutes);
app.use("/api", orderRoutes);

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

app.get("/error", function (req, res) {
  res.send("something wrong");
});

app.listen(8001, function () {
  console.log("server running on port 8001");
});
