import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Pago } from './models/pago.js';
import { Usuario } from './models/usuario.js';

dotenv.config();

const limpiar = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        const usuario_id = '69c775a791700a6245aec2a9';

        // 1. Eliminar todos los pagos de este usuario para que la validación 409 no salte
        const result = await Pago.deleteMany({ usuario_id });
        console.log(`🗑️ Pagos eliminados: ${result.deletedCount}`);

        // 2. Asegurar que el estado del usuario sea inactivo
        await Usuario.findByIdAndUpdate(usuario_id, { estado: 'inactivo' });
        console.log('🔄 Estado del usuario reseteado a "inactivo"');

        console.log('\n✨ ¡Listo! Ya puedes volver a probar el botón de Mercado Pago en el frontend.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

limpiar();
