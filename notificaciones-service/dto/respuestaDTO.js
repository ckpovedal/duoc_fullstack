class RespuestaDTO {
  ok(respuesta = {}, mensaje = 'Operacion exitosa', codigo = 200) {
    return {
      estado: 'OK',
      codigo,
      mensaje,
      respuesta,
    };
  }
}

module.exports = RespuestaDTO;
