const express = require("express");
const bodyparser = require("body-parser");
const logger = require("morgan");
const oauthserver = require("oauth2-server");
const Request = oauthserver.Request;
const Response = oauthserver.Response;
const tokenValidity = require("./config").tokenValidity;
const app = express();

// Using bodyparser as a middleware in our app
app.use(bodyparser.json({ limit: "100mb", type: "application/json" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "100mb" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", false);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if ("OPTIONS" == req.method) return res.status(200).send();
  next();
});

app.oauth = new oauthserver({
  model: require("./oauth"),
  grants: ["password", "refresh_token"],
  accessTokenLifetime: tokenValidity,
  debug: true,
});

// oauth functionality for checking access token validity
app.authenticate = function (options) {
  return function (req, res, next) {
    let request = new Request(req);
    let response = new Response(res);
    return app.oauth
      .authenticate(request, response, options)
      .then(function (token) {
        res.locals.oauth = { token: token };
        next();
      })
      .catch(function (err) {
        console.log("error", err);
        res.status(err.code || 500).json(err);
      });
  };
};

const routes = require("./config/routes");
const router = express.Router();
routes(app, router);

app.use(logger("dev"));
app.use(router);
app.use("/", router);
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  console.log(err);
  res.status(err.code || 500);
  res.send(err);
});
app.use("../", express.static("public"));

// catch 404 and forward to error handler

module.exports = app;
