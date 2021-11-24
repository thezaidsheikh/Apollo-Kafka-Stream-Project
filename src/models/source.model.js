"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

const source_time_data = new Schema({
    id: {
      type: Number,
    },
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
        type:Object
    }
})

module.exports = mongoose.model("source_time_data",source_time_data);