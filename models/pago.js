import mongoose from "mongoose";




const pago = new mongoose.Schema({

    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true,
    },
    monto: {
        type: Number,
        required: true,
        min: 0,
        set: (value) => parseFloat(value).toFixed(2),
    },

    fecha_pago: {
        type: Date,
        default: Date.now,
        required: true,
    },
    fecha_vencimiento: {
        type: Date,
        required: true,

    },

    metodo: {
        type: String,
        enum: ["tarjeta", "efectivo", "transferencia", "mercadopago", "mercadopago_manual"],
        required: true,
    },

    estado: {
        type: String,
        enum: ["activo", "vencido"],
        required: true,
    },
    
    // Campos para Mercado Pago
    payment_id: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    preference_id: {
        type: String,
        required: false,
    }

});

export const Pago = mongoose.model("pago", pago);