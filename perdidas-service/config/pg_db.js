const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const { Pool } = require('pg');
const { logger } = require('../middleware/logger');

const pool = new Pool({
  host: process.env.PERDIDAS_DB_HOST,
  port: Number(process.env.PERDIDAS_DB_PORT),
  user: process.env.PERDIDAS_DB_USER,
  password: process.env.PERDIDAS_DB_PASSWORD,
  database: process.env.PERDIDAS_DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.fatal({
    error: {
      nombre: err.name,
      mensaje: err.message,
      stack: (process.env.LOG_LEVEL || '').toLowerCase() === 'debug' ? err.stack : undefined
    }
  }, 'Error inesperado en el pool');
  process.exit(-1);
});

module.exports = pool;
