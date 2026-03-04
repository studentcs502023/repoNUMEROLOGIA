import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Usuario } from "../models/usuario.js";

dotenv.config();

/**
 * Genera un JWT token para un usuario
 * @param {string} uid - ID del usuario
 * @returns {Promise<string>} Token generado
 */
export const generarJWT = (uid) => {
  return new Promise((resolve, reject) => {
    const payload = { uid };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "4h" },
      (err, token) => {
        if (err) {
          console.error("Error al generar JWT:", err);
          reject("No se pudo generar el token");
        } else {
          resolve(token);
        }
      },
    );
  });
};

/**
 * Middleware para validar JWT
 * Verifica que el token sea válido y que el usuario exista
 */
export const validarJWT = async (req, res, next) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      error: "No hay token en la petición",
      msg: "Se requiere autenticación",
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario exista en BD
    const usuario = await Usuario.findById(uid);

    if (!usuario) {
      return res.status(401).json({
        error: "Token no válido",
        msg: "El usuario no existe",
      });
    }

    // Pasar el usuario al request para usarlo en controladores
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error("Error al validar JWT:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expirado",
        msg: "Por favor, inicia sesión nuevamente",
      });
    }

    return res.status(401).json({
      error: "Token no válido",
      msg: "No se pudo validar el token",
    });
  }
};
