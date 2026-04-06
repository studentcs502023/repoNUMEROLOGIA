import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from "../middlewares/validar-campos.js";
import {
    getDashboard,
    getAllUsuarios,
    getAllPagos,
    getAllLecturas,
    cambiarRolUsuario,
    deleteUsuarioAdmin
} from "../controllers/admin.js";

const routerAdmin = Router();

// NOTA: Estas rutas se protegen en app.js con validarJWT y validarAdmin
// No se valida aquí para evitar código duplicado

/**
 * GET http://localhost:3000/api/admin/dashboard
 * Dashboard con estadísticas generales del sistema
 */
routerAdmin.get("/dashboard", getDashboard);

/**
 * GET http://localhost:3000/api/admin/usuarios
 * Ver todos los usuarios del sistema
 */
routerAdmin.get("/usuarios", getAllUsuarios);

/**
 * GET http://localhost:3000/api/admin/pagos
 * Ver todos los pagos realizados en el sistema
 */
routerAdmin.get("/pagos", getAllPagos);

/**
 * GET http://localhost:3000/api/admin/lecturas
 * Ver todas las lecturas generadas en el sistema
 */
routerAdmin.get("/lecturas", getAllLecturas);

/**
 * PUT http://localhost:3000/api/admin/usuario/:usuario_id/rol
 * Cambiar rol de un usuario (usuario ↔ administrador)
 * 
 * Body:
 * {
 *   "rol": "administrador" | "usuario"
 * }
 */
routerAdmin.put(
    "/usuario/:usuario_id/rol",
    [
        check("usuario_id", "ID de usuario inválido").isMongoId(),
        check("rol", "Rol requerido").notEmpty(),
        check("rol", "Rol debe ser 'usuario' o 'administrador'")
            .isIn(['usuario', 'administrador']),
        validarCampos
    ],
    cambiarRolUsuario
);

/**
 * DELETE http://localhost:3000/api/admin/usuario/:usuario_id
 * Eliminar un usuario del sistema
 */
routerAdmin.delete(
    "/usuario/:usuario_id",
    [
        check("usuario_id", "ID de usuario inválido").isMongoId(),
        validarCampos
    ],
    deleteUsuarioAdmin
);

export default routerAdmin;