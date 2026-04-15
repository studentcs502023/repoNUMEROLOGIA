import "dotenv/config";
import express from "express";
import cors from "cors";
import dns from "node:dns";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dns.setDefaultResultOrder("ipv4first");

import routerUsuario from "./routes/usuario.js";
import routerPago from "./routes/pago.js";
import routerAdmin from "./routes/admin.js";
import routerLectura from "./routes/lecturas.js";
import routerMP from "./routes/mercadopago.js";
import routerLoteria from "./routes/loteria.js";

import { conectarMongo } from "./database/cnx-mongo.js";
import { iniciarTareaVerificacionMembresias } from "./cron/validarMembresia.js";
import { iniciarRecordatoriosDiarios } from "./cron/recordatorios.js";
import { validarJWT } from "./helpers/validar-JWT.js";
import { validarAdmin } from "./middlewares/admin.js";

const app = express();

await conectarMongo();
iniciarTareaVerificacionMembresias();
iniciarRecordatoriosDiarios();

app.use(cors());
app.use(express.json());

// RUTAS API DEFINIDAS
app.use("/api/usuarios", routerUsuario);
app.use("/api/pagos", routerPago);
app.use("/api/lecturas", routerLectura);
app.use("/api/mercadopago", routerMP);
app.use("/api/loteria", routerLoteria);

app.get("/api/ping", (req, res) => res.json({ status: "ok" }));
app.use("/api/admin", validarJWT, validarAdmin, routerAdmin);

// SERVIDOR ESTÁTICO
app.use(express.static(path.join(__dirname, "public")));

// MANEJO DE RUTAS SIN COMODINES
app.use((req, res, next) => {
  if (req.url.startsWith("/api/")) {
    return res.status(404).json({ success: false, msg: "API Route Not Found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en puerto ${PORT}`);
});
