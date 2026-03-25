import "dotenv/config";
import express from "express";
import cors from "cors";
import dns from "node:dns";
import path from "path";
import { fileURLToPath } from "url";

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IPv4 primero (ya no necesario para emails, ahora usamos Brevo API REST)
dns.setDefaultResultOrder("ipv4first");

import routerUsuario from "./routes/usuario.js";
import routerPago from "./routes/pago.js";
import routerAdmin from "./routes/admin.js";
import routerLectura from "./routes/lecturas.js";
import { conectarMongo } from "./database/cnx-mongo.js";
import { iniciarTareaVerificacionMembresias } from "./cron/validarMembresia.js";
import { iniciarRecordatoriosDiarios } from "./cron/recordatorios.js";
import { validarJWT } from "./helpers/validar-JWT.js";
import { validarAdmin } from "./middlewares/admin.js";
const app = express();
await conectarMongo();
iniciarTareaVerificacionMembresias();
iniciarRecordatoriosDiarios();

// Habilitar CORS para permitir peticiones desde el frontend
app.use(cors());

app.use(express.json());
app.use("/api/usuarios", routerUsuario);
app.use("/api/pagos", routerPago);
app.use("/api/lecturas", routerLectura);
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/admin",validarAdmin, routerAdmin);

// === SERVIR EL FRONTEND (Vue SPA) ===
app.use(express.static(path.join(__dirname, "public")));

// Manejar History Mode: Cualquier petición que no sea a /api se la enviamos a Vue
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
});
