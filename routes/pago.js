import { Router } from "express";
import { postPago, getPagos, getPagosUsuario,getEstadoMembresia } from "../controllers/pago.js";
import {
    validarCrearPago,
    validarObtenerPagosPorUsuario,
    validarObtenerEstadoMembresia
} from "../middlewares/pagos.js";

const routerPago = Router();

// GET http://localhost:3000/api/pagos
routerPago.get("/", getPagos);

// POST http://localhost:3000/api/pagos
routerPago.post("/", validarCrearPago, postPago);

// GET http://localhost:3000/api/pagos/usuario/:usuario_id
routerPago.get("/usuario/:usuario_id", validarObtenerPagosPorUsuario, getPagosUsuario);

// GET http://localhost:3000/api/pagos/estado/:usuario_id
routerPago.get("/estado/:usuario_id", validarObtenerEstadoMembresia, getEstadoMembresia);

export default routerPago;