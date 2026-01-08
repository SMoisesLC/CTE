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
  GENERAL = 'General / Parte I',
  DB_SE = 'DB-SE: Seguridad Estructural',
  DB_SI = 'DB-SI: Seguridad en caso de Incendio',
  DB_SUA = 'DB-SUA: Seguridad de Utilización y Accesibilidad',
  DB_HE = 'DB-HE: Ahorro de Energía',
  DB_HR = 'DB-HR: Protección frente al Ruido',
  DB_HS = 'DB-HS: Salubridad'
}

export interface DBInfo {
  id: CTEContext;
  title: string;
  subtitle?: string; // Short code like "SE", "SI"
  description: string;
  icon: string;
  subItems?: string[];
}