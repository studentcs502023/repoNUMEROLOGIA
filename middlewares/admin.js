export const validarAdmin = (req, res, next) => {
    try {
        const usuario = req.usuario;

        // Verificar que el usuario tiene rol de administrador
        if (usuario.rol !== 'administrador') {
            return res.status(403).json({
                error: 'Acceso denegado',
                msg: 'Solo administradores pueden acceder a este recurso'
            });
        }

        next();

    } catch (error) {
        console.error('Error al validar rol:', error.message);
        res.status(500).json({
            error: 'Error al validar rol',
            detalle: error.message
        });
    }
};