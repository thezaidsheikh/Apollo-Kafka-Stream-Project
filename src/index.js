"use strict";

const app = require("./app");
const config = require("./config");
const model = require("./models");
const seed = require("./seed");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const request = require("request");
const sourceController = require("./controller/source.controller");
dotenv.config();

let server = require("http").createServer(app);

const port = config.PORT;

mongoose.connect(config.BASE_URL);

const startInterval = server.listen(port, (error) => {
  if (error) {
    return console.log(err);
  }
  console.log(`server is listening on ${port}`);
  setInterval(() => {
    sourceController.getTimeFile();
  }, 1000);
  sourceController.createDepthFile();
});
