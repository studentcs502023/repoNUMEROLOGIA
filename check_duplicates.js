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
    const userId = "69bb5ef162de86afee4b1f4b";
    
    const allPayments = await Pago.find({ usuario_id: userId }).sort({ fecha_pago: -1 });
    console.log(`PAYMENTS FOR USER ${userId}:`);
    allPayments.forEach(p => {
      console.log(JSON.stringify({
        _id: p._id,
        payment_id: p.payment_id,
        preference_id: p.preference_id,
        estado: p.estado,
        fecha: p.fecha_vencimiento
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
