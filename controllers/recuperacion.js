import {
  solicitarRecuperacion,
  verificarCodigo,
  cambiarContraseña,
} from "../helpers/recuperacion.js";


const postOlvideContraseña = async (req, res) => {
  try {
    const { email } = req.body;

    const resultado = await solicitarRecuperacion(email);

    res.json({
      success: true,
      msg: resultado.msg,
    });
  } catch (error) {
    console.error("Error en olvide contraseña:", error.message);

    // No revelar si el email existe o no (seguridad)
    if (error.message === "Usuario no encontrado") {
      return res.status(200).json({
        success: true,
        msg: "Si el email existe, recibirás un código",
      });
    }

    res.status(500).json({
      error: "Error al solicitar recuperación",
      detalle: error.message,
    });
  }
};

/**
 * POST /api/usuarios/verificar-codigo
 * Verifica que el código sea correcto
 */
const postVerificarCodigo = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    const resultado = await verificarCodigo(email, codigo);

    res.json({
      success: true,
      msg: resultado.msg,
    });
  } catch (error) {
    console.error("Error en verificar código:", error.message);

    if (error.message === "Código incorrecto") {
      return res.status(400).json({
        error: "Código inválido",
        msg: "El código ingresado es incorrecto",
      });
    }

    if (error.message === "Código expirado") {
      return res.status(400).json({
        error: "Código expirado",
        msg: "El código expiró, solicita uno nuevo",
      });
    }

    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({
        error: "Usuario no encontrado",
        msg: "El email no existe",
      });
    }

    res.status(500).json({
      error: "Error al verificar código",
      detalle: error.message,
    });
  }
};

/**
 * POST /api/usuarios/cambiar-contraseña
 * Cambia la contraseña después de verificar el código
 */
const postCambiarContraseña = async (req, res) => {
  try {
    const { email, codigo, nueva_contraseña } = req.body;

    const resultado = await cambiarContraseña(email, codigo, nueva_contraseña);

    res.json({
      success: true,
      msg: resultado.msg,
    });
  } catch (error) {
    console.error("Error en cambiar contraseña:", error.message);

    if (error.message === "Código incorrecto") {
      return res.status(400).json({
        error: "Código inválido",
        msg: "El código ingresado es incorrecto",
      });
    }

    if (error.message === "Código expirado") {
      return res.status(400).json({
        error: "Código expirado",
        msg: "El código expiró, solicita uno nuevo",
      });
    }

    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({
        error: "Usuario no encontrado",
        msg: "El email no existe",
      });
    }

    res.status(500).json({
      error: "Error al cambiar contraseña",
      detalle: error.message,
    });
  }
};

export { postOlvideContraseña, postVerificarCodigo, postCambiarContraseña };
