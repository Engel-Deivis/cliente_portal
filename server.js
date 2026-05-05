/* ============================================================
   SERVER.JS — Servidor Express para desarrollo LOCAL
   Solo se usa en local (node server.js).
   En Vercel el despliegue es 100% estático.
   ============================================================ */

const express = require("express");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;

/* Sirve los archivos estáticos desde la carpeta /public */
app.use(express.static(path.join(__dirname, "public")));

/* Cualquier ruta desconocida redirige al index (SPA-like) */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* Inicia el servidor */
app.listen(PORT, () => {
  console.log(`\n✅ Portal de Clientes corriendo en: http://localhost:${PORT}\n`);
  console.log("   Cuentas de demo:");
  console.log("   ● admin@portal.com  / Admin2024  (Admin)");
  console.log("   ● maria@demo.com    / Maria2024  (Cliente)");
  console.log("   ● juan@demo.com     / Juan2024   (Cliente)\n");
});
