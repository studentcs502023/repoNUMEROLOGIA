import { Router } from "express";
import { postPago, getPagos, getPagosUsuario, getEstadoMembresia, crearPreferencia, recibirWebhook, retornoMercadoPago } from "../controllers/pago.js";

import {
    validarCrearPago,
    validarObtenerPagosPorUsuario,
    validarObtenerEstadoMembresia
} from "../middlewares/pagos.js";

const routerPago = Router();

// Mercado Pago Routes
routerPago.post("/crear-preferencia", crearPreferencia);
routerPago.post("/webhook", recibirWebhook);
// Ruta de retorno: Mercado Pago redirige aquí, luego el backend redirige al frontend
routerPago.get("/retorno", retornoMercadoPago);

// GET http://localhost:3000/api/pagos
routerPago.get("/",  getPagos);

// POST http://localhost:3000/api/pagos
routerPago.post("/", [validarCrearPago], postPago);

// GET http://localhost:3000/api/pagos/usuario/:usuario_id
routerPago.get("/usuario/:usuario_id", [ validarObtenerPagosPorUsuario], getPagosUsuario);

// GET http://localhost:3000/api/pagos/estado/:usuario_id
routerPago.get("/estado/:usuario_id", [ validarObtenerEstadoMembresia], getEstadoMembresia);

export default routerPago;