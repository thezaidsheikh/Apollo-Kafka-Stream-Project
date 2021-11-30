const model = require("./models");
const constant = require("./constant");
const axios = require("axios");

module.exports = (function () {
  let db = model;

  db["user"]
    .findOne({ email: "admin@gmail.com" })
    .then((admin) => {
      if (!admin) {
        Promise.all([
          db["user"].create({
            email: "admin@gmail.com",
            password: "admin123",
            scope: constant.SCOPE.ADMIN,
            role: constant.ROLE.ADMIN,
          }),
        ])
          .then(console.log)
          .catch(console.log);
      }
      db["client"].findOne({ clientId: "APPOLOCLIENT" }).then((client) => {
        if (!client) {
          Promise.all([
            db["client"].create({
              clientId: "APPOLOCLIENT",
              clientSecret: "APPOLO123",
            }),
          ]);
        }
      });
    })
    .catch(console.log);
})();
