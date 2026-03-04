import { Usuario } from "../models/usuario.js";
import {
  crearLecturaPrincipal,
  crearLecturaDiaria,
  obtenerLecturasPorUsuario,
  obtenerLecturaPorId,
  LecturaYaExisteError,
} from "../helpers/lectura.js";

/**
 * POST: Crear lectura principal
 * Solo disponible para usuarios con membresía activa
 * Solo puede haber una lectura principal por usuario
 */
const postLecturaPrincipal = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    // Obtener usuario y verificar que existe
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Crear lectura principal
    const lectura = await crearLecturaPrincipal(
      usuario_id,
      usuario.fechaNacimiento,
      usuario.nombre
    );

    res.status(201).json({
      msg: "Lectura principal generada exitosamente",
      data: lectura,
    });
  } catch (error) {
    console.error("Error al generar lectura principal:", error.message);

    if (error instanceof LecturaYaExisteError) {
      return res.status(409).json({
        error: "Lectura ya existe",
        mensaje: error.message,
      });
    }

    res.status(500).json({
      error: "Error al generar lectura principal",
      detalle: error.message,
    });
  }
};

/**
 * POST: Crear lectura diaria
 * Solo disponible para usuarios con membresía activa
 * Se puede crear múltiples veces
 */
const postLecturaDiaria = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    // Obtener usuario y verificar que existe
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar que el usuario está activo
    if (usuario.estado !== "activo") {
      return res.status(403).json({
        error: "Usuario inactivo",
        mensaje: "Debes tener una membresía activa para generar lecturas",
      });
    }

    // Crear lectura diaria
    const lectura = await crearLecturaDiaria(
      usuario_id,
      usuario.fechaNacimiento,
    );

    res.status(201).json({
      msg: "Lectura diaria generada exitosamente",
      data: lectura,
    });
  } catch (error) {
    console.error("Error al generar lectura diaria:", error.message);

    res.status(500).json({
      error: "Error al generar lectura diaria",
      detalle: error.message,
    });
  }
};

/**
 * GET: Obtener todas las lecturas de un usuario
 */
const getLecturasPorUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    // Obtener usuario y verificar que existe
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Obtener lecturas
    const lecturas = await obtenerLecturasPorUsuario(usuario_id);

    res.json({
      success: true,
      usuario_id,
      nombre: usuario.nombre,
      total_lecturas: lecturas.length,
      data: lecturas,
    });
  } catch (error) {
    console.error("Error al obtener lecturas:", error.message);
    res.status(500).json({
      error: "Error al obtener lecturas",
      detalle: error.message,
    });
  }
};

/**
 * GET: Obtener una lectura específica por ID
 */
const getLectura = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener lectura
    const lectura = await obtenerLecturaPorId(id);

    if (!lectura) {
      return res.status(404).json({ error: "Lectura no encontrada" });
    }

    res.json({
      success: true,
      data: lectura,
    });
  } catch (error) {
    console.error("Error al obtener lectura:", error.message);
    res.status(500).json({
      error: "Error al obtener lectura",
      detalle: error.message,
    });
  }
};

export {
  postLecturaPrincipal,
  postLecturaDiaria,
  getLecturasPorUsuario,
  getLectura,
};
