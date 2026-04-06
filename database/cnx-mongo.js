import mongoose from 'mongoose';

import 'dotenv/config'

 
 export const conectarMongo = async () => {
    try {
        console.log(process.env.MONGO_URI);
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB Exitosamente');
    } catch (error) {
        console.error('❌ Error de conexión a MongoDB:', error);
    }
};



