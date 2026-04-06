import { Pago } from "../models/pago.js";
import { Usuario } from "../models/usuario.js";

// Validar que el usuario existe
export const validarExisteUsuario = async (usuario_id) => {
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
        throw new Error(`El usuario con ID ${usuario_id} no está registrado`);
    }
};

// Validar que no haya membresía activa
export const validarMembresiActiva = async (usuario_id) => {
    const pagoActivo = await Pago.findOne({
        usuario_id,
        fecha_vencimiento: { $gt: new Date() }
    });

    if (pagoActivo) {
        throw new Error(`El usuario ya tiene una membresía activa hasta ${pagoActivo.fecha_vencimiento}`);
    }
};

// Validar que el pago existe
export const validarExistePago = async (pago_id) => {
    const pago = await Pago.findById(pago_id);
    if (!pago) {
        throw new Error(`El pago con ID ${pago_id} no existe`);
    }
};