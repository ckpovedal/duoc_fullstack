export interface OpcionComuna {
  label: string;
  value: string;
}

export interface OpcionRegion {
  label: string;
  value: string;
  comunas: OpcionComuna[];
}

export const REGION_CHILE_POR_DEFECTO = 'Metropolitana de Santiago';

export const REGIONES_CHILE: OpcionRegion[] = [
  {
    label: 'Arica y Parinacota',
    value: 'Arica y Parinacota',
    comunas: [
      { label: 'Arica', value: 'Arica' },
      { label: 'Camarones', value: 'Camarones' },
      { label: 'Putre', value: 'Putre' },
      { label: 'General Lagos', value: 'General Lagos' }
    ]
  },
  {
    label: 'Tarapaca',
    value: 'Tarapaca',
    comunas: [
      { label: 'Iquique', value: 'Iquique' },
      { label: 'Alto Hospicio', value: 'Alto Hospicio' },
      { label: 'Pozo Almonte', value: 'Pozo Almonte' },
      { label: 'Camina', value: 'Camina' },
      { label: 'Colchane', value: 'Colchane' },
      { label: 'Huara', value: 'Huara' },
      { label: 'Pica', value: 'Pica' }
    ]
  },
  {
    label: 'Antofagasta',
    value: 'Antofagasta',
    comunas: [
      { label: 'Antofagasta', value: 'Antofagasta' },
      { label: 'Mejillones', value: 'Mejillones' },
      { label: 'Sierra Gorda', value: 'Sierra Gorda' },
      { label: 'Taltal', value: 'Taltal' },
      { label: 'Calama', value: 'Calama' },
      { label: 'Ollague', value: 'Ollague' },
      { label: 'San Pedro de Atacama', value: 'San Pedro de Atacama' },
      { label: 'Tocopilla', value: 'Tocopilla' },
      { label: 'Maria Elena', value: 'Maria Elena' }
    ]
  },
  {
    label: 'Atacama',
    value: 'Atacama',
    comunas: [
      { label: 'Copiapo', value: 'Copiapo' },
      { label: 'Caldera', value: 'Caldera' },
      { label: 'Tierra Amarilla', value: 'Tierra Amarilla' },
      { label: 'Chanaral', value: 'Chanaral' },
      { label: 'Diego de Almagro', value: 'Diego de Almagro' },
      { label: 'Vallenar', value: 'Vallenar' },
      { label: 'Alto del Carmen', value: 'Alto del Carmen' },
      { label: 'Freirina', value: 'Freirina' },
      { label: 'Huasco', value: 'Huasco' }
    ]
  },
  {
    label: 'Coquimbo',
    value: 'Coquimbo',
    comunas: [
      { label: 'La Serena', value: 'La Serena' },
      { label: 'Coquimbo', value: 'Coquimbo' },
      { label: 'Andacollo', value: 'Andacollo' },
      { label: 'La Higuera', value: 'La Higuera' },
      { label: 'Paiguano', value: 'Paiguano' },
      { label: 'Vicuna', value: 'Vicuna' },
      { label: 'Illapel', value: 'Illapel' },
      { label: 'Canela', value: 'Canela' },
      { label: 'Los Vilos', value: 'Los Vilos' },
      { label: 'Salamanca', value: 'Salamanca' },
      { label: 'Ovalle', value: 'Ovalle' },
      { label: 'Combarbala', value: 'Combarbala' },
      { label: 'Monte Patria', value: 'Monte Patria' },
      { label: 'Punitaqui', value: 'Punitaqui' },
      { label: 'Rio Hurtado', value: 'Rio Hurtado' }
    ]
  },
  {
    label: 'Valparaiso',
    value: 'Valparaiso',
    comunas: [
      { label: 'Valparaiso', value: 'Valparaiso' },
      { label: 'Casablanca', value: 'Casablanca' },
      { label: 'Concon', value: 'Concon' },
      { label: 'Juan Fernandez', value: 'Juan Fernandez' },
      { label: 'Puchuncavi', value: 'Puchuncavi' },
      { label: 'Quintero', value: 'Quintero' },
      { label: 'Vina del Mar', value: 'Vina del Mar' },
      { label: 'Isla de Pascua', value: 'Isla de Pascua' },
      { label: 'Los Andes', value: 'Los Andes' },
      { label: 'Calle Larga', value: 'Calle Larga' },
      { label: 'Rinconada', value: 'Rinconada' },
      { label: 'San Esteban', value: 'San Esteban' },
      { label: 'La Ligua', value: 'La Ligua' },
      { label: 'Cabildo', value: 'Cabildo' },
      { label: 'Papudo', value: 'Papudo' },
      { label: 'Petorca', value: 'Petorca' },
      { label: 'Zapallar', value: 'Zapallar' },
      { label: 'Quillota', value: 'Quillota' },
      { label: 'Calera', value: 'Calera' },
      { label: 'Hijuelas', value: 'Hijuelas' },
      { label: 'La Cruz', value: 'La Cruz' },
      { label: 'Nogales', value: 'Nogales' },
      { label: 'San Antonio', value: 'San Antonio' },
      { label: 'Algarrobo', value: 'Algarrobo' },
      { label: 'Cartagena', value: 'Cartagena' },
      { label: 'El Quisco', value: 'El Quisco' },
      { label: 'El Tabo', value: 'El Tabo' },
      { label: 'Santo Domingo', value: 'Santo Domingo' },
      { label: 'San Felipe', value: 'San Felipe' },
      { label: 'Catemu', value: 'Catemu' },
      { label: 'Llaillay', value: 'Llaillay' },
      { label: 'Panquehue', value: 'Panquehue' },
      { label: 'Putaendo', value: 'Putaendo' },
      { label: 'Santa Maria', value: 'Santa Maria' },
      { label: 'Quilpue', value: 'Quilpue' },
      { label: 'Limache', value: 'Limache' },
      { label: 'Olmue', value: 'Olmue' },
      { label: 'Villa Alemana', value: 'Villa Alemana' }
    ]
  },
  {
    label: 'Libertador General Bernardo OHiggins',
    value: 'Libertador General Bernardo OHiggins',
    comunas: [
      { label: 'Rancagua', value: 'Rancagua' },
      { label: 'Codegua', value: 'Codegua' },
      { label: 'Coinco', value: 'Coinco' },
      { label: 'Coltauco', value: 'Coltauco' },
      { label: 'Donihue', value: 'Donihue' },
      { label: 'Graneros', value: 'Graneros' },
      { label: 'Las Cabras', value: 'Las Cabras' },
      { label: 'Machali', value: 'Machali' },
      { label: 'Malloa', value: 'Malloa' },
      { label: 'Mostazal', value: 'Mostazal' },
      { label: 'Olivar', value: 'Olivar' },
      { label: 'Peumo', value: 'Peumo' },
      { label: 'Pichidegua', value: 'Pichidegua' },
      { label: 'Quinta de Tilcoco', value: 'Quinta de Tilcoco' },
      { label: 'Rengo', value: 'Rengo' },
      { label: 'Requinoa', value: 'Requinoa' },
      { label: 'San Vicente', value: 'San Vicente' },
      { label: 'Pichilemu', value: 'Pichilemu' },
      { label: 'La Estrella', value: 'La Estrella' },
      { label: 'Litueche', value: 'Litueche' },
      { label: 'Marchihue', value: 'Marchihue' },
      { label: 'Navidad', value: 'Navidad' },
      { label: 'Paredones', value: 'Paredones' },
      { label: 'San Fernando', value: 'San Fernando' },
      { label: 'Chepica', value: 'Chepica' },
      { label: 'Chimbarongo', value: 'Chimbarongo' },
      { label: 'Lolol', value: 'Lolol' },
      { label: 'Nancagua', value: 'Nancagua' },
      { label: 'Palmilla', value: 'Palmilla' },
      { label: 'Peralillo', value: 'Peralillo' },
      { label: 'Placilla', value: 'Placilla' },
      { label: 'Pumanque', value: 'Pumanque' },
      { label: 'Santa Cruz', value: 'Santa Cruz' }
    ]
  },
  {
    label: 'Maule',
    value: 'Maule',
    comunas: [
      { label: 'Talca', value: 'Talca' },
      { label: 'Constitucion', value: 'Constitucion' },
      { label: 'Curepto', value: 'Curepto' },
      { label: 'Empedrado', value: 'Empedrado' },
      { label: 'Maule', value: 'Maule' },
      { label: 'Pelarco', value: 'Pelarco' },
      { label: 'Pencahue', value: 'Pencahue' },
      { label: 'Rio Claro', value: 'Rio Claro' },
      { label: 'San Clemente', value: 'San Clemente' },
      { label: 'San Rafael', value: 'San Rafael' },
      { label: 'Cauquenes', value: 'Cauquenes' },
      { label: 'Chanco', value: 'Chanco' },
      { label: 'Pelluhue', value: 'Pelluhue' },
      { label: 'Curico', value: 'Curico' },
      { label: 'Hualane', value: 'Hualane' },
      { label: 'Licanten', value: 'Licanten' },
      { label: 'Molina', value: 'Molina' },
      { label: 'Rauco', value: 'Rauco' },
      { label: 'Romeral', value: 'Romeral' },
      { label: 'Sagrada Familia', value: 'Sagrada Familia' },
      { label: 'Teno', value: 'Teno' },
      { label: 'Vichuquen', value: 'Vichuquen' },
      { label: 'Linares', value: 'Linares' },
      { label: 'Colbun', value: 'Colbun' },
      { label: 'Longavi', value: 'Longavi' },
      { label: 'Parral', value: 'Parral' },
      { label: 'Retiro', value: 'Retiro' },
      { label: 'San Javier', value: 'San Javier' },
      { label: 'Villa Alegre', value: 'Villa Alegre' },
      { label: 'Yerbas Buenas', value: 'Yerbas Buenas' }
    ]
  },
  {
    label: 'Nuble',
    value: 'Nuble',
    comunas: [
      { label: 'Chillan', value: 'Chillan' },
      { label: 'Bulnes', value: 'Bulnes' },
      { label: 'Chillan Viejo', value: 'Chillan Viejo' },
      { label: 'El Carmen', value: 'El Carmen' },
      { label: 'Pemuco', value: 'Pemuco' },
      { label: 'Pinto', value: 'Pinto' },
      { label: 'Quillon', value: 'Quillon' },
      { label: 'San Ignacio', value: 'San Ignacio' },
      { label: 'Yungay', value: 'Yungay' },
      { label: 'Quirihue', value: 'Quirihue' },
      { label: 'Cobquecura', value: 'Cobquecura' },
      { label: 'Coelemu', value: 'Coelemu' },
      { label: 'Ninhue', value: 'Ninhue' },
      { label: 'Portezuelo', value: 'Portezuelo' },
      { label: 'Ranquil', value: 'Ranquil' },
      { label: 'Treguaco', value: 'Treguaco' },
      { label: 'San Carlos', value: 'San Carlos' },
      { label: 'Coihueco', value: 'Coihueco' },
      { label: 'Niquen', value: 'Niquen' },
      { label: 'San Fabian', value: 'San Fabian' },
      { label: 'San Nicolas', value: 'San Nicolas' }
    ]
  },
  {
    label: 'Biobio',
    value: 'Biobio',
    comunas: [
      { label: 'Concepcion', value: 'Concepcion' },
      { label: 'Coronel', value: 'Coronel' },
      { label: 'Chiguayante', value: 'Chiguayante' },
      { label: 'Florida', value: 'Florida' },
      { label: 'Hualqui', value: 'Hualqui' },
      { label: 'Lota', value: 'Lota' },
      { label: 'Penco', value: 'Penco' },
      { label: 'San Pedro de la Paz', value: 'San Pedro de la Paz' },
      { label: 'Santa Juana', value: 'Santa Juana' },
      { label: 'Talcahuano', value: 'Talcahuano' },
      { label: 'Tome', value: 'Tome' },
      { label: 'Hualpen', value: 'Hualpen' },
      { label: 'Lebu', value: 'Lebu' },
      { label: 'Arauco', value: 'Arauco' },
      { label: 'Canete', value: 'Canete' },
      { label: 'Contulmo', value: 'Contulmo' },
      { label: 'Curanilahue', value: 'Curanilahue' },
      { label: 'Los Alamos', value: 'Los Alamos' },
      { label: 'Tirua', value: 'Tirua' },
      { label: 'Los Angeles', value: 'Los Angeles' },
      { label: 'Antuco', value: 'Antuco' },
      { label: 'Cabrero', value: 'Cabrero' },
      { label: 'Laja', value: 'Laja' },
      { label: 'Mulchen', value: 'Mulchen' },
      { label: 'Nacimiento', value: 'Nacimiento' },
      { label: 'Negrete', value: 'Negrete' },
      { label: 'Quilaco', value: 'Quilaco' },
      { label: 'Quilleco', value: 'Quilleco' },
      { label: 'San Rosendo', value: 'San Rosendo' },
      { label: 'Santa Barbara', value: 'Santa Barbara' },
      { label: 'Tucapel', value: 'Tucapel' },
      { label: 'Yumbel', value: 'Yumbel' },
      { label: 'Alto Biobio', value: 'Alto Biobio' }
    ]
  },
  {
    label: 'La Araucania',
    value: 'La Araucania',
    comunas: [
      { label: 'Temuco', value: 'Temuco' },
      { label: 'Carahue', value: 'Carahue' },
      { label: 'Cunco', value: 'Cunco' },
      { label: 'Curarrehue', value: 'Curarrehue' },
      { label: 'Freire', value: 'Freire' },
      { label: 'Galvarino', value: 'Galvarino' },
      { label: 'Gorbea', value: 'Gorbea' },
      { label: 'Lautaro', value: 'Lautaro' },
      { label: 'Loncoche', value: 'Loncoche' },
      { label: 'Melipeuco', value: 'Melipeuco' },
      { label: 'Nueva Imperial', value: 'Nueva Imperial' },
      { label: 'Padre las Casas', value: 'Padre las Casas' },
      { label: 'Perquenco', value: 'Perquenco' },
      { label: 'Pitrufquen', value: 'Pitrufquen' },
      { label: 'Pucon', value: 'Pucon' },
      { label: 'Saavedra', value: 'Saavedra' },
      { label: 'Teodoro Schmidt', value: 'Teodoro Schmidt' },
      { label: 'Tolten', value: 'Tolten' },
      { label: 'Vilcun', value: 'Vilcun' },
      { label: 'Villarrica', value: 'Villarrica' },
      { label: 'Cholchol', value: 'Cholchol' },
      { label: 'Angol', value: 'Angol' },
      { label: 'Collipulli', value: 'Collipulli' },
      { label: 'Curacautin', value: 'Curacautin' },
      { label: 'Ercilla', value: 'Ercilla' },
      { label: 'Lonquimay', value: 'Lonquimay' },
      { label: 'Los Sauces', value: 'Los Sauces' },
      { label: 'Lumaco', value: 'Lumaco' },
      { label: 'Puren', value: 'Puren' },
      { label: 'Renaico', value: 'Renaico' },
      { label: 'Traiguen', value: 'Traiguen' },
      { label: 'Victoria', value: 'Victoria' }
    ]
  },
  {
    label: 'Los Rios',
    value: 'Los Rios',
    comunas: [
      { label: 'Valdivia', value: 'Valdivia' },
      { label: 'Corral', value: 'Corral' },
      { label: 'Lanco', value: 'Lanco' },
      { label: 'Los Lagos', value: 'Los Lagos' },
      { label: 'Mafil', value: 'Mafil' },
      { label: 'Mariquina', value: 'Mariquina' },
      { label: 'Paillaco', value: 'Paillaco' },
      { label: 'Panguipulli', value: 'Panguipulli' },
      { label: 'La Union', value: 'La Union' },
      { label: 'Futrono', value: 'Futrono' },
      { label: 'Lago Ranco', value: 'Lago Ranco' },
      { label: 'Rio Bueno', value: 'Rio Bueno' }
    ]
  },
  {
    label: 'Los Lagos',
    value: 'Los Lagos',
    comunas: [
      { label: 'Puerto Montt', value: 'Puerto Montt' },
      { label: 'Calbuco', value: 'Calbuco' },
      { label: 'Cochamo', value: 'Cochamo' },
      { label: 'Fresia', value: 'Fresia' },
      { label: 'Frutillar', value: 'Frutillar' },
      { label: 'Los Muermos', value: 'Los Muermos' },
      { label: 'Llanquihue', value: 'Llanquihue' },
      { label: 'Maullin', value: 'Maullin' },
      { label: 'Puerto Varas', value: 'Puerto Varas' },
      { label: 'Castro', value: 'Castro' },
      { label: 'Ancud', value: 'Ancud' },
      { label: 'Chonchi', value: 'Chonchi' },
      { label: 'Curaco de Velez', value: 'Curaco de Velez' },
      { label: 'Dalcahue', value: 'Dalcahue' },
      { label: 'Puqueldon', value: 'Puqueldon' },
      { label: 'Queilen', value: 'Queilen' },
      { label: 'Quellon', value: 'Quellon' },
      { label: 'Quemchi', value: 'Quemchi' },
      { label: 'Quinchao', value: 'Quinchao' },
      { label: 'Osorno', value: 'Osorno' },
      { label: 'Puerto Octay', value: 'Puerto Octay' },
      { label: 'Purranque', value: 'Purranque' },
      { label: 'Puyehue', value: 'Puyehue' },
      { label: 'Rio Negro', value: 'Rio Negro' },
      { label: 'San Juan de la Costa', value: 'San Juan de la Costa' },
      { label: 'San Pablo', value: 'San Pablo' },
      { label: 'Chaiten', value: 'Chaiten' },
      { label: 'Futaleufu', value: 'Futaleufu' },
      { label: 'Hualaihue', value: 'Hualaihue' },
      { label: 'Palena', value: 'Palena' }
    ]
  },
  {
    label: 'Aysen del General Carlos Ibanez del Campo',
    value: 'Aysen del General Carlos Ibanez del Campo',
    comunas: [
      { label: 'Coihaique', value: 'Coihaique' },
      { label: 'Lago Verde', value: 'Lago Verde' },
      { label: 'Aisen', value: 'Aisen' },
      { label: 'Cisnes', value: 'Cisnes' },
      { label: 'Guaitecas', value: 'Guaitecas' },
      { label: 'Cochrane', value: 'Cochrane' },
      { label: 'OHiggins', value: 'OHiggins' },
      { label: 'Tortel', value: 'Tortel' },
      { label: 'Chile Chico', value: 'Chile Chico' },
      { label: 'Rio Ibanez', value: 'Rio Ibanez' }
    ]
  },
  {
    label: 'Magallanes y de la Antartica Chilena',
    value: 'Magallanes y de la Antartica Chilena',
    comunas: [
      { label: 'Punta Arenas', value: 'Punta Arenas' },
      { label: 'Laguna Blanca', value: 'Laguna Blanca' },
      { label: 'Rio Verde', value: 'Rio Verde' },
      { label: 'San Gregorio', value: 'San Gregorio' },
      { label: 'Cabo de Hornos', value: 'Cabo de Hornos' },
      { label: 'Antartica', value: 'Antartica' },
      { label: 'Porvenir', value: 'Porvenir' },
      { label: 'Primavera', value: 'Primavera' },
      { label: 'Timaukel', value: 'Timaukel' },
      { label: 'Natales', value: 'Natales' },
      { label: 'Torres del Paine', value: 'Torres del Paine' }
    ]
  },
  {
    label: 'Metropolitana de Santiago',
    value: 'Metropolitana de Santiago',
    comunas: [
      { label: 'Santiago', value: 'Santiago' },
      { label: 'Cerrillos', value: 'Cerrillos' },
      { label: 'Cerro Navia', value: 'Cerro Navia' },
      { label: 'Conchali', value: 'Conchali' },
      { label: 'El Bosque', value: 'El Bosque' },
      { label: 'Estacion Central', value: 'Estacion Central' },
      { label: 'Huechuraba', value: 'Huechuraba' },
      { label: 'Independencia', value: 'Independencia' },
      { label: 'La Cisterna', value: 'La Cisterna' },
      { label: 'La Florida', value: 'La Florida' },
      { label: 'La Granja', value: 'La Granja' },
      { label: 'La Pintana', value: 'La Pintana' },
      { label: 'La Reina', value: 'La Reina' },
      { label: 'Las Condes', value: 'Las Condes' },
      { label: 'Lo Barnechea', value: 'Lo Barnechea' },
      { label: 'Lo Espejo', value: 'Lo Espejo' },
      { label: 'Lo Prado', value: 'Lo Prado' },
      { label: 'Macul', value: 'Macul' },
      { label: 'Maipu', value: 'Maipu' },
      { label: 'Nunoa', value: 'Nunoa' },
      { label: 'Pedro Aguirre Cerda', value: 'Pedro Aguirre Cerda' },
      { label: 'Penalolen', value: 'Penalolen' },
      { label: 'Providencia', value: 'Providencia' },
      { label: 'Pudahuel', value: 'Pudahuel' },
      { label: 'Quilicura', value: 'Quilicura' },
      { label: 'Quinta Normal', value: 'Quinta Normal' },
      { label: 'Recoleta', value: 'Recoleta' },
      { label: 'Renca', value: 'Renca' },
      { label: 'San Joaquin', value: 'San Joaquin' },
      { label: 'San Miguel', value: 'San Miguel' },
      { label: 'San Ramon', value: 'San Ramon' },
      { label: 'Vitacura', value: 'Vitacura' },
      { label: 'Puente Alto', value: 'Puente Alto' },
      { label: 'Pirque', value: 'Pirque' },
      { label: 'San Jose de Maipo', value: 'San Jose de Maipo' },
      { label: 'Colina', value: 'Colina' },
      { label: 'Lampa', value: 'Lampa' },
      { label: 'Tiltil', value: 'Tiltil' },
      { label: 'San Bernardo', value: 'San Bernardo' },
      { label: 'Buin', value: 'Buin' },
      { label: 'Calera de Tango', value: 'Calera de Tango' },
      { label: 'Paine', value: 'Paine' },
      { label: 'Melipilla', value: 'Melipilla' },
      { label: 'Alhue', value: 'Alhue' },
      { label: 'Curacavi', value: 'Curacavi' },
      { label: 'Maria Pinto', value: 'Maria Pinto' },
      { label: 'San Pedro', value: 'San Pedro' },
      { label: 'Talagante', value: 'Talagante' },
      { label: 'El Monte', value: 'El Monte' },
      { label: 'Isla de Maipo', value: 'Isla de Maipo' },
      { label: 'Padre Hurtado', value: 'Padre Hurtado' },
      { label: 'Penaflor', value: 'Penaflor' }
    ]
  }
];

export function obtenerComunasPorRegion(region: string): OpcionComuna[] {
  const valor = normalizarTexto(region);
  const regionEncontrada = REGIONES_CHILE.find((item) => normalizarTexto(item.value) === valor);
  return regionEncontrada?.comunas || [];
}

export function obtenerRegionValida(region: string | null | undefined): string {
  const valor = String(region || '').trim();

  if (!valor) {
    return REGION_CHILE_POR_DEFECTO;
  }

  const normalizado = normalizarTexto(valor);
  const regionEncontrada = REGIONES_CHILE.find((item) => normalizarTexto(item.value) === normalizado);

  return regionEncontrada?.value || REGION_CHILE_POR_DEFECTO;
}

export function obtenerComunaValida(region: string, comuna: string | null | undefined): string {
  const valor = String(comuna || '').trim();

  if (!valor) {
    return '';
  }

  const normalizado = normalizarTexto(valor);
  const comunas = obtenerComunasPorRegion(region);
  const comunaEncontrada = comunas.find((item) => {
    return normalizarTexto(item.value) === normalizado || normalizarTexto(item.label) === normalizado;
  });

  return comunaEncontrada?.value || '';
}

function normalizarTexto(valor: string | null | undefined): string {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
