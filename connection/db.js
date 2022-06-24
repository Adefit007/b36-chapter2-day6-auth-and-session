const { Pool } = require("pg");

const dbPool = new Pool({
  database: "b36_personal_web",
  port: 5432,
  user: "postgres",
  password: "password",
});

module.exports = dbPool;
