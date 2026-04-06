import { Pago } from "../models/pago.js";
import { Usuario } from "../models/usuario.js";

// POST Crear pago y activar membresia (Para admin o manual)
const postPago = async (req, res) => {
  try {
    const { usuario_id, monto, metodo } = req.body;

    // validacion para verificar que el usuario existe en la BD
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ error: " Usuario no encontrado" });
    }

    // validacion para verficiar si membresia esta activa

    const pagoActivo = await Pago.findOne({
      usuario_id: usuario_id,
      fecha_vencimiento: { $gt: new Date() },
    });

    if (pagoActivo) {
      return res.status(409).json({
        error: "ya tienes una membresia activa",
        fecha_vencimiento: pagoActivo.fecha_vencimiento,
      });
    }

    // calculo de fecha de vencimiento

    const fechaPago = new Date();
    const fecha_vencimiento = new Date(
      fechaPago.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    // nuevo pago
    const nuevoPago = new Pago({
      usuario_id,
      monto,
      metodo,
      fecha_pago: fechaPago,
      fecha_vencimiento: fecha_vencimiento,
      estado: "activo",
    });

    await nuevoPago.save();
    await Usuario.findByIdAndUpdate(usuario_id, { estado: "activo" });

    res.status(201).json({
      msg: "Pago registrado exitosamente",
      pago: nuevoPago,
    });
  } catch (error) {
    console.error("Error al crear pago:", error.message);
    res.status(500).json({
      error: "Error al crear pago",
      detalle: error.message,
    });
  }
};

//Get obtener todos los pagos

const getPagos = async (req, res) => {
  try {
    const pagos = await Pago.find().populate("usuario_id", "nombre email");

    res.json({
      success: true,
      total: pagos.length,
      data: pagos,
    });
  } catch (error) {
    console.error("Error al obtener pagos:", error.message);
    res.status(500).json({
      error: "Error al obtener pagos",
      detalle: error.message,
    });
  }
};

// Get Obtener pagos por usuario

const getPagosUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado" });
    }

    const pagos = await Pago.find({ usuario_id });

    res.json({
      success: true,
      usuario_id,
      nombre: usuario.nombre,
      total_pagos: pagos.length,
      data: pagos,
    });
  } catch (error) {
    console.error("Error al obtener pagos del usuario", error.message);
    res.status(500).json({
      error: "Error al obtener pagos del usuario",
      detalle: error.message,
    });
  }
};

//GET : consultar estado de membresia

const getEstadoMembresia = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // buscar pago activo
    const pagoActivo = await Pago.findOne({
      usuario_id,
      fecha_vencimiento: { $gt: new Date() },
    });

    const estadoMembresia = pagoActivo ? "activo" : "inactivo";

    res.json({
      usuario_id,
      nombre: usuario.nombre,
      estadoMembresia: estadoMembresia,
      fecha_vencimiento: pagoActivo?.fecha_vencimiento || null,
    });
  } catch (error) {
    console.error("Error al consultar estado de membresia:", error.message);
    res.status(500).json({
      error: "Error al consultar estado de membresia",
      detalle: error.message,
    });
  }
};

export {
  postPago,
  getPagos,
  getPagosUsuario,
  getEstadoMembresia
};
