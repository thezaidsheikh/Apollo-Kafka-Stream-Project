"use strict";

const app = require("./app");
const config = require("./config");
const model = require("./models");
const seed = require("./seed");
const dotenv = require("dotenv");
const mongoose = require('mongoose');
dotenv.config();

let server = require("http").createServer(app);

const port = config.PORT;

mongoose.connect(config.BASE_URL);

server.listen(port,(error) => {
  if(error) {
    return console.log(err);
  }
  return console.log(`server is listening on ${port}`);
})
