import { check } from "express-validator";
import { validarCampos } from "./validar-campos.js";

/**
 * Validaciones para solicitar recuperación
 */
export const validarOlvideContraseña = [
  check("email", "El email es obligatorio").isEmail(),
  validarCampos,
];

/**
 * Validaciones para verificar código
 */
export const validarVerificarCodigo = [
  check("email", "El email es obligatorio").isEmail(),
  check("codigo", "El código es obligatorio").notEmpty(),
  check("codigo", "El código debe tener 6 dígitos").isLength({
    min: 6,
    max: 6,
  }),
  validarCampos,
];

/**
 * Validaciones para cambiar contraseña
 */
export const validarCambiarContraseña = [
  check("email", "El email es obligatorio").isEmail(),
  check("codigo", "El código es obligatorio").notEmpty(),
  check("codigo", "El código debe tener 6 dígitos").isLength({
    min: 6,
    max: 6,
  }),
  check("nueva_contraseña", "La nueva contraseña es obligatoria").notEmpty(),
  check(
    "nueva_contraseña",
    "La contraseña debe tener al menos 6 caracteres",
  ).isLength({ min: 6 }),
  validarCampos,
];
