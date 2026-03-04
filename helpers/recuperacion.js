import nodemailer from "nodemailer";
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
 * Configura el transporte de email con Gmail
 */
const crearTransporte = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Envía email con el código de recuperación
 */
export const enviarCodigoRecuperacion = async (email, codigo) => {
  try {
    const transporte = crearTransporte();

    const opciones = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Código de recuperación de contraseña",
      html: `
        <h2>Recuperación de Contraseña</h2>
        <p>Tu código de recuperación es:</p>
        <h3 style="color: #007bff; letter-spacing: 5px;">${codigo}</h3>
        <p>Este código expira en <strong>15 minutos</strong>.</p>
        <p>Si no solicitaste este código, ignora este email.</p>
      `,
    };

    await transporte.sendMail(opciones);
    console.log(`✅ Código enviado a ${email}`);
  } catch (error) {
    console.error("❌ Error al enviar email:", error.message);
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
