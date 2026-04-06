import { Preference, Payment } from "mercadopago";
import client from "../config/mercadopago.js";
import { Pago } from "../models/pago.js";
import { Usuario } from "../models/usuario.js";
import "dotenv/config";

/**
 * Crear preferencia de pago
 */
export const crearPreferencia = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { nombre, email, _id: usuarioId } = usuario;

    const frontendUrl = process.env.FRONTEND_URL?.trim();
    const backendUrl = process.env.BACKEND_URL?.trim();

    if (!frontendUrl || !backendUrl) {
      return res.status(500).json({ 
        success: false, 
        error: "Faltan variables de entorno (FRONTEND_URL o BACKEND_URL)" 
      });
    }

    const preference = new Preference(client);

    const body = {
      items: [
        {
          id: "membresia-premium",
          title: "Membresía Numerología Premium",
          description: "Acceso total a todas tus lecturas numerológicas",
          quantity: 1,
          unit_price: 4999, // PRECIO: 4.999 COP
          currency_id: "COP",
        },
      ],
      payer: {
        name: nombre || "Usuario",
        email: email,
      },
      // URLs de retorno: Quitamos el auto_return para que el '#' no de error
      back_urls: {
        success: `${frontendUrl}/#/user/pago-exitoso`,
        failure: `${frontendUrl}/#/user/pago-exitoso?status=failure`,
        pending: `${frontendUrl}/#/user/pago-exitoso?status=pending`,
      },
      // auto_return: "all",  <-- ELIMINADO PARA EVITAR EL ERROR 500
      external_reference: usuarioId.toString(),
      metadata: {
        usuario_id: usuarioId.toString(),
      },
    };

    console.log("🚀 Generando link de tienda para:", email);
    const response = await preference.create({ body });

    return res.json({
      success: true,
      id: response.id,
      init_point: response.init_point,
    });

  } catch (error) {
    // Si la API de MP responde con error, capturamos el detalle
    const detailedError = error.response?.data || error.message;
    console.error("❌ ERROR DETALLADO MP:", JSON.stringify(detailedError, null, 2));

    return res.status(500).json({
      success: false,
      message: "Mercado Pago rechazó la conexión",
      detail: detailedError // Enviamos el detalle al frontend para verlo en consola
    });
  }
};

/**
 * Webhook Mercado Pago
 */
export const recibirNotificacion = async (req, res) => {
  try {
    const { topic, resource } = req.query;

    if (topic !== "payment" || !resource) {
      return res.status(200).send("OK");
    }

    const paymentId = resource.split("/").pop();

    const payment = new Payment(client);
    const data = await payment.get({ id: paymentId });

    if (data.status === "approved") {
      const usuarioId =
        data.external_reference ||
        data.metadata?.usuario_id;

      if (!usuarioId) {
        return res.status(200).send("OK");
      }

      const pagoExistente = await Pago.findOne({
        payment_id: paymentId.toString(),
      });

      if (pagoExistente) {
        return res.status(200).send("OK");
      }

      const fecha_vencimiento = new Date();
      fecha_vencimiento.setDate(
        fecha_vencimiento.getDate() + 30
      );

      await Pago.create({
        usuario_id: usuarioId,
        monto: data.transaction_amount,
        metodo: "mercadopago",
        fecha_pago: new Date(),
        fecha_vencimiento,
        estado: "activo",
        payment_id: paymentId.toString(),
        preference_id: data.order?.id || "",
      });

      await Usuario.findByIdAndUpdate(usuarioId, {
        estado: "activo",
      });

      console.log(`✅ Usuario ${usuarioId} activado`);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Error webhook:", error);
    return res.status(200).send("OK");
  }
};

/**
 * Verificar pago manualmente
 */
export const verificarPago = async (req, res) => {
  try {
    const { payment_id } = req.query;

    if (!payment_id) {
      return res.status(400).json({
        success: false,
        error: "payment_id es requerido",
      });
    }

    const payment = new Payment(client);
    const data = await payment.get({ id: payment_id });

    return res.json({
      success: true,
      status: data.status,
      payment: data,
    });
  } catch (error) {
    console.error("Error verificando pago:", error);

    return res.status(500).json({
      success: false,
      error: "No se pudo verificar el pago",
    });
  }
};