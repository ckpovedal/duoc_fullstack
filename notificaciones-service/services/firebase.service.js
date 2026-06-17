const admin = require('firebase-admin');
const { logger } = require('../middleware/logger');

class FirebaseService {
  constructor() {
    this.inicializado = false;
  }

  inicializar() {
    if (this.inicializado || admin.apps.length > 0) {
      this.inicializado = true;
      return;
    }

    const credencial = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!credencial) {
      logger.warn('GOOGLE_APPLICATION_CREDENTIALS no esta configurado. Se guardaran notificaciones sin enviar push.');
      return;
    }

    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });

    this.inicializado = true;
  }

  async enviarATokens(tokens, payload) {
    this.inicializar();

    if (!this.inicializado) {
      return {
        enviado: false,
        total: tokens.length,
        exitosos: 0,
        fallidos: tokens.length,
        error: 'Firebase Admin no esta configurado'
      };
    }

    if (!tokens.length) {
      return {
        enviado: false,
        total: 0,
        exitosos: 0,
        fallidos: 0,
        error: 'No hay dispositivos activos'
      };
    }

    const mensajes = tokens.map((token) => ({
      token,
      notification: {
        title: payload.titulo,
        body: payload.cuerpo
      },
      data: this.normalizarData(payload.data || {})
    }));

    const resultado = await admin.messaging().sendEach(mensajes);

    return {
      enviado: resultado.successCount > 0,
      total: tokens.length,
      exitosos: resultado.successCount,
      fallidos: resultado.failureCount,
      error: resultado.failureCount > 0 ? 'Algunos tokens no recibieron la notificacion' : null
    };
  }

  normalizarData(data) {
    return Object.entries(data).reduce((resultado, [clave, valor]) => {
      resultado[clave] = String(valor ?? '');
      return resultado;
    }, {});
  }
}

module.exports = new FirebaseService();
