const mongoose = require("mongoose");
const login = new mongoose.Schema({
  code: String,
  createdAt: { type: Date, default: Date.now}
});

module.exports = mongoose.model("login", login);
