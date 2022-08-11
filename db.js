/** Database config for database. */


const { Client } = require("pg");
const {DB_URI} = require("./config");
const password = require("./password");

let db = new Client({
  connectionString: DB_URI
});
db.password = password;
db.connect();


module.exports = db;
