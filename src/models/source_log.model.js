"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const source_log = new Schema({
  customer: {
    type: String,
  },
  log: {
    type: String,
  },
  well: {
    type: String,
  },
  wellbore: {
    type: String,
  },
  sourceid: {
    type: String,
  },
  end_depth: {
    type: String,
  },
  end_time: {
    type: Date,
  },
  laststatusupdate: {
    type: Date,
  },
  log_data: {
    type: String,
  },
  secondsdataavailability: {
    type: Boolean,
  },
  start_depth: {
    type: String,
  },
  start_time: {
    type: Date,
  },
  status: {
    type: String,
  },
  count: {
    type: Number,
  },
  mode: {
    type: String,
  },
  well_name: {
    type: String,
  },
  WellTimeZone: {
    type: String,
  },
  stdMnemonicsData: [{}],
});

module.exports = mongoose.model("source_log", source_log, "source_log");
