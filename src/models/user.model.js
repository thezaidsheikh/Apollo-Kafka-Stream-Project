"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const user = new Schema({
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    allowNull: false,
  },
  // login_type: {
  //   type: DataTypes.INTEGER,
  //   defaultValue: constant.SOCIALLOGIN.WEB,
  // },
  token: {
    type: String,
  },
  token_expiry: {
    type: Date,
  },
  isLogin: {
    type: Boolean,
    defaultValue: false,
  },
  isActive: {
    type: Boolean,
    defaultValue: true,
  },
  isValidate: {
    type: Boolean,
    defaultValue: false,
  },
  // social_id: {
  //   type: DataTypes.STRING,
  // },
});

module.exports = mongoose.model("user", user);
