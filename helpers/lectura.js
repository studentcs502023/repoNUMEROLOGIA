import dotenv from "dotenv";
import { Lectura } from "../models/lecturas.js";
import { getGeminiModel } from "./gemini.js";

dotenv.config();

// Clase personalizada para error de lectura ya existente
export class LecturaYaExisteError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "LecturaYaExisteError";
  }
}

/**
 * Genera contenido de lectura numerológica usando IA
 * Utiliza rotación automática de API keys
 * @param {string} tipo - 'principal' o 'diaria'
 * @param {Date} fecha_nacimiento - Fecha de nacimiento del usuario
 * @returns {Promise<string>}
 */
async function generarContenidoIA(
  tipo,
  fecha_nacimiento,
  nombre_completo = null,
) {
  if (!fecha_nacimiento) {
    throw new Error(
      "Fecha de nacimiento no disponible para generar la lectura",
    );
  }

  let prompt;

  if (tipo === "principal") {
    const fecha = new Date(fecha_nacimiento).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    const tieneNombre = nombre_completo && nombre_completo.trim().length > 0;

    prompt = `Eres un experto numerólogo con más de 20 años de experiencia. 
        
Datos disponibles:
- Fecha de nacimiento: ${fecha}
${tieneNombre ? `- Nombre completo: ${nombre_completo}` : "- Nombre completo: no disponible"}

Realiza una lectura numerológica principal completa que incluya:

1. **Número del Destino**: Calcula y analiza el número del destino a partir de la fecha de nacimiento.

${tieneNombre
        ? `2. **Número de la Personalidad**: Calcula usando las consonantes de "${nombre_completo}" con el sistema Pitagórico.
3. **Número de la Expresión**: Calcula usando todas las letras de "${nombre_completo}" con el sistema Pitagórico.`
        : `2. **Número de la Personalidad**: El nombre no está disponible, usa el día de nacimiento como aproximación y aclara esta limitación.
3. **Número de la Expresión**: El nombre no está disponible, usa los componentes de la fecha como aproximación y aclara esta limitación.`
      }

4. **Análisis General**: Insights sobre la vida del usuario basado en los números anteriores.

Sé específico, profundo y misterioso. La lectura debe ser poética pero fundamentada en principios numerológicos reales.
Responde en español y en un tono inspirador pero realista.`;
  } else {
    const fechaActual = new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC"
    });

    prompt = `Eres un experto numerólogo. Proporciona una lectura numerológica diaria para hoy (${fechaActual}).

Basándote en los principios numerológicos, ofrece:

1. **Número del Día**: Calcula el número del día actual (suma de dígitos)
2. **Energía del Día**: Describe la energía predominante y su significado
3. **Consejo Numerológico**: Un mensaje inspirador basado en el número del día
4. **Recomendaciones**: Qué hacer y qué evitar hoy según la numerología

Sé conciso pero profundo. Responde en español con un tono inspirador y útil.`;
  }

  try {
    console.log("📝 Generando contenido tipo:", tipo);

    // Obtener modelo con API key rotada
    const model = getGeminiModel();

    const result = await model.generateContent(prompt);
    const response = result.response;
    const texto = response.text();

    if (!texto || texto.trim().length === 0) {
      throw new Error("La IA no generó contenido válido");
    }

    console.log("✅ Contenido generado exitosamente");
    return texto;
  } catch (error) {
    console.error("❌ Error de Gemini:", error.message);

    if (error.message.includes("API_KEY") || error.message.includes("401")) {
      throw new Error("Clave de API de Gemini inválida o no configurada");
    }

    if (error.message.includes("quota") || error.message.includes("429")) {
      throw new Error(
        "Límite de uso de la API de Gemini excedido. Intenta más tarde",
      );
    }

    if (error.message.includes("timeout")) {
      throw new Error("Tiempo de espera agotado al conectar con la IA");
    }

    throw new Error("No se pudo generar la lectura con IA: " + error.message);
  }
}

/**
 * Crea una lectura principal para un usuario
 * Solo puede haber una lectura principal por usuario
 */
export async function crearLecturaPrincipal(
  usuario_id,
  fecha_nacimiento,
  nombre_completo = null,
) {
  // Verificar si ya existe una lectura principal
  const lecturaPrincipalExiste = await Lectura.findOne({
    usuario_id,
    tipo: "principal",
  });

  if (lecturaPrincipalExiste) {
    throw new LecturaYaExisteError(
      "Este usuario ya tiene generada una lectura principal",
    );
  }

  // Generar contenido con IA
  const contenido = await generarContenidoIA(
    "principal",
    fecha_nacimiento,
    nombre_completo,
  );

  // Crear y guardar lectura
  const lectura = new Lectura({
    usuario_id,
    tipo: "principal",
    contenido,
    fecha_lectura: new Date(),
  });

  await lectura.save();

  return {
    id_lectura: lectura._id,
    tipo: "principal",
    contenido,
    fecha_lectura: lectura.fecha_lectura,
  };
}

/**
 * Crea una lectura diaria para un usuario
 * Se puede crear múltiples veces por usuario
 */
export async function crearLecturaDiaria(usuario_id, fecha_nacimiento) {
  // Generar contenido con IA
  const contenido = await generarContenidoIA("diaria", fecha_nacimiento);

  // Crear y guardar lectura
  const lectura = new Lectura({
    usuario_id,
    tipo: "diaria",
    contenido,
    fecha_lectura: new Date(),
  });

  await lectura.save();

  return {
    id_lectura: lectura._id,
    tipo: "diaria",
    contenido,
    fecha_lectura: lectura.fecha_lectura,
  };
}

/**
 * Obtiene todas las lecturas de un usuario ordenadas por fecha descendente
 */
export async function obtenerLecturasPorUsuario(usuario_id) {
  const lecturas = await Lectura.find({ usuario_id }).sort({
    fecha_lectura: -1,
  });

  return lecturas;
}

/**
 * Obtiene una lectura específica por ID con datos del usuario
 */
export async function obtenerLecturaPorId(id) {
  const lectura = await Lectura.findById(id).populate(
    "usuario_id",
    "nombre email",
  );

  return lectura;
}
