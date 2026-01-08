
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { CTEContext, Message } from "../types";
import { MASTER_PROMPT, DB_ROLES } from "../prompts";

// ============================================================================
// CONFIGURACIÓN DE MODO PRUEBA (MOCK)
// ============================================================================
// Pon esto en TRUE para hacer pruebas sin gastar API.
// Pon esto en FALSE para usar la IA real.
const USE_MOCK_API = false; 

const MOCK_RESPONSE_TEXT = `### 1. DIAGNÓSTICO NORMATIVO Y MARCO LEGAL

De acuerdo con el contexto proporcionado por el usuario, el análisis técnico se centra en el **Documento Básico SE-AE (Seguridad Estructural - Acciones en la Edificación)**, específicamente en su apartado 3.5 relativo a la **Carga de Nieve**. Este documento regula las acciones que deben considerarse en el cálculo de estructuras para garantizar su seguridad y funcionalidad durante su vida útil. La correcta determinación de la carga de nieve es crítica en zonas con altitud relevante, ya que una subestimación podría derivar en colapsos parciales o totales de la cubierta ante eventos meteorológicos adversos, comprometiendo la Exigencia Básica SE-1 de Resistencia y Estabilidad.

Ficha Resumen:
- **Marco legislativo**: Código Técnico de la Edificación (CTE).
- **Documento Básico**: DB-SE-AE (Seguridad Estructural - Acciones en la Edificación).
- **Sección o apartado**: 3.5 Carga de Nieve.
- **Ámbito de aplicación**: Cubiertas de edificación en términos municipales con altitud < 1.000 m (o superior según anexos).
- **Referencia legal**: Real Decreto 314/2006 (BOE 28-03-2006) y sus modificaciones vigentes.

### 2. METODOLOGÍA Y ANÁLISIS TÉCNICO

**PASO 1 (OBLIGATORIO): Tabla de Datos de Partida**

| Parámetro | Valor | Fuente (Tabla/Art.) |
| :--- | :--- | :--- |
| **Localización** | Burgos (Capital) | Tabla 3.8 / Datos Proyecto |
| **Altitud** | 856 m | Instituto Geográfico Nacional |
| **Zona climática** | 2 | Anejo E (Mapa zonas) |
| **Valor base $s_k$** | 1,0 kN/m² | Tabla 3.8 (interpolado) |
| **Coef. exposición $c_e$** | 1,0 | Apdo. 3.5.2 (Normal) |
| **Coef. forma $\\mu$** | 1,0 | Tabla 3.7 (Cubierta plana) |

> **Nota Técnica:** La altitud es un factor determinante. Si la ubicación exacta del proyecto difiere de la capital y se sitúa en una cota superior (ej. 950 m), el valor de carga base aumentaría exponencialmente. Se recomienda verificar la cota topográfica exacta del solar.

**PASO 3: Fundamentación Teórica**

Para el cálculo de la carga de nieve por unidad de superficie en proyección horizontal ($q_n$), se emplea la siguiente formulación establecida en el DB-SE-AE:

$$
q_n = \mu \cdot c_e \cdot s_k
$$

**Definición de Variables:**
- **$q_n$**: Carga de nieve por unidad de superficie (kN/m²). Es la acción final a aplicar sobre el modelo de cálculo.
- **$\\mu$**: Coeficiente de forma de la cubierta. Depende de la inclinación de los faldones y de la presencia de obstáculos que puedan producir acumulaciones por viento. Para cubiertas planas sin petos altos, su valor es 1,0.
- **$c_e$**: Coeficiente de exposición. Generalmente es 1,0, salvo en zonas muy expuestas al viento (donde la nieve se barre, $c_e=0,8$) o protegidas (donde se acumula, $c_e=1,2$).
- **$s_k$**: Valor característico de la carga de nieve sobre el terreno (kN/m²). Depende de la zona climática y la altitud.

### 3. DESARROLLO DEL CÁLCULO O VERIFICACIÓN

Procedemos al cálculo numérico sustituyendo los valores identificados:

$$
q_n = 1,0 \cdot 1,0 \cdot 1,0 = 1,0 \text{ kN/m}^2
$$

**Conversión de Unidades:**
Para facilitar la interpretación en obra, convertimos el valor a unidades más intuitivas (kg/m²), considerando que $1 \text{ kN} \approx 100 \text{ kg}$.

$$
1,0 \text{ kN/m}^2 \approx 100 \text{ kg/m}^2
$$

**Análisis de Resultados:**
El valor de **100 kg/m²** representa una carga significativa, equivalente a tener una lámina de agua de 10 cm de espesor sobre toda la cubierta. Este valor debe combinarse con el resto de acciones (peso propio, viento, uso) aplicando los coeficientes de mayoración de cargas correspondientes (1,50 para acciones variables en situaciones persistentes o transitorias).

**Conclusión:**
El valor de cálculo CUMPLE con los mínimos normativos para la zona, siempre que la estructura se dimensione para soportar esta sobrecarga sin superar los Estados Límite Últimos (ELU) ni de Servicio (ELS).

### 4. CITA REGLAMENTARIA LITERAL

Según DB-SE-AE, Sección 3.5.1, párrafo 1:
> "El valor de la carga de nieve por unidad de superficie en proyección horizontal, qn, se determinará mediante la expresión: qn = \mu \cdot ce \cdot sk"

### 5. OBSERVACIONES Y RECOMENDACIONES DE EXPERTO

1.  **Acumulaciones por Viento**: Si el diseño de cubierta incluye petos perimetrales, chimeneas o cambios de nivel, es OBLIGATORIO calcular la carga de nieve por acumulación (Apdo. 3.5.3). El coeficiente $\mu$ puede alcanzar valores de 2.0 o 4.0 en esas zonas locales.
2.  **Drenaje**: Asegurar que los sumideros y gárgolas se mantengan libres de hielo. El peso de la nieve puede aumentar si se transforma en hielo o si se impide el drenaje del agua de deshielo.
3.  **Mantenimiento**: Se recomienda incluir en el Libro del Edificio la prohibición de acumular nieve retirada de otras zonas sobre partes vulnerables de la cubierta durante tareas de limpieza.

### 6. FUENTES DE REFERENCIA

- Código Técnico de la Edificación (CTE), Parte I y Parte II.
- Documento Básico SE-AE Acciones en la Edificación (Versión consolidad con comentarios del Ministerio).
- Mapa de Zonas Climáticas (Anejo E del DB-SE-AE).`;

