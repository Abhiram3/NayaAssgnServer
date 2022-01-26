const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require("./user.model");
db.project = require("./project.model.js")(mongoose);
db.board = require("./board.model.js")(mongoose);

module.exports = db;
