import cron from "node-cron";
import { Pago } from "../models/pago.js";
import { Usuario } from "../models/usuario.js";

export function iniciarTareaVerificacionMembresias() {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      console.log("🔄 Ejecutando verificación de membresías vencidas...");

      try {
        // Obtener todos los pagos activos
        const pagosActivos = await Pago.find({ estado: "activo" });

        let usuariosActualizados = 0;

        for (const pago of pagosActivos) {
          const ahora = new Date();

          // Si la fecha_vencimiento es menor a hoy, actualizar
          if (pago.fecha_vencimiento < ahora) {
            // Actualizar pago a estado "vencido"
            await Pago.findByIdAndUpdate(pago._id, { estado: "vencido" });

            // Verificar si este usuario tiene algún pago activo
            const pagoActivoRestante = await Pago.findOne({
              usuario_id: pago.usuario_id,
              fecha_vencimiento: { $gt: ahora },
              estado: "activo",
            });

            // Si no tiene más pagos activos, marcar usuario como inactivo
            if (!pagoActivoRestante) {
              await Usuario.findByIdAndUpdate(pago.usuario_id, {
                estado: "inactivo",
              });
              usuariosActualizados++;
            }
          }
        }

        if (usuariosActualizados > 0) {
          console.log(
            `✅ ${usuariosActualizados} usuario(s) actualizado(s) a inactivo`,
          );
        } else {
          console.log("✅ No hay membresías vencidas por actualizar");
        }
      } catch (error) {
        console.error(
          "❌ Error en la verificación de membresías:",
          error.message,
        );
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
