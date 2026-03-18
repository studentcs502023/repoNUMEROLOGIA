import { check } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { validarExisteUsuario, validarMembresiActiva } from "../helpers/pagos.js";

// Validaciones para POST pago
export const validarCrearPago = [
    check("usuario_id", "Usuario ID es requerido").notEmpty(),
    check("usuario_id", "Usuario ID debe ser un ID válido de MongoDB").isMongoId().custom(validarExisteUsuario),
    check("monto", "Monto es requerido").notEmpty(),
    check("monto", "Monto debe ser un número positivo").isFloat({ min: 0.01 }),
    check("metodo", "Método de pago es requerido").notEmpty(),
    check("metodo", "Método debe ser: tarjeta, efectivo, transferencia o mercadopago").isIn(["tarjeta", "efectivo", "transferencia", "mercadopago"]),
    check("usuario_id").custom(validarMembresiActiva),
    validarCampos
];

// Validaciones para GET pagos por usuario
export const validarObtenerPagosPorUsuario = [
    check("usuario_id", "Usuario ID es requerido").notEmpty(),
    check("usuario_id", "Usuario ID debe ser un ID válido de MongoDB").isMongoId().custom(validarExisteUsuario),
    validarCampos
];

// Validaciones para GET estado membresía
export const validarObtenerEstadoMembresia = [
    check("usuario_id", "Usuario ID es requerido").notEmpty(),
    check("usuario_id", "Usuario ID debe ser un ID válido de MongoDB").isMongoId().custom(validarExisteUsuario),
    validarCampos
];