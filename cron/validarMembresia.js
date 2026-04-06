import cron from "node-cron";
import { Pago } from "../models/pago.js";
import { Usuario } from "../models/usuario.js";
import { enviarEmailMembresiaVencida } from "../helpers/emails.js";

export function iniciarTareaVerificacionMembresias() {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      console.log("🔄 Ejecutando verificación de membresías vencidas...");

      try {
        // 1. Primero, buscamos todos los pagos que ya vencieron por fecha y los marcamos como 'vencido'
        // Esto asegura que la base de datos esté al día antes de procesar usuarios
        const ahora = new Date();
        const pagosVencidosResult = await Pago.updateMany(
          {
            estado: "activo",
            fecha_vencimiento: { $lt: ahora },
          },
          { estado: "vencido" }
        );

        if (pagosVencidosResult.modifiedCount > 0) {
          console.log(`📌 ${pagosVencidosResult.modifiedCount} pagos marcados como vencidos por fecha.`);
        }

        // 2. Verificación de usuarios: Buscamos usuarios que están 'activo'
        const usuariosActivos = await Usuario.find({ estado: "activo" });
        let usuariosInactivados = 0;

        for (const usuario of usuariosActivos) {
          // 3. ¿Tiene AL MENOS UN pago que siga 'activo'?
          const tienePagoActivo = await Pago.findOne({
            usuario_id: usuario._id,
            estado: "activo",
          });

          // 4. Si no tiene pagos activos, lo inactivamos
          if (!tienePagoActivo) {
            await Usuario.findByIdAndUpdate(usuario._id, { estado: "inactivo" });
            
            // Notificar por email
            await enviarEmailMembresiaVencida(usuario.nombre, usuario.email);
            
            console.log(`✅ Usuario ${usuario.email} inactivado (sin membresía vigente).`);
            usuariosInactivados++;
          }
        }

        if (usuariosInactivados > 0) {
          console.log(`✅ Total: ${usuariosInactivados} usuarios pasaron a estado inactivo.`);
        } else {
          console.log("✅ Todos los usuarios activos tienen su membresía al día.");
        }

      } catch (error) {
        console.error("❌ Error en la verificación de membresías:", error.message);
      }
    },
    {
      timezone: "America/Bogota",
    },
  );

  console.log(
    "⏰ Tarea de verificación de membresías programada (cada 5 minutos)",
  );
}
