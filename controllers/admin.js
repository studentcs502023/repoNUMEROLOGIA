import { Usuario } from "../models/usuario.js";
import { Pago } from "../models/pago.js";
import { Lectura } from "../models/lecturas.js";

/**
 * DASHBOARD ADMIN - Obtener estadísticas generales
 * GET /api/admin/dashboard
 */
const getDashboard = async (req, res) => {
    try {
        const totalUsuarios = await Usuario.countDocuments();
        const usuariosActivos = await Usuario.countDocuments({ estado: 'activo' });
        const usuariosInactivos = await Usuario.countDocuments({ estado: 'inactivo' });
        const totalAdmins = await Usuario.countDocuments({ rol: 'administrador' });
        const totalPagos = await Pago.countDocuments();
        const totalLecturas = await Lectura.countDocuments();

        // Ingresos totales
        const pagosAgregados = await Pago.aggregate([
            {
                $group: {
                    _id: null,
                    ingresoTotal: { $sum: "$monto" },
                    cantidadPagos: { $sum: 1 }
                }
            }
        ]);

        const ingresoTotal = pagosAgregados[0]?.ingresoTotal || 0;
        const cantidadPagos = pagosAgregados[0]?.cantidadPagos || 0;

        res.json({
            success: true,
            estadisticas: {
                usuarios: {
                    total: totalUsuarios,
                    activos: usuariosActivos,
                    inactivos: usuariosInactivos,
                    administradores: totalAdmins
                },
                pagos: {
                    total: cantidadPagos,
                    ingresoTotal: ingresoTotal.toFixed(2)
                },
                lecturas: {
                    total: totalLecturas
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener dashboard:', error.message);
        res.status(500).json({
            error: 'Error al obtener estadísticas',
            detalle: error.message
        });
    }
};

/**
 * VER TODOS LOS USUARIOS (Admin)
 * GET /api/admin/usuarios
 */
const getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password');

        res.json({
            success: true,
            total: usuarios.length,
            usuarios
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).json({
            error: 'Error al obtener usuarios',
            detalle: error.message
        });
    }
};

/**
 * VER TODOS LOS PAGOS (Admin)
 * GET /api/admin/pagos
 */
const getAllPagos = async (req, res) => {
    try {
        const pagos = await Pago.find()
            .populate('usuario_id', 'nombre email rol');

        res.json({
            success: true,
            total: pagos.length,
            pagos
        });

    } catch (error) {
        console.error('Error al obtener pagos:', error.message);
        res.status(500).json({
            error: 'Error al obtener pagos',
            detalle: error.message
        });
    }
};

/**
 * VER TODAS LAS LECTURAS (Admin)
 * GET /api/admin/lecturas
 */
const getAllLecturas = async (req, res) => {
    try {
        const lecturas = await Lectura.find()
            .populate('usuario_id', 'nombre email rol');

        res.json({
            success: true,
            total: lecturas.length,
            lecturas
        });

    } catch (error) {
        console.error('Error al obtener lecturas:', error.message);
        res.status(500).json({
            error: 'Error al obtener lecturas',
            detalle: error.message
        });
    }
};


const cambiarRolUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const { rol } = req.body;

        // Validar que el rol sea válido
        if (!['usuario', 'administrador'].includes(rol)) {
            return res.status(400).json({
                error: 'Rol inválido',
                msg: 'El rol debe ser "usuario" o "administrador"'
            });
        }

        // Validar que no intente cambiar su propio rol a usuario
        if (req.usuario._id.toString() === usuario_id && rol === 'usuario') {
            return res.status(400).json({
                error: 'No permitido',
                msg: 'No puedes cambiar tu propio rol a usuario'
            });
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            usuario_id,
            { rol },
            { new: true }
        ).select('-password');

        if (!usuarioActualizado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            success: true,
            msg: `Rol del usuario actualizado a ${rol}`,
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.error('Error al cambiar rol:', error.message);
        res.status(500).json({
            error: 'Error al cambiar rol',
            detalle: error.message
        });
    }
};

/**
 * ELIMINAR USUARIO (Admin)
 * DELETE /api/admin/usuario/:usuario_id
 */
const deleteUsuarioAdmin = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        // No permitir que se elimine a sí mismo
        if (req.usuario._id.toString() === usuario_id) {
            return res.status(400).json({
                error: 'No permitido',
                msg: 'No puedes eliminarte a ti mismo'
            });
        }

        const usuarioEliminado = await Usuario.findByIdAndDelete(usuario_id);

        if (!usuarioEliminado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            success: true,
            msg: 'Usuario eliminado correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error.message);
        res.status(500).json({
            error: 'Error al eliminar usuario',
            detalle: error.message
        });
    }
};

export {
    getDashboard,
    getAllUsuarios,
    getAllPagos,
    getAllLecturas,
    cambiarRolUsuario,
    deleteUsuarioAdmin
};