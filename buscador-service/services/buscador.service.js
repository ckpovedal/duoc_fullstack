const perdidasClient = require('../clients/perdidas.clients');
const hallazgosClient = require('../clients/hallazgos.clients');
const AppError = require('../utils/AppError');
const { logger } = require('../middleware/logger');

class BuscadorService {
  async buscarCoincidencias(perdidaId) {
    logger.debug({ perdidaId }, 'Buscando coincidencias por perdida');

    const perdidaBase = await perdidasClient.obtenerPerdidaPorId(perdidaId);

    if (!perdidaBase) {
      throw new AppError('Perdida no encontrada', 404);
    }

    return this.buscarCoincidenciasDesdePerdida(perdidaBase);
  }

  async buscarCoincidenciasPorParametros(parametros) {
    const textoBusqueda = this.obtenerParametro(parametros, 'texto', 'busqueda', 'q');
    const perdidaBase = this.construirPerdidaBase(parametros);

    if (!this.tieneParametrosBusqueda(perdidaBase) && !textoBusqueda) {
      throw new AppError('Debe enviar al menos un parametro de busqueda', 400);
    }

    logger.debug({
      tieneTexto: Boolean(textoBusqueda),
      filtros: Object.keys(parametros || {})
    }, 'Buscando coincidencias por parametros');

    return this.buscarCoincidenciasDesdePerdida(perdidaBase, textoBusqueda);
  }

  async buscarCoincidenciasDesdePerdida(perdidaBase, textoBusqueda = null) {
    const [hallazgos, perdidas] = await Promise.all([
      hallazgosClient.listarHallazgos(),
      perdidasClient.listarPerdidas(),
    ]);

    const coincidenciasHallazgos = hallazgos
      .map((hallazgo) => this.construirCoincidencia(perdidaBase, hallazgo, textoBusqueda, 'HALLADO', hallazgo));

    const coincidenciasPerdidas = perdidas
      .filter((perdida) => !perdidaBase.p_id || String(perdida.p_id) !== String(perdidaBase.p_id))
      .map((perdida) => this.construirCoincidencia(perdidaBase, this.adaptarPerdida(perdida), textoBusqueda, 'PERDIDO', perdida));

    const coincidencias = [...coincidenciasHallazgos, ...coincidenciasPerdidas]
      .filter((item) => item.puntaje > 0)
      .sort((a, b) => b.puntaje - a.puntaje)
      .map((item) => ({
        reporte: item.reporte,
        hallazgo: item.hallazgo,
        perdida: item.perdida,
        tipoReporte: item.tipoReporte,
        nivel: item.nivel,
        criterios: item.criterios,
      }));

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

  construirCoincidencia(perdidaBase, hallazgoComparado, textoBusqueda = null, tipoReporte = 'HALLADO', reporteOriginal = null) {
    const criterios = [];
    let puntaje = 0;
    const reporte = reporteOriginal || hallazgoComparado;

    const puntajeTexto = this.calcularPuntajeTexto(textoBusqueda, hallazgoComparado);

    if (puntajeTexto > 0) {
      puntaje += puntajeTexto;
      criterios.push('coincide con busqueda');
    }

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
      reporte,
      hallazgo: tipoReporte === 'HALLADO' ? reporte : null,
      perdida: tipoReporte === 'PERDIDO' ? reporte : null,
      tipoReporte,
      puntaje,
      nivel: this.obtenerNivel(puntaje),
      criterios,
    };
  }

  adaptarPerdida(perdida) {
    return {
      h_nom_masc: perdida.p_nom_masc,
      h_tipo: perdida.p_tipo,
      h_genero: perdida.p_genero,
      h_fisica: perdida.p_fisica,
      h_perso: perdida.p_perso,
      h_inf_adic: perdida.p_inf_adic,
      h_dire_inter: perdida.p_dire_inter,
      h_comuna: perdida.p_comuna,
      h_region: perdida.p_region,
      h_fecha: perdida.p_fecha,
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
    return this.normalizarTexto(texto)
      .split(/[^a-z0-9]+/)
      .filter((palabra) => palabra.length >= 4);
  }

  calcularPuntajeTexto(textoBusqueda, hallazgoComparado) {
    if (!textoBusqueda) {
      return 0;
    }

    const palabrasBusqueda = this.obtenerPalabrasClave(textoBusqueda);

    if (palabrasBusqueda.length === 0) {
      return 0;
    }

    const textoHallazgo = [
      hallazgoComparado.h_nom_masc,
      this.obtenerTipoTexto(hallazgoComparado.h_tipo),
      this.obtenerGeneroTexto(hallazgoComparado.h_genero),
      hallazgoComparado.h_fisica,
      hallazgoComparado.h_perso,
      hallazgoComparado.h_inf_adic,
      hallazgoComparado.h_dire_inter,
      hallazgoComparado.h_comuna,
      hallazgoComparado.h_region
    ].filter(Boolean).join(' ');

    const textoNormalizado = this.normalizarTexto(textoHallazgo);
    const coincidencias = palabrasBusqueda.filter((palabra) => textoNormalizado.includes(palabra));

    return Math.min(coincidencias.length * 15, 45);
  }

  normalizarTexto(texto) {
    return String(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  obtenerTipoTexto(tipo) {
    const tipos = {
      1: 'perro',
      2: 'gato',
      3: 'otro',
    };

    return tipos[tipo] || '';
  }

  obtenerGeneroTexto(genero) {
    const generos = {
      1: 'macho',
      2: 'hembra',
      3: 'no especifica',
    };

    return generos[genero] || '';
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
