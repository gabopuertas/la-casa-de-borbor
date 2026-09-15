/* ============================================================
   CORRER TODAS LAS PRUEBAS
   ============================================================
   Correr:  node pruebas/correr-todo.js

   O hace doble clic en probar.command (en la carpeta del juego).

   Si todas dan verde, podes cambiar cosas tranquilo: si algo se
   rompe, las pruebas te lo van a decir en 5 segundos en vez de
   que lo descubra Benicio jugando la semana que viene.
   ============================================================ */

const { spawnSync } = require("child_process");
const path = require("path");

const PRUEBAS = [
  ["validar-mapas.js",            "Los mapas estan bien armados y se pueden terminar"],
  ["probar-juego.js",             "El juego entero: caminar, pelear, ganar, perder, Chispa"],
  ["probar-dibujos.js",           "Los dibujos reemplazan a las reservas, y la animacion"],
  ["probar-tactil.js",            "Los controles del celular"],
  ["probar-en-navegador-real.js", "Chrome de verdad: una compu y un iPhone"],
];

console.log("\n" + "=".repeat(62));
console.log("  PRUEBAS DE LA CASA DE BORBOR");
console.log("=".repeat(62));

let fallaron = [];

for (const [archivo, descripcion] of PRUEBAS) {
  console.log("\n\n### " + archivo + "  —  " + descripcion);
  const r = spawnSync("node", [path.join(__dirname, archivo)], { stdio: "inherit" });
  if (r.status !== 0) fallaron.push(archivo);
}

console.log("\n" + "=".repeat(62));
if (fallaron.length === 0) {
  console.log("  TODO BIEN: las " + PRUEBAS.length + " pruebas pasaron");
} else {
  console.log("  FALLARON: " + fallaron.join(", "));
}
console.log("=".repeat(62) + "\n");

process.exit(fallaron.length === 0 ? 0 : 1);
