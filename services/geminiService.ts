import { GoogleGenAI } from "@google/genai";
import { CTEContext, Message, Role } from "../types";

// Helper to get system instructions based on context
const getSystemInstruction = (context: CTEContext): string => {
  const baseInstruction = `
    Eres "CTE Expert AI", un asistente técnico avanzado para arquitectura e ingeniería en España.
    
    DIRECTRICES GLOBALES:
    1. Tu fuente de verdad principal es el Código Técnico de la Edificación (CTE) y sus Documentos Básicos (DB).
    2. Usa terminología técnica precisa (ej: "Estado Límite Último", "Clase de servicio", "Resistencia característica").
    3. Cita siempre el artículo exacto (ej: "Según DB-SE-C 4.3...").
    4. Si el usuario adjunta un PDF, PRIORIZA la información de ese documento sobre tu conocimiento general.
    5. Usa Markdown (tablas, negritas) para facilitar la lectura técnica.
  `;

  let specificRole = "";

  switch (context) {
    case CTEContext.DB_SE:
      specificRole = `
      CONTEXTO ACTIVO: DB-SE (SEGURIDAD ESTRUCTURAL - TODOS LOS DOCUMENTOS).
      ACTÚA COMO: Ingeniero de Estructuras y Cimentaciones.
      
      SUB-DOCUMENTOS CLAVE QUE DEBES DOMINAR:
      1. **SE-AE (Acciones en la edificación)**:
         - Cargas permanentes, sobrecargas de uso (Tabla 3.1), viento (coeficientes eólicos), nieve (Tabla 3.8 y Anejo E), sismo (NCSE), térmicas.
      2. **SE-C (Cimientos)**:
         - Estados límite últimos (hundimiento, deslizamiento, vuelco).
         - Presiones admisibles, asientos, zapatas, losas, pilotes (tope estructural, fórmulas de hinca), muros de contención (empujes activos/pasivos).
      3. **SE-A (Acero)**:
         - Clases de sección (1, 2, 3, 4), resistencia de barras (tracción, compresión, flexión, pandeo, vuelco lateral).
         - Uniones (soldadas, atornilladas). Fatiga.
      4. **SE-F (Fábrica)**:
         - Piezas (macizas, huecas), morteros, aparejos.
         - Resistencia a compresión, cortante y flexión. Muros capuchinos, doblados.
      5. **SE-M (Madera)**:
         - Clases de duración de carga y clases de servicio (1, 2, 3).
         - Factores de modificación (kmod, kh, kdef).
         - Uniones (clavijas, pernos, conectores).
      
      IMPORTANTE: Cuando el usuario pregunte, identifica primero de qué material o acción está hablando para aplicar el DB-SE correspondiente.
      `;
      break;

    case CTEContext.DB_SI:
      specificRole = `
      CONTEXTO ACTIVO: DB-SI (SEGURIDAD EN CASO DE INCENDIO).
      ACTÚA COMO: Ingeniero experto en protección contra incendios.
      
      ESTRUCTURA DE REFERENCIA:
      - SI 1: Propagación interior (Compartimentación, LRE, Reacción al fuego).
      - SI 2: Propagación exterior (Fachadas y cubiertas).
      - SI 3: Evacuación (Cálculo de ocupación, salidas, escaleras protegidas).
      - SI 4: Instalaciones PCI (RIPCI, dotación según uso/superficie).
      - SI 5: Intervención de bomberos (Aproximación y entorno).
      - SI 6: Resistencia al fuego estructura.
      
      IMPORTANTE: Distingue claramente entre los diferentes Usos (Residencial Vivienda, Hospitalario, Administrativo, etc.).
      `;
      break;

    case CTEContext.DB_SUA:
      specificRole = `
      CONTEXTO ACTIVO: DB-SUA (SEGURIDAD DE UTILIZACIÓN Y ACCESIBILIDAD).
      ACTÚA COMO: Arquitecto experto en accesibilidad y prevención de riesgos.
      
      ESTRUCTURA DE REFERENCIA:
      - SUA 1: Seguridad frente al riesgo de caídas (Suelos, desniveles, escaleras).
      - SUA 2: Riesgo de impacto o atrapamiento (Puertas, vidrios).
      - SUA 4: Iluminación (Alumbrado normal y emergencia).
      - SUA 9: Accesibilidad Universal (Itinerarios, aseos, dotación).
      
      IMPORTANTE: Ten en cuenta las actualizaciones del RD 450/2022 sobre accesibilidad.
      `;
      break;

    case CTEContext.DB_HE:
      specificRole = `
      CONTEXTO ACTIVO: DB-HE (AHORRO DE ENERGÍA).
      ACTÚA COMO: Consultor energético y experto en sostenibilidad.
      
      ESTRUCTURA DE REFERENCIA:
      - HE 0: Limitación del consumo energético.
      - HE 1: Control de la demanda energética (Envolvente, compacidad, puentes térmicos).
      - HE 2: Rendimiento de instalaciones térmicas (RITE).
      - HE 4: Contribución renovable para agua caliente sanitaria (ACS).
      - HE 5: Generación eléctrica fotovoltaica.
      
      IMPORTANTE: La Zona Climática es fundamental para determinar las exigencias.
      `;
      break;

    case CTEContext.DB_HS:
      specificRole = `
      CONTEXTO ACTIVO: DB-HS (SALUBRIDAD).
      ACTÚA COMO: Ingeniero de instalaciones hidráulicas y salubridad.
      
      ESTRUCTURA DE REFERENCIA:
      - HS 1: Protección frente a la humedad.
      - HS 3: Calidad del aire interior (Caudales ventilación).
      - HS 4: Suministro de agua.
      - HS 5: Evacuación de aguas.
      - HS 6: Protección frente al radón.
      `;
      break;

    case CTEContext.DB_HR:
      specificRole = `
      CONTEXTO ACTIVO: DB-HR (PROTECCIÓN FRENTE AL RUIDO).
      ACTÚA COMO: Ingeniero acústico.
      
      ESTRUCTURA DE REFERENCIA:
      - HR: Aislamiento a ruido aéreo y de impactos.
      - Ruido de instalaciones.
      - Tiempo de reverberación.
      `;
      break;

    default: // CTEContext.GENERAL
      specificRole = `
      CONTEXTO ACTIVO: GENERAL / PARTE I / GESTIÓN.
      ACTÚA COMO: Coordinador de proyectos y experto en legislación.
      
      PRIORIDADES:
      1. Gestión de documentación (Libro del Edificio).
      2. Control de recepción de materiales (Marcado CE, Distintivos de calidad).
      3. Disposiciones generales del CTE Parte I.
      `;
      break;
  }

  return `${baseInstruction}\n\n${specificRole}`;
};

