"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

let client = new Schema({
  clientId: {
    type: String,
  },
  clientSecret: {
    type: String,
  },
});

module.exports = mongoose.model("client", client);
