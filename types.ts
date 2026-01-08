
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachment?: Attachment;
  isStreaming?: boolean;
  groundingMetadata?: GroundingChunk[];
}

export enum CTEContext {
  GENERAL = 'GENERAL',
  DB_SE_AE = 'DB-SE-AE',
  DB_SE_C = 'DB-SE-C',
  DB_SE_A = 'DB-SE-A',
  DB_SE_F = 'DB-SE-F',
  DB_SE_M = 'DB-SE-M',
  DB_SI = 'DB-SI',
  DB_SUA = 'DB-SUA',
  DB_HE = 'DB-HE',
  DB_HR = 'DB-HR',
  DB_HS = 'DB-HS'
}

// NUEVO: Definición de Proyecto / Expediente
export interface Project {
  id: string;
  name: string;
  createdAt: number;
  description?: string;
}

// NUEVO: Entrada de Historial con vinculación a proyecto
export interface HistoryEntry {
  id: string;
  timestamp: number;
  context: CTEContext;
  query: string; 
  messages: Message[];
  projectId?: string; // ID del proyecto al que pertenece (opcional)
}

// NIVEL 3: Acciones Operativas
export interface SidebarAction {
  label: string; // Texto del botón (ej: "Calcular Carga")
  prompt: string; // Prompt exacto que se enviará a la IA
  icon: string; // Nombre del icono Lucide
  type: 'calc' | 'info' | 'check'; // Para diferenciar colores (Cálculo, Info, Verificación)
}

// NIVEL 2: Sección Técnica
export interface SubItem {
  id: string;
  title: string;
  description: string;
  actions?: SidebarAction[]; // Lista de acciones disponibles en esta sección
}

// NIVEL 1: Documento Básico
export interface DBInfo {
  id: CTEContext;
  title: string;
  subtitle: string;
  description: string;
  url: string; // PDF Técnico
  boeUrl?: string; // Enlace al BOE Consolidado
  subItems: SubItem[];
  icon?: string;
}
