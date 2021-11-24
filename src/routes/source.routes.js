"use strict";

const constant = require("../constant");
const sourceController = require("../controller/source.controller");

module.exports = (app, router) => {
 
  // script for reading and writing file 
  router.route('/source-files').get((req,res) => {
    sourceController.getFile(req,(status,response) => {
      res.status(status).send(response)
    })
  })
};
