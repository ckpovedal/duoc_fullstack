const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.HALLAZGOS_DB_HOST,
  port: Number(process.env.HALLAZGOS_DB_PORT),
  user: process.env.HALLAZGOS_DB_USER,
  password: process.env.HALLAZGOS_DB_PASSWORD,
  database: process.env.HALLAZGOS_DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool', err);
  process.exit(-1);
});

module.exports = pool;
