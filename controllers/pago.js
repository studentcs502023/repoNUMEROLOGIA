import { Pago } from "../models/pago.js";
import { Usuario } from "../models/usuario.js";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";



// POST Crear preferencia de mercado pago
const crearPreferencia = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { _id: usuario_id } = usuario;

    // 1. Verificar si ya tiene membresía activa
    const pagoActivo = await Pago.findOne({
      usuario_id: usuario_id,
      fecha_vencimiento: { $gt: new Date() },
      estado: "activo",
    });

    if (pagoActivo) {
      return res.status(409).json({
        error: "Ya tienes una membresía activa",
        fecha_vencimiento: pagoActivo.fecha_vencimiento,
      });
    }

    // 2. Crear preferencia en Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN.trim(),
    });

    const preference = new Preference(client);

    // IMPORTANTE: back_urls requieren URLs públicas (no localhost).
    // Usamos BACKEND_URL (el túnel) como base de redirección al frontend.
    const backUrlBase = process.env.BACKEND_URL;

    const result = await preference.create({
      body: {
        items: [
          {
            id: "membresia-numerologia",
            title: "Membresía Numerología",
            quantity: 1,
            unit_price: 19900,
            currency_id: "COP",
          },
        ],
        payer: {
          email: usuario.email,
        },
        back_urls: {
          success: `${backUrlBase}/api/pagos/retorno?status=approved`,
          failure: `${backUrlBase}/api/pagos/retorno?status=failure`,
          pending: `${backUrlBase}/api/pagos/retorno?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${backUrlBase}/api/pagos/webhook`,
        metadata: {
          usuario_id: usuario_id.toString(),
        },
      },
    });

    res.json({
      id: result.id,
      init_point: result.init_point,
    });
  } catch (error) {
    console.error("Error al crear preferencia MP:", error.message);
    res.status(500).json({
      error: "Error al crear la preferencia de pago",
      detalle: error.message,
    });
  }
};

// POST Recibir Webhook de Mercado Pago
const recibirWebhook = async (req, res) => {
  try {
    const { query } = req;
    const topic = query.topic || query.type;

    if (topic === "payment") {
      const paymentId = query.id || query["data.id"];
      
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN.trim(),
      });

      const payment = new Payment(client);
      const data = await payment.get({ id: paymentId });

      if (data.status === "approved") {
        const usuario_id = data.metadata.usuario_id;
        const monto = data.transaction_amount;
        const paymentIdStr = paymentId.toString();

        const pagoExistenteStr = paymentIdStr;
        
        // Calculo de fecha de vencimiento (30 días)
        const fechaPago = new Date();
        const fecha_vencimiento = new Date(
          fechaPago.getTime() + 30 * 24 * 60 * 60 * 1000,
        );

        // ✅ Usar findOneAndUpdate con upsert para evitar Race Conditions (que 2 webhooks creen 2 pagos a la vez)
        const resultadoMongo = await Pago.findOneAndUpdate(
          { payment_id: pagoExistenteStr }, // Buscar si ya existe este payment_id
          {
            $setOnInsert: {
              usuario_id,
              monto,
              metodo: "mercadopago",
              fecha_pago: fechaPago,
              fecha_vencimiento: fecha_vencimiento,
              estado: "activo",
              payment_id: pagoExistenteStr,
              preference_id: data.order?.id ? data.order.id.toString() : null,
            }
          },
          { upsert: true, new: false } // upsert inserta si no existe. new: false devuelve null si acaba de ser insertado.
        );

        if (resultadoMongo) {
          // Si resultadoMongo NO es nulo, significa que ANTES ya existía este documento, por lo tanto es un webhook duplicado.
          console.log(`Webhook duplicado ignorado (ya estaba en DB) para payment_id: ${pagoExistenteStr}`);
          return res.sendStatus(200);
        }

        // Si llegó aquí, es porque acabamos de insertarlo ($setOnInsert) y activamos al usuario
        await Usuario.findByIdAndUpdate(usuario_id, { estado: "activo" });

        console.log(`Primer pago aprobado procesado para usuario: ${usuario_id} (Payment ${pagoExistenteStr})`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error en webhook:", error.message);
    res.status(500).json({ error: "Error al procesar webhook" });
  }
};

// POST Crear pago y activar membresia (Original - para admin o manual)
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
      msg: "Pago regsitrado exitosamente",
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

// GET Retorno desde Mercado Pago: redirige al frontend con el estado del pago
const retornoMercadoPago = (req, res) => {
  const status = req.query.status || req.query.collection_status || "";
  const frontendUrl = process.env.FRONTEND_URL;
  // Redireccionamos al frontend con el estado como query param
  res.redirect(`${frontendUrl}/#/usuario/pago-exitoso?status=${status}`);
};

export {
  postPago,
  getPagos,
  getPagosUsuario,
  getEstadoMembresia,
  crearPreferencia,
  recibirWebhook,
  retornoMercadoPago,
};
