import { Preference, Payment } from "mercadopago";
import client from "../config/mercadopago.js";
import { Pago } from "../models/pago.js";
import { Usuario } from "../models/usuario.js";
import "dotenv/config";

/**
 * Crear preferencia de pago
 */

// export const crearPreferencia = async (req, res) => {
//   try {
//     const usuario = req.usuario;
//     const { nombre, email, _id: usuarioId } = usuario;

//     // 1. IMPORTANTE: Extraemos lo que viene del Frontend (Vue)
//     // Esto asegura que si envías back_urls desde el front, el backend las use.
//     const { back_urls: urlsDesdeFront, auto_return: autoFront, binary_mode: binaryFront } = req.body;

//     // 2. Fallback del FRONTEND_URL (por si el .env falla)
//     const frontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:5173";

//     const preference = new Preference(client);

//     const body = {
//       items: [
//         {
//           id: "membresia-premium",
//           title: "Membresía Numerología Premium",
//           quantity: 1,
//           unit_price: 4999,
//           currency_id: "COP",
//         },
//       ],
//       payer: {
//         name: nombre || "Usuario",
//         email: email,
//       },
//       // 3. FUSIÓN LÓGICA: Prioridad a lo que manda el Front, si no, usa el Env
//     back_urls: req.body.back_urls, // Usa las que vienen del Frontend

//       // Si el front no manda nada, forzamos estos valores para evitar errores
//       // auto_return: autoFront || "approved", 
//       // binary_mode: binaryFront !== undefined ? binaryFront : true,
      
//       external_reference: usuarioId.toString(),
//       metadata: {
//         usuario_id: usuarioId.toString(),
//       },
//     };

//     console.log("🚀 Generando preferencia para:", email);
//     const response = await preference.create({ body });

//     return res.json({
//       success: true,
//       id: response.id,
//       init_point: response.init_point,
//     });

//   } catch (error) {
//     // Capturamos el error real de la API de Mercado Pago
//     const detailedError = error.response?.data || error.message;
//     console.error("❌ ERROR DETALLADO MP:", JSON.stringify(detailedError, null, 2));

//     return res.status(500).json({
//       success: false,
//       message: "Error al crear la preferencia",
//       detail: detailedError
//     });
//   }
// };

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
        success: `${frontendUrl}/#/usuario/pago-exitoso`,
        failure: `${frontendUrl}/#/usuario/pago-exitoso?status=failure`,
        pending: `${frontendUrl}/#/usuario/pago-exitoso?status=pending`,
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


/**
 * Verificar pago manualmente (Plan B: El usuario pega el ID de operación)
 */
export const verificarPagoManual = async (req, res) => {
  try {
    // Usamos paymentId (del req.params) para que coincida con tu ruta /:paymentId
    const { paymentId } = req.params; 

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        msg: "El ID de operación es requerido",
      });
    }

    const payment = new Payment(client);
    // Consultamos el estado real en la API de Mercado Pago
    const data = await payment.get({ id: paymentId });

    if (data.status === 'approved') {
      // Extraemos el ID del usuario de la referencia externa o metadata
      const usuarioId = data.external_reference || data.metadata?.usuario_id;

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          msg: "No se encontró referencia de usuario en este pago",
        });
      }

      // 1. Verificamos si el pago ya fue registrado para no duplicar
      const pagoExistente = await Pago.findOne({
        payment_id: paymentId.toString(),
      });

      if (!pagoExistente) {
        // 2. Registramos el pago en la base de datos
        const fecha_vencimiento = new Date();
        fecha_vencimiento.setDate(fecha_vencimiento.getDate() + 30);

        await Pago.create({
          usuario_id: usuarioId,
          monto: data.transaction_amount,
          metodo: "mercadopago_manual",
          fecha_pago: new Date(),
          fecha_vencimiento,
          estado: "activo",
          payment_id: paymentId.toString(),
          preference_id: data.order?.id || "",
        });
      }

      // 3. Activamos al usuario definitivamente
      await Usuario.findByIdAndUpdate(usuarioId, {
        estado: "activo",
      });

      console.log(`✅ Usuario ${usuarioId} activado vía Validación Manual`);

      return res.json({
        success: true,
        msg: "¡Pago verificado exitosamente! Tu cuenta ahora es Premium.",
        status: data.status,
        estado: 'activo'
      });

    } else {
      return res.status(400).json({
        success: false,
        msg: `El pago no ha sido aprobado. Estado actual: ${data.status}`,
        status: data.status
      });
    }

  } catch (error) {
    const detailedError = error.response?.data || error.message;
    console.error("❌ Error en verificación manual:", detailedError);

    return res.status(500).json({
      success: false,
      msg: "El ID de operación no es válido o no existe",
      detail: detailedError
    });
  }
};