import { check } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { validarExisteUsuario, validarMembresiActiva } from "../helpers/pagos.js";
import { Pago } from "../models/pago.js";

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

export const validarObtenerPagosPorUsuario = [
    check("usuario_id", "Usuario ID es requerido").notEmpty(),
    check("usuario_id", "Usuario ID debe ser un ID válido de MongoDB").isMongoId().custom(validarExisteUsuario),
    validarCampos
];

export const validarObtenerEstadoMembresia = [
    check("usuario_id", "Usuario ID es requerido").notEmpty(),
    check("usuario_id", "Usuario ID debe ser un ID válido de MongoDB").isMongoId().custom(validarExisteUsuario),
    validarCampos
];

// Middleware para verificar si el usuario es Premium
export const esPremium = async (req, res, next) => {
    const usuario = req.usuario;
    if (!usuario) return res.status(500).json({ msg: 'Falta validar JWT' });
    try {
        const pagoActivo = await Pago.findOne({
            usuario_id: usuario._id,
            estado: 'activo',
            fecha_vencimiento: { $gt: new Date() }
        });
        if (!pagoActivo) return res.status(403).json({ msg: 'Acceso exclusivo Premium' });
        next();
    } catch (error) {
        res.status(500).json({ msg: 'Error verificando premium' });
    }
};
