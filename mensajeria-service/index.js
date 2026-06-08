const express = require('express');
const cors = require('cors');
const pino = require('pino');
const pinoHttp = require('pino-http');
const pool = require('./db');

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const port = Number(process.env.MENSAJERIA_SERVICE_PORT) || 3006;

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  }
}));

app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', async (req, res) => {
  const result = await pool.query('SELECT NOW() AS fecha');
  res.json({
    servicio: 'mensajeria-service',
    estado: 'OK',
    fecha: result.rows[0].fecha
  });
});

app.post('/conversaciones', async (req, res) => {
  const { tipoReporte, reporteId, uIdDueno, uIdContacto } = req.body;

  if (!tipoReporte || !reporteId || !uIdDueno || !uIdContacto) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  if (uIdDueno === uIdContacto) {
    return res.status(400).json({ error: 'Los usuarios de la conversación deben ser distintos' });
  }

  const result = await pool.query(
    `INSERT INTO CONVERSACION (TIPO_REPORTE, REPORTE_ID, U_ID_DUENO, U_ID_CONTACTO)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ON CONSTRAINT uq_conversacion_participantes
     DO UPDATE SET CONV_ESTADO = CONVERSACION.CONV_ESTADO
     RETURNING *`,
    [tipoReporte, reporteId, uIdDueno, uIdContacto]
  );

  res.status(201).json(result.rows[0]);
});

app.get('/conversaciones/usuario/:uId', async (req, res) => {
  const { uId } = req.params;

  const result = await pool.query(
    `SELECT
       c.*,
       m.MSG_CONTENIDO AS ultimo_mensaje,
       m.MSG_FECHA AS ultimo_mensaje_fecha,
       m.U_ID_EMISOR AS ultimo_mensaje_emisor,
       COALESCE(n.no_leidos, 0) AS mensajes_no_leidos
     FROM CONVERSACION c
     LEFT JOIN LATERAL (
       SELECT MSG_CONTENIDO, MSG_FECHA, U_ID_EMISOR
       FROM MENSAJE
       WHERE CONV_ID = c.CONV_ID
       AND MSG_ESTADO = 1
       ORDER BY MSG_FECHA DESC
       LIMIT 1
     ) m ON true
     LEFT JOIN (
       SELECT CONV_ID, COUNT(*) AS no_leidos
       FROM MENSAJE
       WHERE U_ID_RECEPTOR = $1
       AND MSG_LEIDO = 2
       AND MSG_ESTADO = 1
       GROUP BY CONV_ID
     ) n ON n.CONV_ID = c.CONV_ID
     WHERE c.U_ID_DUENO = $1 OR c.U_ID_CONTACTO = $1
     ORDER BY COALESCE(m.MSG_FECHA, c.CONV_FECHA) DESC`,
    [uId]
  );

  res.json(result.rows);
});

app.get('/conversaciones/:convId/mensajes', async (req, res) => {
  const { convId } = req.params;

  const result = await pool.query(
    `SELECT *
     FROM MENSAJE
     WHERE CONV_ID = $1
     ORDER BY MSG_FECHA ASC`,
    [convId]
  );

  res.json(result.rows);
});

app.post('/mensajes', async (req, res) => {
  const { convId, uIdEmisor, msgContenido } = req.body;

  if (!convId || !uIdEmisor || !msgContenido) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const conversacionResult = await pool.query(
    `SELECT *
     FROM CONVERSACION
     WHERE CONV_ID = $1 AND CONV_ESTADO = 1`,
    [convId]
  );

  if (conversacionResult.rows.length === 0) {
    return res.status(404).json({ error: 'Conversación no encontrada o inactiva' });
  }

  const conversacion = conversacionResult.rows[0];

  if (uIdEmisor !== conversacion.u_id_dueno && uIdEmisor !== conversacion.u_id_contacto) {
    return res.status(400).json({ error: 'El emisor no pertenece a la conversación' });
  }

  const uIdReceptor = uIdEmisor === conversacion.u_id_dueno
    ? conversacion.u_id_contacto
    : conversacion.u_id_dueno;

  const result = await pool.query(
    `INSERT INTO MENSAJE (CONV_ID, U_ID_EMISOR, U_ID_RECEPTOR, MSG_CONTENIDO)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [convId, uIdEmisor, uIdReceptor, msgContenido]
  );

  res.status(201).json(result.rows[0]);
});

app.put('/mensajes/:msgId/leido', async (req, res) => {
  const { msgId } = req.params;

  const result = await pool.query(
    `UPDATE MENSAJE
     SET MSG_LEIDO = 1
     WHERE MSG_ID = $1
     RETURNING *`,
    [msgId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Mensaje no encontrado' });
  }

  res.json(result.rows[0]);
});

app.use((err, req, res, next) => {
  req.log.error(err);
  res.status(500).json({ error: 'Error interno del servicio de mensajería' });
});

app.listen(port, () => {
  logger.info(`mensajeria-service escuchando en puerto ${port}`);
});
