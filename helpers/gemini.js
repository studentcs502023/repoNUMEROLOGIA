import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Leer las API keys desde .env (separadas por coma)
const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;

if (!keysString) {
    throw new Error('No se encontraron GEMINI_API_KEYS en el .env');
}

// Convertir string en array de keys
const keys = keysString
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0);

if (keys.length === 0) {
    throw new Error('No hay API keys válidas en GEMINI_API_KEYS');
}

// Índice actual para rotación
let currentIndex = 0;

console.log(`✅ Sistema de rotación de API keys inicializado con ${keys.length} claves`);

/**
 * Obtiene el modelo Gemini con una API key rotada
 */
export function getGeminiModel() {
    const apiKey = keys[currentIndex];
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Rotar al siguiente índice
    currentIndex = (currentIndex + 1) % keys.length;
    
    return model;
}