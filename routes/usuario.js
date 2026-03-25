import { Router } from "express";
import {
  getUsuarios,
  getUsuario,
  postUsuario,
  putUsuario,
  deleteUsuario,
  login,
  obtenerPerfil,
} from "../controllers/usuario.js";
import { validarJWT } from "../helpers/validar-JWT.js";
import {
  validarObtenerUsuario,
  validarCrearUsuario,
  validarActualizarUsuario,
  validarEliminarUsuario,
  validarLogin,
} from "../middlewares/usuarios.js";
import {
  validarOlvideContraseña,
  validarVerificarCodigo,
  validarCambiarContraseña,
} from "../middlewares/recuperacion.js";
import {
  postOlvideContraseña,
  postVerificarCodigo,
  postCambiarContraseña,
} from "../controllers/recuperacion.js";

const routerUsuario = Router();

// ═══════════════════════════════════════════════
// RUTAS PÚBLICAS (sin autenticación)
// ═══════════════════════════════════════════════

// POST /api/usuarios - Registro
routerUsuario.post("/", validarCrearUsuario, postUsuario);

// POST /api/usuarios/login - Login
routerUsuario.post("/login", validarLogin, login);

// POST /api/usuarios/olvide-contrasena - Solicitar recuperación (SIN ñ)
routerUsuario.post(
  "/olvide-contrasena",
  validarOlvideContraseña,
  postOlvideContraseña,
);

// POST /api/usuarios/verificar-codigo - Verificar código
routerUsuario.post(
  "/verificar-codigo",
  validarVerificarCodigo,
  postVerificarCodigo,
);

// POST /api/usuarios/cambiar-contrasena - Cambiar contraseña (SIN ñ)
routerUsuario.post(
  "/cambiar-contrasena",
  validarCambiarContraseña,
  postCambiarContraseña,
);

// ═══════════════════════════════════════════════
// RUTAS PROTEGIDAS (requieren token JWT)
// ═══════════════════════════════════════════════

// GET /api/usuarios - Listar todos
routerUsuario.get("/", getUsuarios);

// GET /api/usuarios/perfil - Perfil autenticado
routerUsuario.get("/perfil", obtenerPerfil);

// GET /api/usuarios/:id - Ver usuario por ID
routerUsuario.get("/:id", validarObtenerUsuario, getUsuario);

// PUT /api/usuarios/:id - Editar usuario
routerUsuario.put("/:id",validarActualizarUsuario, putUsuario);

// DELETE /api/usuarios/:id - Eliminar usuario
routerUsuario.delete("/:id", validarEliminarUsuario, deleteUsuario);

export default routerUsuario;
