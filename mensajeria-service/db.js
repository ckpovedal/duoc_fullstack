const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env')
});

const pool = new Pool({
  host: process.env.MENSAJERIA_DB_HOST,
  port: Number(process.env.MENSAJERIA_DB_PORT),
  user: process.env.MENSAJERIA_DB_USER,
  password: process.env.MENSAJERIA_DB_PASSWORD,
  database: process.env.MENSAJERIA_DB_NAME
});

module.exports = pool;
