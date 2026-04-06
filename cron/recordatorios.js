import cron from "node-cron";
import { Usuario } from "../models/usuario.js";
import { enviarEmailRecordatorio } from "../helpers/emails.js";

export function iniciarRecordatoriosDiarios() {
    // Ejecutar todos los días a las 8:00 AM (hora Colombia)
    cron.schedule(
        "0 8 * * *",
        async () => {
            console.log("📧 Ejecutando envío de recordatorios diarios...");

            try {
                // Buscar usuarios activos (premium)
                const usuariosActivos = await Usuario.find({ estado: "activo" });

                if (usuariosActivos.length === 0) {
                    console.log("ℹ️ No hay usuarios activos para enviar recordatorio");
                    return;
                }

                console.log(
                    `📨 Enviando recordatorio a ${usuariosActivos.length} usuario(s)...`,
                );

                let enviados = 0;
                let fallidos = 0;

                for (const usuario of usuariosActivos) {
                    try {
                        await enviarEmailRecordatorio(usuario.nombre, usuario.email);
                        enviados++;
                    } catch (error) {
                        fallidos++;
                        console.error(
                            `❌ Fallo al enviar a ${usuario.email}:`,
                            error.message,
                        );
                    }
                }

                console.log(
                    `✅ Recordatorios: ${enviados} enviados, ${fallidos} fallidos`,
                );
            } catch (error) {
                console.error(
                    "❌ Error en el cron de recordatorios:",
                    error.message,
                );
            }
        },
        {
            timezone: "America/Bogota",
        },
    );

    console.log("⏰ Recordatorios diarios programados (8:00 AM Colombia)");
}
