'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

  const refresh_token = new Schema({
    token: {
      type: String,
    },
    expire_time: {
      type: String,
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

  module.exports = mongoose.model('refresh_token', refresh_token);
