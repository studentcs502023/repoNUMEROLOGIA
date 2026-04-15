import { Router } from "express";
import {
  crearPreferencia,
  recibirNotificacion,
  verificarPago,
  verificarPagoManual
} from "../controllers/mercadopago.js";
import { validarJWT } from "../helpers/validar-JWT.js";

const routerMP = Router();

// Crear link de pago
routerMP.post(
  "/crear-preferencia",
  validarJWT,
  crearPreferencia
);

// Webhook Mercado Pago
routerMP.post("/webhook", recibirNotificacion);
routerMP.get("/webhook", recibirNotificacion);

// // Verificar manualmente
// routerMP.get(
//   "/verify-payment",
//   validarJWT,
//   verificarPago
// );

/**
 * RUTA 3: Verificación Manual (El "Plan B")
 * Se activa cuando el usuario pega el ID de operación en el input
 * El :paymentId es el que recibimos en req.params
 */
routerMP.get(
  "/verificar-pago/:paymentId", 
  validarJWT, 
  verificarPagoManual
);
export default routerMP;