const simulateStreaming = async (
  onChunk: (text: string) => void, 
  onGrounding: (chunks: any[]) => void
) => {
  // Simulamos un pequeño retraso inicial como si pensara
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulamos referencias (Grounding)
  onGrounding([
    { web: { uri: "https://www.codigotecnico.org/pdf/Documentos/SE/DB_SE-AE.pdf", title: "DB-SE-AE Acciones en la edificación" } },
    { web: { uri: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515", title: "BOE Código Técnico" } }
  ]);

  // Simulamos el streaming de texto carácter a carácter (o bloques pequeños)
  const chunkSize = 8; // Un poco más rápido para textos largos
  for (let i = 0; i < MOCK_RESPONSE_TEXT.length; i += chunkSize) {
    const chunk = MOCK_RESPONSE_TEXT.slice(i, i + chunkSize);
    onChunk(chunk);
    // Velocidad de escritura variable
    await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 15)); 
  }
};

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

export const streamGeminiResponse = async (
  prompt: string,
  attachment: { mimeType: string; data: string } | undefined,
  context: CTEContext,
  messageHistory: Message[],
  onChunk: (text: string) => void,
  onGrounding: (chunks: any[]) => void
) => {
  
  // ---> INTERCEPTOR MOCK
  if (USE_MOCK_API) {
    console.log("🔶 MODO MOCK ACTIVADO: Simulando respuesta sin API Key.");
    await simulateStreaming(onChunk, onGrounding);
    return;
  }
  // <--- FIN INTERCEPTOR MOCK

  // Inicialización con variable de entorno (Standard)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 1. LÓGICA DE FUSIÓN DE PROMPTS
  // Buscamos el rol específico. Si no existe, usamos el GENERAL.
  const specificRoleInstruction = DB_ROLES[context] || DB_ROLES[CTEContext.GENERAL];
  
  // Construimos la instrucción final sumando las partes
  const systemInstruction = `
    ${MASTER_PROMPT}
    
    ===================================================
    ⚠️ INSTRUCCIÓN DE CONTEXTO PRIORITARIO (MODO EXPERTO)
    ===================================================
    ${specificRoleInstruction}
    
    NOTA: Tus respuestas deben centrarse estrictamente en este ámbito técnico.
  `;

  // Transform app messages to SDK history format
  const history = messageHistory.map(m => {
    const parts: any[] = [];
    
    // Add attachments to history if present
    if (m.attachment) {
      parts.push({
        inlineData: {
          mimeType: m.attachment.mimeType,
          data: m.attachment.data
        }
      });
    }
    
    // Add text content
    if (m.content) {
      parts.push({ text: m.content });
    }

    return {
      role: m.role,
      parts: parts
    };
  });

  const chat = ai.chats.create({
    // SELECCIÓN DE MODELO: 'gemini-3-flash-preview'
    // Se usa la versión Flash por ser más eficiente en cuota y evitar errores 429,
    // manteniendo altas capacidades de razonamiento.
    model: 'gemini-3-flash-preview', 
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }], 
      temperature: 0.3, 
      maxOutputTokens: 8192,
      // Se desactiva thinkingConfig explícito para ahorrar tokens y reducir riesgo de 429
      // thinkingConfig: { thinkingBudget: 1024 },
      // Sin filtros de seguridad para contenido técnico
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    },
    history: history
  });

  // Construct current message parts
  let messageContent: any[] = [];

  // Add attachment first if it exists, to provide context before the prompt
  if (attachment) {
    messageContent.push({
      inlineData: { 
        mimeType: attachment.mimeType, 
        data: attachment.data 
      } 
    });
  }

  // Add the text prompt
  messageContent.push({ text: prompt });

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
