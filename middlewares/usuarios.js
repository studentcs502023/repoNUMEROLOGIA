import { check } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { validarEmail, validarExisteUsuario } from "../helpers/usuarios.js";

// Validaciones para GET usuario por ID
export const validarObtenerUsuario = [
    check("id", "No es un ID válido de mongo").isMongoId(),
    check("id").custom(validarExisteUsuario),
    validarCampos
];

// Validaciones para POST crear usuario (con password)
export const validarCrearUsuario = [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("nombre", "El nombre debe tener al menos 3 caracteres").isLength({ min: 3 }),
    check("email", "El correo no es válido").isEmail(),
    check("email").custom(validarEmail),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    check("password", "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
    check("fechaNacimiento", "La fecha de nacimiento es obligatoria").not().isEmpty(),
    check("fechaNacimiento", "Formato de fecha inválido (YYYY-MM-DD)").isISO8601().toDate(),
    check("fechaNacimiento").custom((value) => {
        const year = new Date(value).getFullYear();
        if (year > 2026) {
            throw new Error("La fecha de nacimiento no puede ser posterior al año 2026");
        }
        return true;
    }),
    validarCampos
];

// Validaciones para PUT actualizar usuario
export const validarActualizarUsuario = [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(validarExisteUsuario),
    check("nombre", "El nombre es obligatorio").optional().not().isEmpty(),
    check("fechaNacimiento", "Formato de fecha inválido").optional().isISO8601().toDate(),
    check("fechaNacimiento").optional().custom((value) => {
        const year = new Date(value).getFullYear();
        if (year > 2026) {
            throw new Error("La fecha de nacimiento no puede ser posterior al año 2026");
        }
        return true;
    }),
    validarCampos
];

// Validaciones para DELETE usuario
export const validarEliminarUsuario = [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(validarExisteUsuario),
    validarCampos
];

// Validaciones para LOGIN
export const validarLogin = [
    check("email", "El email es obligatorio").isEmail(),
    check("password", "La contraseña es obligatoria").notEmpty(),
    validarCampos
];