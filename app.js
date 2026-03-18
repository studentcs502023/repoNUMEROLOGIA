import 'dotenv/config';
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
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/api/usuarios", routerUsuario);
app.use("/api/pagos", routerPago);
app.use("/api/lecturas", validarJWT, routerLectura);

app.use("/api/admin", validarJWT, validarAdmin, routerAdmin);

// === SERVIR EL FRONTEND (Vue SPA) ===
// Servir archivos estáticos de la carpeta `public` (donde se copiaron los archivos de `dist`)
app.use(express.static(path.join(__dirname, "public")));

// Manejar History Mode: Cualquier petición que no sea a /api se la enviamos a Vue
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
});
