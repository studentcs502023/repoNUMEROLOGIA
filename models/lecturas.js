import mongoose from "mongoose";

const lecturaSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  tipo: {
    type: String,
    enum: ["principal", "diaria"],
    required: true,
  },
  contenido: {
    type: String,
    required: true,
  },
  fecha_lectura: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

export const Lectura = mongoose.model("Lectura", lecturaSchema);