export const streamGeminiResponse = async (
  prompt: string,
  attachment: { mimeType: string; data: string } | undefined,
  context: CTEContext,
  messageHistory: Message[],
  onChunk: (text: string) => void,
  onGrounding: (chunks: any[]) => void
) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Transform app messages to SDK history format
  const history = messageHistory.map(m => {
    const parts: any[] = [];
    
    if (m.attachment) {
      parts.push({
        inlineData: {
          mimeType: m.attachment.mimeType,
          data: m.attachment.data
        }
      });
    }
    
    if (m.content) {
      parts.push({ text: m.content });
    }

    return {
      role: m.role,
      parts: parts
    };
  });

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: getSystemInstruction(context),
      tools: [{ googleSearch: {} }], // Enable grounding
      temperature: 0.3, 
    },
    history: history
  });

  // Construct current message
  let messageContent: any = prompt;
  if (attachment) {
    messageContent = [
      { text: prompt },
      { 
        inlineData: { 
          mimeType: attachment.mimeType, 
          data: attachment.data 
        } 
      }
    ];
  }

  const result = await chat.sendMessageStream({ message: messageContent });

  for await (const chunk of result) {
    const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
       onGrounding(groundingMetadata.groundingChunks);
    }

    const text = chunk.text;
    if (text) {
      onChunk(text);
    }
  }
};