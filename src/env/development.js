'use strict';

module.exports = {
    database: {
        name     : 'isKillDB',
        host     : 'localhost',
        username : 'root',
        password : "zaidroot",
        port     : "3306"
    },
    PORT:2022,
    // BASE_URL:`http://localhost:${this.PORT}/api/`,
    BASE_URL:'mongodb://localhost:27017/appolo',
    tokenValidity:7200
}