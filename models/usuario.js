import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  fechaNacimiento: {
    type: Date,
    required: true,
  },
  estado: {
    type: String,
    enum: ["activo", "inactivo"],
    default: "inactivo",
  },
  rol: {
    type: String,
    enum: ["usuario", "administrador"],
    default: "usuario",
  },
  // CAMPOS PARA RECUPERACIÓN DE CONTRASEÑA
  codigoRecuperacion: {
    type: String,
    default: null,
  },
  fechaExpiracionCodigo: {
    type: Date,
    default: null,
  },
  // FIN CAMPOS RECUPERACIÓN
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
});

export const Usuario = mongoose.model("Usuario", usuarioSchema);
