"use strict";

const app = require("./app");
const config = require("./config");
const model = require("./models");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const depthController = require("./controller/depth.controller");
const timeController = require("./controller/time.controller");
const secController = require("./controller/sec.controller");
dotenv.config();

let server = require("http").createServer(app);

const port = config.PORT;

mongoose.connect(config.BASE_URL);

const startInterval = server.listen(port, (error) => {
  if (error) {
    return console.log(err);
  }
  console.log(`server is listening on ${port}`);
  depthController.initializeDepth();
  timeController.initializeTime();
  secController.initializeSecTime();
});
