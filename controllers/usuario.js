import bcryptjs from 'bcryptjs';
import { Usuario } from "../models/usuario.js";
import { generarJWT } from '../helpers/validar-JWT.js';
import { enviarEmailBienvenida } from '../helpers/emails.js';

// GET: Obtener todos los usuarios
const getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
};

// GET: Obtener usuario por ID
const getUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findById(id).select('-password');

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar usuario' });
    }
};

// POST: Crear usuario (CON PASSWORD Y JWT) - ACTUALIZADO
const postUsuario = async (req, res) => {
    try {
        const { nombre, email, password, fechaNacimiento } = req.body;

        // Crear usuario
        const usuario = new Usuario({
            nombre,
            email,
            fechaNacimiento
        });

        // Hashear contraseña
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);

        // Guardar en BD
        await usuario.save();

        // Generar token JWT
        const token = await generarJWT(usuario._id);

        // Enviar email de bienvenida (fire-and-forget)
        enviarEmailBienvenida(nombre, email).catch(() => { });

        res.status(201).json({
            msg: 'Usuario registrado exitosamente',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,  // ← RETORNAR ROL
                estado: usuario.estado
            },
            token
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        res.status(500).json({ error: 'Error al crear usuario', detalle: error.message });
    }
};

// PUT: Actualizar datos
const putUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, fechaNacimiento } = req.body;

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            { nombre, email, fechaNacimiento },
            { new: true }
        ).select('-password');

        if (!usuarioActualizado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ msg: "Usuario actualizado", usuario: usuarioActualizado });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
};

// DELETE: Eliminar
const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Usuario.findByIdAndDelete(id);

        if (!eliminado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ msg: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
};

// POST: Login de usuario - ACTUALIZADO CON ROL
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por email
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({
                error: 'Credenciales inválidas',
                msg: 'Email o contraseña incorrectos'
            });
        }

        // Verificar contraseña
        const passwordValida = bcryptjs.compareSync(password, usuario.password);
        if (!passwordValida) {
            return res.status(400).json({
                error: 'Credenciales inválidas',
                msg: 'Email o contraseña incorrectos'
            });
        }

        // Generar token
        const token = await generarJWT(usuario._id);

        res.json({
            msg: 'Login exitoso',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,  // ← RETORNAR ROL (CLAVE PARA FRONTEND)
                estado: usuario.estado
            },
            token
        });

    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(500).json({
            error: 'Error al iniciar sesión',
            detalle: error.message
        });
    }
};

// GET: Obtener perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
    try {
        const usuario = req.usuario;

        res.json({
            success: true,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                fechaNacimiento: usuario.fechaNacimiento,
                rol: usuario.rol,  // ← INCLUIR ROL
                estado: usuario.estado,
                fechaRegistro: usuario.fechaRegistro
            }
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error.message);
        res.status(500).json({
            error: 'Error al obtener perfil',
            detalle: error.message
        });
    }
};

export { getUsuarios, getUsuario, postUsuario, putUsuario, deleteUsuario, login, obtenerPerfil };