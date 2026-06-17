class AppError extends Error {
  constructor(message, codigo = 500) {
    super(message);
    this.codigo = codigo;
  }
}

module.exports = AppError;
