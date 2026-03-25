import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const pagoSchema = new mongoose.Schema({ 
  usuario_id: mongoose.Schema.Types.ObjectId,
  estado: String,
  fecha_vencimiento: Date,
  payment_id: String,
  preference_id: String,
  monto: Number,
  metodo: String
}, { collection: 'pagos' });
const Pago = mongoose.model("pago", pagoSchema);

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);
    const lastPayments = await Pago.find().sort({ _id: -1 }).limit(10);
    console.log("LAST 10 PAYMENTS IN DB:");
    lastPayments.forEach(p => {
      console.log(JSON.stringify({
        _id: p._id,
        usuario_id: p.usuario_id,
        payment_id: p.payment_id,
        estado: p.estado,
        monto: p.monto
      }, null, 2));
    });

  } catch (error) {
    console.error("DIAGNOSTIC ERROR:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verify();
