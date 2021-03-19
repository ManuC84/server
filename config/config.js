const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  connectionUrl: process.env.CONNECTION_URL,
};
