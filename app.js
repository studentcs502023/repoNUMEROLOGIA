import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "node:dns";

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
dotenv.config();

const app = express();
await conectarMongo();

iniciarTareaVerificacionMembresias();
iniciarRecordatoriosDiarios();
app.use(cors());
app.use(express.json());

app.use("/api/usuarios", routerUsuario);
app.use("/api/pagos", validarJWT, routerPago);
app.use("/api/lecturas", validarJWT, routerLectura);

app.use("/api/admin", validarJWT, validarAdmin, routerAdmin);
app.listen(process.env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
});
