"use strict";

let oauthserver = require("oauth2-server");

const Request = oauthserver.Request;
const Response = oauthserver.Response;
const userController = require("../controller/user.controller");

// Oauth login functionality
module.exports = (app, router) => {
  app.all("/login", function (req, res, next) {
    var request = new Request(req);
    var response = new Response(res);
    console.log("working");
    app.oauth
      .token(request, response)
      .then(function (token) {
        console.log("access token generated ====>", token);
        delete token.client;
        return res.json(token);
      })
      .catch(function (err) {
        return res.status(500).json(err);
      });
  });
};
