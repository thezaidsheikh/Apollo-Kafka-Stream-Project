"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

const access_token = new Schema({
  token: {
    type: String,
  },
  expire_time: {
    type: Date,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'client'
  }
});

module.exports = mongoose.model('access_token', access_token);
