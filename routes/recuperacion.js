import { Router } from "express";
import {
  postOlvideContraseña,
  postVerificarCodigo,
  postCambiarContraseña,
} from "../controllers/recuperacion.js";
import {
  validarOlvideContraseña,
  validarVerificarCodigo,
  validarCambiarContraseña,
} from "../middlewares/recuperacion.js";

const routerRecuperacion = Router();

/**
 * POST http://localhost:3000/api/usuarios/olvide-contraseña
 * Solicita un código de recuperación por email
 */
routerRecuperacion.post(
  "/olvide-contraseña",
  validarOlvideContraseña,
  postOlvideContraseña,
);

/**
 * POST http://localhost:3000/api/usuarios/verificar-codigo
 * Verifica que el código sea correcto
 */
routerRecuperacion.post(
  "/verificar-codigo",
  validarVerificarCodigo,
  postVerificarCodigo,
);

/**
 * POST http://localhost:3000/api/usuarios/cambiar-contraseña
 * Cambia la contraseña después de verificar el código
 */
routerRecuperacion.post(
  "/cambiar-contraseña",
  validarCambiarContraseña,
  postCambiarContraseña,
);

export default routerRecuperacion;
