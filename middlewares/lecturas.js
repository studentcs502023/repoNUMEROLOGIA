import { check } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { validarExisteUsuario } from "../helpers/usuarios.js";

// Validaciones para POST lectura principal
export const validarCrearLecturaPrincipal = [
    check("usuario_id", "Usuario ID es requerido").notEmpty(),
    check("usuario_id", "Usuario ID debe ser un ID válido de MongoDB").isMongoId().custom(validarExisteUsuario),
    validarCampos
];

// Validaciones para POST lectura diaria
export const validarCrearLecturaDiaria = [
    check("usuario_id", "Usuario ID es requerido").notEmpty(),
    check("usuario_id", "Usuario ID debe ser un ID válido de MongoDB").isMongoId().custom(validarExisteUsuario),
    validarCampos
];

// Validaciones para GET lecturas por usuario
export const validarObtenerLecturasPorUsuario = [
    check("usuario_id", "Usuario ID es requerido").notEmpty(),
    check("usuario_id", "Usuario ID debe ser un ID válido de MongoDB").isMongoId().custom(validarExisteUsuario),
    validarCampos
];

// Validaciones para GET lectura por ID
export const validarObtenerLectura = [
    check("id", "ID es requerido").notEmpty(),
    check("id", "ID debe ser un ID válido de MongoDB").isMongoId(),
    validarCampos
];