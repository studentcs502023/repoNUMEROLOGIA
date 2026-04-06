import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Usuario } from "../models/usuario.js";

dotenv.config();

/**
 * Middleware para validar JWT
 */
export const validarJWT = async (req, res, next) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      error: "No hay token",
      msg: "Sesión no válida",
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar usuario
    const usuario = await Usuario.findById(uid);
    if (!usuario) {
      return res.status(401).json({
        error: "No hay usuario",
        msg: "El usuario no existe en la base de datos",
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error("❌ Error en validarJWT:", error.message);
    return res.status(401).json({
      error: "Token inválido",
      msg: "Tu sesión ha expirado",
    });
  }
};

/**
 * Generador de JWT
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
