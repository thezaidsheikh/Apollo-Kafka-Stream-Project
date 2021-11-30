"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const source_depth_data = new Schema({
  depth: {
    type: Number,
  },
  id:{
    type: Number,
  },
  sourceid: {
    type: String,
  },
  sourcedata: {
    type: Object,
  },
});

module.exports = mongoose.model("source_depth_data", source_depth_data);
