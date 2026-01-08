
import { CTEContext, DBInfo } from './types';

export const CTE_DOCUMENTS: DBInfo[] = [
  {
    id: CTEContext.GENERAL,
    title: 'CTE Parte I y General',
    subtitle: 'CTE Parte I',
    description: 'Disposiciones generales, condiciones técnicas y administrativas.',
    icon: 'LayoutGrid',
    url: 'https://www.codigotecnico.org/pdf/Documentos/Parte1/CTE_Parte_I_2022.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515',
    subItems: [
      { id: 'GEN1', title: 'Disposiciones generales', description: 'Art. 1-4: Objeto y ámbito.' },
      { id: 'GEN3', title: 'Exigencias Básicas', description: 'Art. 9-17: Prestaciones requeridas.' }
    ]
  },
  {
    id: CTEContext.DB_SE_AE,
    title: 'SE-AE: Acciones',
    subtitle: 'DB-SE-AE',
    description: 'Pesos, viento, nieve, sismo, térmicas e impacto.',
    icon: 'ArrowDownToLine',
    url: 'https://www.codigotecnico.org/pdf/Documentos/SE/DBSE-AE.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515#dbseae',
    subItems: [
      { 
        id: 'AE3', 
        title: '3. Acciones Climáticas', 
        description: 'Viento, Nieve y Temperatura.',
        actions: [
          { label: '3.5 Carga de Nieve', prompt: 'Genera la FICHA TÉCNICA DE CARGA DE NIEVE según DB-SE-AE 3.5. Solicita ubicación y altitud si no las tienes, y presenta el cálculo de qn.', icon: 'Snowflake', type: 'calc' },
          { label: '3.3 Acción del Viento', prompt: 'Realiza el cálculo de la presión estática del viento (qb y qz) según DB-SE-AE 3.3. Detalla los coeficientes de exposición y eólicos.', icon: 'Wind', type: 'calc' }
        ]
      },
      { 
        id: 'AE4', 
        title: '3.1 Sobrecargas de Uso', 
        description: 'Categorías y valores de cálculo.',
        actions: [
          { label: 'Tabla de Sobrecargas', prompt: 'Genera una tabla resumen con las sobrecargas de uso (kN/m2) para las categorías A (Residencial), B (Administrativo) y C (Pública concurrencia).', icon: 'Table', type: 'info' }
        ]
      }
    ]
  },
  {
    id: CTEContext.DB_SE_C,
    title: 'SE-C: Cimientos',
    subtitle: 'DB-SE-C',
    description: 'Estudio geotécnico y cimentaciones.',
    icon: 'Layers',
    url: 'https://www.codigotecnico.org/pdf/Documentos/SE/DBSE-C.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515#dbsec',
    subItems: [
      { id: 'C4', title: '4. Cimentaciones Directas', description: 'Zapatas, losas y pozos.', 
        actions: [
          { label: 'Verificación Vuelco', prompt: 'Ejecuta el procedimiento de verificación del Estado Límite de Equilibrio (Vuelco) para una zapata rígida según DB-SE-C.', icon: 'RotateCw', type: 'calc' }
        ]
      }
    ]
  },
  {
    id: CTEContext.DB_SE_A,
    title: 'SE-A: Acero',
    subtitle: 'DB-SE-A',
    description: 'Estructuras metálicas y uniones.',
    icon: 'Triangle',
    url: 'https://www.codigotecnico.org/pdf/Documentos/SE/DBSE-A.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515#dbsea',
    subItems: [
      { id: 'A8', title: '8. Uniones', description: 'Soldaduras y tornillería.' }
    ]
  },
  {
    id: CTEContext.DB_SE_F,
    title: 'SE-F: Fábrica',
    subtitle: 'DB-SE-F',
    description: 'Muros de carga y cerramientos.',
    icon: 'BrickWall',
    url: 'https://www.codigotecnico.org/pdf/Documentos/SE/DBSE-F.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515#dbsef',
    subItems: [
      { id: 'F5', title: '5. Dimensionado', description: 'Resistencia y estabilidad.',
        actions: [
          { label: 'Comprobación Esbeltez', prompt: 'Explica cómo calcular y verificar la esbeltez mecánica de un muro de carga de fábrica de ladrillo según DB-SE-F.', icon: 'Ruler', type: 'calc' }
        ]
      }
    ]
  },
  {
    id: CTEContext.DB_SE_M,
    title: 'SE-M: Madera',
    subtitle: 'DB-SE-M',
    description: 'Estructuras de madera.',
    icon: 'Trees',
    url: 'https://www.codigotecnico.org/pdf/Documentos/SE/DBSE-M.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515#dbsem',
    subItems: []
  },
  {
    id: CTEContext.DB_SI,
    title: 'DB-SI: Incendio',
    subtitle: 'DB-SI Incendio',
    description: 'Propagación y evacuación.',
    icon: 'Flame',
    url: 'https://www.codigotecnico.org/pdf/Documentos/SI/DBSI.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515#dbsi',
    subItems: [
      { 
        id: 'SI1', 
        title: 'SI 1: Propagación Interior', 
        description: 'Sectorización y estabilidad al fuego.',
        actions: [
          { label: '1.1 Diagnóstico Sectorización', prompt: 'Realiza un DIAGNÓSTICO DE SECTORIZACIÓN. Genera la tabla de cumplimiento comparando superficies reales vs máximas según el uso (Tabla 1.1).', icon: 'ShieldCheck', type: 'check' },
          { label: 'Resistencia Paredes/Techos', prompt: 'Consulta la Tabla 1.2 del SI 1 y dime la resistencia al fuego (EI) requerida para separar un local de Riesgo Especial Bajo, Medio y Alto.', icon: 'Wall', type: 'info' }
        ]
      },
      { 
        id: 'SI3', 
        title: 'SI 3: Evacuación', 
        description: 'Salidas y recorridos.',
        actions: [
          { label: 'Cálculo de Aforo', prompt: 'Calcula la ocupación teórica de personas. Pídeme la superficie útil y el uso (Comercial, Docente, Administrativo...) para aplicar la densidad de la Tabla 2.1.', icon: 'Users', type: 'calc' },
          { label: 'Dimensionado Vías Evacuación', prompt: 'Calcula el ancho (A) de puertas, pasillos y escaleras según la fórmula A = P / 200 (o 160).', icon: 'ArrowRight', type: 'calc' }
        ]
      }
    ]
  },
  {
    id: CTEContext.DB_SUA,
    title: 'DB-SUA: Accesibilidad',
    subtitle: 'DB-SUA Accesibilidad',
    description: 'Seguridad de uso y accesibilidad.',
    icon: 'Accessibility',
    url: 'https://www.codigotecnico.org/pdf/Documentos/SUA/DBSUA.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515#dbsua',
    subItems: [
      { 
        id: 'SUA1', 
        title: 'SUA 1: Caídas', 
        description: 'Suelos, desniveles y escaleras.',
        actions: [
          { label: '4.2 Escaleras Uso General', prompt: 'Verifica el cumplimiento de una escalera de Uso General. Revisa: Huella (28cm), Tabica (13-18.5cm) y Pasamanos.', icon: 'CheckCircle', type: 'check' },
          { label: '1. Resbaladicidad Suelos', prompt: 'Indica la Clase (0, 1, 2, 3) exigida para suelos según su ubicación (Zonas interiores húmedas, secas, pendientes...).', icon: 'AlertTriangle', type: 'info' }
        ]
      },
      { 
        id: 'SUA9', 
        title: 'SUA 9: Accesibilidad', 
        description: 'Itinerarios y dotación.',
        actions: [
          { label: '1.2.6 Aseos Accesibles', prompt: 'Genera una lista de chequeo (CHECKLIST) con las dimensiones y dotación obligatoria para un Aseo Accesible según SUA 9 y DA-SUA/2.', icon: 'Accessibility', type: 'check' }
        ]
      }
    ]
  },
  {
    id: CTEContext.DB_HS,
    title: 'DB-HS: Salubridad',
    subtitle: 'DB-HS Salubridad',
    description: 'Higiene, ventilación y humedad.',
    icon: 'Droplets',
    url: 'https://www.codigotecnico.org/pdf/Documentos/HS/DBHS.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515#dbhs',
    subItems: [
      { 
        id: 'HS3', 
        title: 'HS 3: Calidad del Aire', 
        description: 'Ventilación en viviendas y garajes.',
        actions: [
          { label: '3.2 Caudales Ventilación', prompt: 'Calcula los CAUDALES MÍNIMOS DE VENTILACIÓN. Genera una tabla por local (Dormitorios, Estar, Cocina, Baños) aplicando la Tabla 2.1 del HS 3.', icon: 'Wind', type: 'calc' },
          { label: '3.1.4 Aberturas Admisión', prompt: 'Calcula el área efectiva mínima de las aberturas de admisión en función del caudal calculado (4x qv o similar).', icon: 'Maximize', type: 'calc' }
        ]
      }
    ]
  },
  {
    id: CTEContext.DB_HE,
    title: 'DB-HE: Energía',
    subtitle: 'DB-HE Energía',
    description: 'Eficiencia energética.',
    icon: 'Zap',
    url: 'https://www.codigotecnico.org/pdf/Documentos/HE/DBHE.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515#dbhe',
    subItems: [
      { 
        id: 'HE1', 
        title: 'HE 1: Envolvente Térmica', 
        description: 'Transmitancias y control solar.',
        actions: [
          { label: '3.1 Cálculo U Global', prompt: 'Calcula y verifica la Transmitancia Térmica (U). Genera la TABLA DE CUMPLIMIENTO comparando U_calculada vs U_limite para la zona climática.', icon: 'Table', type: 'calc' }
        ]
      },
      {
        id: 'HE4',
        title: 'HE 4: Energías Renovables',
        description: 'Agua Caliente (ACS).',
        actions: [
          { label: 'Contribución Solar Mínima', prompt: '¿Cuál es el porcentaje mínimo de contribución renovable para ACS exigido (60% o 70%) según la demanda diaria de litros?', icon: 'Sun', type: 'check' }
        ]
      }
    ]
  },
  {
    id: CTEContext.DB_HR,
    title: 'DB-HR: Ruido',
    subtitle: 'DB-HR Ruido',
    description: 'Protección acústica.',
    icon: 'Volume2',
    url: 'https://www.codigotecnico.org/pdf/Documentos/HR/DBHR.pdf',
    boeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515#dbhr',
    subItems: [
      {
        id: 'HR2',
        title: '2. Valores Límite',
        description: 'Aislamiento aéreo e impacto.',
        actions: [
          { label: '2.1 Aislamiento Aéreo', prompt: 'Indica los valores límite de aislamiento acústico a ruido aéreo (DnTw) exigidos entre recintos protegidos y habitables.', icon: 'VolumeX', type: 'info' }
        ]
      }
    ]
  }
];

export const INITIAL_SUGGESTIONS = [
  "Calcular carga de nieve según DB-SE-AE 3.5",
  "Diagnóstico de sectorización DB-SI (Local Comercial)",
  "Verificar transmitancia muro fachada zona D3",
  "Cálculo ventilación vivienda estándar HS 3"
];
