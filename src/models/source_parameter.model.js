"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const source_parameter = new Schema({
  parameter: {
    type: String,
  },
  sourceid: {
    type: String,
  },
  std_mnemonic: {
    type: String,
  },
  description: {
    type: String,
  },
  source: {
    type: String,
  },
  std_mnemonic_displayname: {
    type: String,
  },
  std_unit: {
    type: String,
  },
  type: {
    type: String,
  },
  unit: {
    type: String,
  },
});

module.exports = mongoose.model(
  "source_parameter",
  source_parameter,
  "source_parameter"
);
