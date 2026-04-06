import axios from "axios";
import dotenv from "dotenv";
import { Usuario } from "../models/usuario.js";
import bcryptjs from "bcryptjs";

dotenv.config();

/**
 * Genera un código de 6 dígitos aleatorio
 */
export const generarCodigo = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Envía email con el código de recuperación usando Brevo API REST
 */
export const enviarCodigoRecuperacion = async (email, codigo) => {
  try {
    console.log(`📡 Intentando enviar código a: ${email} usando ${process.env.EMAIL_USER}`);
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Numerología ✨",
          email: process.env.EMAIL_USER,
        },
        to: [{ email }],
        subject: "Código de recuperación de contraseña",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #4c1d95; text-align: center;">Recuperación de Contraseña</h2>
            <p>Has solicitado restablecer tu contraseña en <strong>Numerología ✨</strong>.</p>
            <p>Tu código de recuperación es:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #6d28d9; letter-spacing: 5px;">${codigo}</span>
            </div>
            <p>Este código expira en <strong>15 minutos</strong>.</p>
            <p style="color: #6b7280; font-size: 14px;">Si no solicitaste este código, puedes ignorar este mensaje con seguridad.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="text-align: center; color: #9ca3af; font-size: 12px;">© 2025 Numerología Mística</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Código enviado exitosamente a ${email}. Response ID: ${response.data.messageId}`);
  } catch (error) {
    console.error("❌ Error detallado al enviar email con Brevo:");
    if (error.response) {
      console.error("Data:", JSON.stringify(error.response.data));
      console.error("Status:", error.response.status);
    } else {
      console.error("Mensaje:", error.message);
    }
    throw new Error("No se pudo enviar el código por email");
  }
};

/**
 * Solicita recuperación de contraseña
 */
export const solicitarRecuperacion = async (email) => {
  try {
    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Generar código
    const codigo = generarCodigo();

    // Calcular fecha de expiración (15 minutos)
    const ahora = new Date();
    const fechaExpiracion = new Date(ahora.getTime() + 15 * 60 * 1000);

    // Guardar código en BD
    await Usuario.findByIdAndUpdate(usuario._id, {
      codigoRecuperacion: codigo,
      fechaExpiracionCodigo: fechaExpiracion,
    });

    // Enviar email
    await enviarCodigoRecuperacion(email, codigo);

    return {
      success: true,
      msg: "Código enviado a tu email",
    };
  } catch (error) {
    console.error("Error en solicitarRecuperacion:", error.message);
    throw error;
  }
};

/**
 * Verifica que el código sea correcto y no haya expirado
 */
export const verificarCodigo = async (email, codigo) => {
  try {
    // Buscar usuario
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar que el código coincida
    if (usuario.codigoRecuperacion !== codigo) {
      throw new Error("Código incorrecto");
    }

    // Verificar que no haya expirado
    const ahora = new Date();
    if (ahora > usuario.fechaExpiracionCodigo) {
      throw new Error("Código expirado");
    }

    return {
      success: true,
      msg: "Código verificado correctamente",
    };
  } catch (error) {
    console.error("Error en verificarCodigo:", error.message);
    throw error;
  }
};

/**
 * Cambia la contraseña después de verificar el código
 */
export const cambiarContraseña = async (email, codigo, nuevaContraseña) => {
  try {
    // Buscar usuario
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar código y expiración
    if (usuario.codigoRecuperacion !== codigo) {
      throw new Error("Código incorrecto");
    }

    const ahora = new Date();
    if (ahora > usuario.fechaExpiracionCodigo) {
      throw new Error("Código expirado");
    }

    // Hashear nueva contraseña
    const salt = bcryptjs.genSaltSync();
    const passwordHasheada = bcryptjs.hashSync(nuevaContraseña, salt);

    // Actualizar contraseña y limpiar código
    await Usuario.findByIdAndUpdate(usuario._id, {
      password: passwordHasheada,
      codigoRecuperacion: null,
      fechaExpiracionCodigo: null,
    });

    return {
      success: true,
      msg: "Contraseña actualizada correctamente",
    };
  } catch (error) {
    console.error("Error en cambiarContraseña:", error.message);
    throw error;
  }
};
