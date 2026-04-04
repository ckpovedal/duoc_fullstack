class RespuestaDTO {
  constructor() {
    this.estado = 'OK';
    this.codigo = 200;
    this.mensaje = '';
    this.respuesta = {};

  }

  ok(data = {}, mensaje = '', codigo = 200) {
    this.estado = 'OK';
    this.codigo = codigo;
    this.mensaje = mensaje;
    this.respuesta = data;
    return this;
  }

  error(codigo = 500, mensaje = 'Error') {
    this.estado = 'ERROR';
    this.codigo = codigo;
    this.mensaje = mensaje;
    this.respuesta = {};
    return this;
  }
}

module.exports = RespuestaDTO;
