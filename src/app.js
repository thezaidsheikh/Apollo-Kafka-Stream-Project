const express = require("express");
const bodyparser = require("body-parser");
const logger = require("morgan");
const app = express();

// Using bodyparser as a middleware in our app
app.use(bodyparser.json({ limit: "100mb", type: "application/json" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "100mb" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", false);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if ("OPTIONS" == req.method) return res.status(200).send();
  next();
});

app.use(logger("dev"));
app.use("../", express.static("public"));

// catch 404 and forward to error handler

module.exports = app;
