import { Router } from "express";
import {
    postLecturaPrincipal,
    postLecturaDiaria,
    getLecturasPorUsuario,
    getLectura
} from "../controllers/lecturas.js";
import {
    validarCrearLecturaPrincipal,
    validarCrearLecturaDiaria,
    validarObtenerLecturasPorUsuario,
    validarObtenerLectura
} from "../middlewares/lecturas.js";

const routerLectura = Router();

// POST http://localhost:3000/api/lecturas/principal/:usuario_id
routerLectura.post("/principal/:usuario_id", validarCrearLecturaPrincipal, postLecturaPrincipal);

// POST http://localhost:3000/api/lecturas/diaria/:usuario_id
routerLectura.post("/diaria/:usuario_id", validarCrearLecturaDiaria, postLecturaDiaria);

// GET http://localhost:3000/api/lecturas/usuario/:usuario_id
routerLectura.get("/usuario/:usuario_id", validarObtenerLecturasPorUsuario, getLecturasPorUsuario);

// GET http://localhost:3000/api/lecturas/:id
routerLectura.get("/:id", validarObtenerLectura, getLectura);

export default routerLectura;