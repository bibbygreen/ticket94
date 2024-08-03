// 載入express模組
const express = require("express");
// 建立Application 物件
const app = express();
app.use(express.static("static"));

//route
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/static/index.html");
});

app.get("/member", function (req, res) {
  res.sendFile(__dirname + "/static/index.html");
});

app.get("/error", function (req, res) {
  res.send("something wrong");
});

app.listen(8001, function () {
  console.log("server start running");
});
