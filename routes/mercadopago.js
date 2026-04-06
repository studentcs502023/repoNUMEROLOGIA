import { Router } from "express";
import {
  crearPreferencia,
  recibirNotificacion,
  verificarPago
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

// Verificar manualmente
routerMP.get(
  "/verify-payment",
  validarJWT,
  verificarPago
);

export default routerMP;