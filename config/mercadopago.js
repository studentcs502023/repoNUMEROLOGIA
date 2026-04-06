import { MercadoPagoConfig } from 'mercadopago';
import 'dotenv/config';

// Limpiamos el token de comillas y espacios para evitar el error UNAUTHORIZED
const token = (process.env.MERCADOPAGO_ACCESS_TOKEN || "").replace(/['"]+/g, '').trim();

if (!token) {
    console.error("❌ ERROR: El MERCADOPAGO_ACCESS_TOKEN está vacío en el .env");
}

const client = new MercadoPagoConfig({ 
    accessToken: token 
});

export default client;