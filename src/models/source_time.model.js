"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const source_time_data = new Schema({
  sourceid: {
    type: String,
  },
  time: {
    type: Date,
  },
  day: {
    type: Number,
  },
  month: {
    type: Number,
  },
  sourcedata: {
    type: Object,
  },
  year: {
    type: String,
  },
  id: {
    type: Number,
  },
});

module.exports = mongoose.model(
  "source_time_data",
  source_time_data,
  "source_time_data"
);
