// 載入express模組
const express = require("express");
// 建立Application 物件
const app = express();
app.use(express.static("static"));

//route
app.get("/", function (req, res) {});

app.get("/member", function (req, res) {
  res.render("index.html");
});

app.get("/error", function (req, res) {
  res.send("Hello Homepage");
});

app.listen(8001, function () {
  console.log("server start running");
});
