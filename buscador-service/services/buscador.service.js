const perdidasClient = require('../clients/perdidas.clients');
const hallazgosClient = require('../clients/hallazgos.clients');
const AppError = require('../utils/AppError');

class BuscadorService {
  async buscarCoincidencias(perdidaId) {
    const perdidaBase = await perdidasClient.obtenerPerdidaPorId(perdidaId);

    if (!perdidaBase) {
      throw new AppError('Perdida no encontrada', 404);
    }

    return this.buscarCoincidenciasDesdePerdida(perdidaBase);
  }

  async buscarCoincidenciasPorParametros(parametros) {
    const perdidaBase = this.construirPerdidaBase(parametros);

    if (!this.tieneParametrosBusqueda(perdidaBase)) {
      throw new AppError('Debe enviar al menos un parametro de busqueda', 400);
    }

    return this.buscarCoincidenciasDesdePerdida(perdidaBase);
  }

  async buscarCoincidenciasDesdePerdida(perdidaBase) {
    const hallazgos = await hallazgosClient.listarHallazgos();

    const coincidencias = hallazgos
      .map((hallazgo) => this.construirCoincidencia(perdidaBase, hallazgo))
      .filter((item) => item.puntaje > 0)
      .sort((a, b) => b.puntaje - a.puntaje);

    return {
      perdidaBase,
      total: coincidencias.length,
      coincidencias,
    };
  }

  construirPerdidaBase(parametros) {
    return {
      p_tipo: this.obtenerParametro(parametros, 'tipo', 'p_tipo'),
      p_comuna: this.obtenerParametro(parametros, 'comuna', 'p_comuna'),
      p_region: this.obtenerParametro(parametros, 'region', 'p_region'),
      p_fecha: this.obtenerParametro(parametros, 'fecha', 'p_fecha'),
      p_genero: this.obtenerParametro(parametros, 'genero', 'p_genero'),
      p_fisica: this.obtenerParametro(parametros, 'fisica', 'descripcion', 'descripcionFisica', 'p_fisica'),
      p_nom_masc: this.obtenerParametro(parametros, 'nombre', 'nombreMascota', 'p_nom_masc'),
    };
  }

  obtenerParametro(parametros, ...nombres) {
    const nombreEncontrado = nombres.find((nombre) => {
      const valor = parametros[nombre];
      return valor !== undefined && valor !== null && String(Array.isArray(valor) ? valor[0] : valor).trim() !== '';
    });

    if (!nombreEncontrado) {
      return null;
    }

    const valor = parametros[nombreEncontrado];

    if (Array.isArray(valor)) {
      return String(valor[0]).trim();
    }

    return String(valor).trim();
  }

  tieneParametrosBusqueda(perdidaBase) {
    return Object.values(perdidaBase).some((valor) => valor !== null && valor !== undefined && String(valor).trim() !== '');
  }

  construirCoincidencia(perdidaBase, hallazgoComparado) {
    const criterios = [];
    let puntaje = 0;

    if (this.valoresIguales(perdidaBase.p_tipo, hallazgoComparado.h_tipo)) {
      puntaje += 30;
      criterios.push('mismo tipo');
    }

    if (this.valoresIguales(perdidaBase.p_comuna, hallazgoComparado.h_comuna)) {
      puntaje += 25;
      criterios.push('misma comuna');
    }

    if (this.valoresIguales(perdidaBase.p_region, hallazgoComparado.h_region)) {
      puntaje += 15;
      criterios.push('misma region');
    }

    if (this.fechasCercanas(perdidaBase.p_fecha, hallazgoComparado.h_fecha)) {
      puntaje += 10;
      criterios.push('fecha cercana');
    }

    if (this.valoresIguales(perdidaBase.p_genero, hallazgoComparado.h_genero)) {
      puntaje += 10;
      criterios.push('mismo genero');
    }

    if (this.textosParecidos(perdidaBase.p_fisica, hallazgoComparado.h_fisica)) {
      puntaje += 10;
      criterios.push('descripcion fisica similar');
    }

    if (this.valoresIguales(perdidaBase.p_nom_masc, hallazgoComparado.h_nom_masc)) {
      puntaje += 5;
      criterios.push('mismo nombre');
    }

    return {
      hallazgo: hallazgoComparado,
      puntaje,
      nivel: this.obtenerNivel(puntaje),
      criterios,
    };
  }

  valoresIguales(valorBase, valorComparado) {
    if (valorBase === undefined || valorBase === null || valorComparado === undefined || valorComparado === null) {
      return false;
    }

    return String(valorBase).trim().toLowerCase() === String(valorComparado).trim().toLowerCase();
  }

  textosParecidos(textoBase, textoComparado) {
    if (!textoBase || !textoComparado) {
      return false;
    }

    const palabrasBase = this.obtenerPalabrasClave(textoBase);
    const palabrasComparadas = this.obtenerPalabrasClave(textoComparado);
    const coincidencias = palabrasBase.filter((palabra) => palabrasComparadas.includes(palabra));

    return coincidencias.length >= 2;
  }

  obtenerPalabrasClave(texto) {
    return String(texto)
      .toLowerCase()
      .split(/\W+/)
      .filter((palabra) => palabra.length >= 4);
  }

  fechasCercanas(fecha1, fecha2) {
    if (!fecha1 || !fecha2) {
      return false;
    }

    const a = new Date(fecha1).getTime();
    const b = new Date(fecha2).getTime();

    if (Number.isNaN(a) || Number.isNaN(b)) {
      return false;
    }

    const diferenciaDias = Math.abs(a - b) / (1000 * 60 * 60 * 24);

    return diferenciaDias <= 7;
  }

  obtenerNivel(puntaje) {
    if (puntaje >= 60) {
      return 'ALTA';
    }

    if (puntaje >= 30) {
      return 'MEDIA';
    }

    return 'BAJA';
  }
}

module.exports = new BuscadorService();
