import { CTEContext, DBInfo } from './types';

export const CTE_DOCUMENTS: DBInfo[] = [
  {
    id: CTEContext.GENERAL,
    title: 'CTE Parte I y General',
    subtitle: 'GEN',
    description: 'Disposiciones generales, condiciones técnicas y administrativas.',
    icon: 'LayoutGrid',
    subItems: [
      'Disposiciones generales (Art. 1-4)',
      'Condiciones técnicas y administrativas (Art. 5-8)',
      'Exigencias Básicas (Art. 9-17)',
      'Contenido del proyecto (Anejo I)'
    ]
  },
  {
    id: CTEContext.DB_SE,
    title: 'SE: Seguridad Estructural',
    subtitle: 'SE',
    description: 'Bases de cálculo, resistencia y estabilidad (Cimientos, Acero, Madera, Fábrica, Acciones).',
    icon: 'Construction',
    subItems: [
      'SE: Bases de cálculo y seguridad',
      'SE-AE: Acciones en la edificación',
      'SE-C: Cimientos',
      'SE-A: Acero',
      'SE-F: Fábrica',
      'SE-M: Madera'
    ]
  },
  {
    id: CTEContext.DB_SI,
    title: 'SI: Seguridad Incendio',
    subtitle: 'SI',
    description: 'Propagación, evacuación e intervención.',
    icon: 'Flame',
    subItems: [
      'SI 1: Propagación interior',
      'SI 2: Propagación exterior',
      'SI 3: Evacuación de ocupantes',
      'SI 4: Instalaciones de protección (PCI)',
      'SI 5: Intervención de bomberos',
      'SI 6: Resistencia al fuego estructura'
    ]
  },
  {
    id: CTEContext.DB_SUA,
    title: 'SUA: Seguridad Utilización',
    subtitle: 'SUA',
    description: 'Accesibilidad universal y prevención de riesgos.',
    icon: 'Accessibility',
    subItems: [
      'SUA 1: Seguridad frente al riesgo de caídas',
      'SUA 2: Riesgo de impacto o atrapamiento',
      'SUA 3: Riesgo de aprisionamiento',
      'SUA 4: Riesgo por iluminación inadecuada',
      'SUA 9: Accesibilidad universal'
    ]
  },
  {
    id: CTEContext.DB_HS,
    title: 'HS: Salubridad',
    subtitle: 'HS',
    description: 'Higiene, calidad del aire y protección ambiental.',
    icon: 'Droplets',
    subItems: [
      'HS 1: Protección frente a la humedad',
      'HS 2: Recogida y evacuación de residuos',
      'HS 3: Calidad del aire interior',
      'HS 4: Suministro de agua',
      'HS 5: Evacuación de aguas',
      'HS 6: Protección frente al radón'
    ]
  },
  {
    id: CTEContext.DB_HE,
    title: 'HE: Ahorro de Energía',
    subtitle: 'HE',
    description: 'Eficiencia energética y renovables.',
    icon: 'Zap',
    subItems: [
      'HE 0: Limitación del consumo energético',
      'HE 1: Condiciones para el control de la demanda',
      'HE 2: Condiciones de las instalaciones térmicas',
      'HE 3: Condiciones de las instalaciones de iluminación',
      'HE 4: Contribución mínima de energía renovable (ACS)',
      'HE 5: Generación mínima de energía eléctrica'
    ]
  },
  {
    id: CTEContext.DB_HR,
    title: 'HR: Protección Ruido',
    subtitle: 'HR',
    description: 'Aislamiento acústico y confort.',
    icon: 'Volume2',
    subItems: [
      'HR: Protección frente al ruido',
      'Aislamiento a ruido aéreo',
      'Aislamiento a ruido de impactos',
      'Tiempo de reverberación'
    ]
  }
];

export const INITIAL_SUGGESTIONS = [
  "Cálculo de la carga de nieve en una cubierta en Burgos según SE-AE.",
  "Distancia máxima entre juntas de dilatación en fábrica de ladrillo según SE-F.",
  "Comprobación a vuelco de una zapata aislada según SE-C.",
  "Resistencia al fuego requerida para pilares de garaje según DB-SI."
];