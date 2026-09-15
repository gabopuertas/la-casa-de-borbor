/* ============================================================
   PRUEBA EN UN NAVEGADOR DE VERDAD
   ============================================================
   Las otras pruebas usan un navegador de mentira: rapidas, pero
   no prueban el CSS, ni los tamanios reales, ni si el navegador
   de verdad se porta como esperamos.

   Esta abre Chrome sin ventana (headless), emula una compu y un
   iPhone, y le pregunta al juego como quedo.

   Correr:  node pruebas/probar-en-navegador-real.js
            node pruebas/probar-en-navegador-real.js https://...

   Sin direccion usa los archivos locales, asi podes probar
   cambios ANTES de subirlos.

   >>> OJO: HEADLESS CHROME NO BAJA DE 500px DE ANCHO <<<
   Por eso NO alcanza con --window-size=390 para probar un
   celular: la pagina se dibuja a 500 y la captura sale recortada.
   Hay que usar Emulation.setDeviceMetricsOverride, como aca.
   (Nos comimos ese error una vez; quedo anotado para no repetirlo.)
   ============================================================ */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const CANDIDATOS_CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const RAIZ = path.join(__dirname, "..");
const DESTINO = process.argv[2] || "file://" + path.join(RAIZ, "index.html");

let ok = 0, fallos = 0;
const titulo = (t) => console.log("\n--- " + t + " ---");
const chequear = (c, m) => { if (c) { ok++; console.log("  OK   " + m); }
                             else { fallos++; console.log("  FALLA " + m); } };
const dormir = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const chrome = CANDIDATOS_CHROME.find(p => fs.existsSync(p));
  if (!chrome) {
    console.log("  (salteada: no encontre Chrome en esta computadora)");
    process.exit(0);
  }

  console.log("Probando: " + DESTINO);

  const proceso = spawn(chrome, ["--headless=new", "--disable-gpu",
    "--remote-debugging-port=9366", "--user-data-dir=/tmp/perfil-pruebas-borbor",
    "--allow-file-access-from-files", "about:blank"]);

  const cerrar = (codigo) => { proceso.kill(); process.exit(codigo); };

  try {
    await dormir(2500);
    const objetivos = await (await fetch("http://127.0.0.1:9366/json")).json();
    const ws = new WebSocket(objetivos.find(t => t.type === "page").webSocketDebuggerUrl);
    await new Promise(r => { ws.onopen = r; });

    let id = 0; const pendientes = new Map();
    ws.onmessage = (e) => { const m = JSON.parse(e.data);
      if (pendientes.has(m.id)) { pendientes.get(m.id)(m.result); pendientes.delete(m.id); } };
    const cdp = (metodo, params = {}) => new Promise(res => {
      const i = ++id; pendientes.set(i, res);
      ws.send(JSON.stringify({ id: i, method: metodo, params })); });
    const evaluar = async (expr) =>
      (await cdp("Runtime.evaluate", { returnByValue: true, expression: expr })).result.value;

    await cdp("Page.enable"); await cdp("Runtime.enable");

    /* ---------- COMO UNA COMPU ---------- */
    await cdp("Emulation.setDeviceMetricsOverride",
              { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await cdp("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 0 });
    await cdp("Page.navigate", { url: DESTINO });
    await dormir(3500);

    titulo("COMO UNA COMPU CON MOUSE");
    chequear(await evaluar("typeof Juego !== 'undefined'"), "el juego cargo sin errores");
    chequear(await evaluar("Tactil.activo") === false, "los controles tactiles estan apagados");
    chequear(await evaluar("Juego.estado") === "portada", "arranca en la portada");
    chequear(await evaluar("CONFIG.ANCHO") === 640, "el canvas es apaisado (640 de ancho)");

    const caja = JSON.parse(await evaluar(
      "JSON.stringify(document.getElementById('pantalla').getBoundingClientRect())"));
    const x = Math.round(caja.x + caja.width / 2);
    const y = Math.round(caja.y + caja.height / 2);
    for (const type of ["mousePressed", "mouseReleased"])
      await cdp("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
    await dormir(500);

    chequear(await evaluar("Juego.estado") === "jugando",
             "UN CLIC arranca el juego, sin tocar ninguna tecla");
    chequear(await evaluar("document.body.classList.contains('tactil')") === false,
             "un clic de mouse NO hace aparecer la palanca");

    /* ---------- COMO UN IPHONE ---------- */
    await cdp("Emulation.setDeviceMetricsOverride",
              { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await cdp("Page.navigate", { url: DESTINO });
    await dormir(3500);

    titulo("COMO UN IPHONE");
    chequear(await evaluar("navigator.maxTouchPoints") === 5, "el navegador reporta pantalla tactil");
    chequear(await evaluar("Tactil.activo") === true, "el juego prende los controles");
    chequear(await evaluar("document.body.classList.contains('tactil')") === true,
             "y aparecen en pantalla");
    chequear(await evaluar("getComputedStyle(document.getElementById('tactiles')).display") !== "none",
             "el CSS los muestra de verdad");
    chequear(await evaluar("CONFIG.ANCHO") === 480 && await evaluar("CONFIG.ALTO") === 640,
             "el juego se da vuelta: 480x640");
    chequear(await evaluar("Juego.segunControl('teclas','dedos')") === "dedos",
             'el texto dice "toca", no "apreta"');
    chequear(await evaluar("document.body.scrollWidth <= window.innerWidth + 1"),
             "no se desborda a lo ancho (todo entra en la pantalla)");

    titulo("LOS DIBUJOS QUE YA ESTAN");
    const marcador = await evaluar("Sprites.listos + ' de ' + Sprites.total");
    const hechos = await evaluar("JSON.stringify(Object.keys(Sprites.imagenes).sort())");
    chequear(await evaluar("Sprites.listos") > 0, `marcador: ${marcador}`);
    console.log("       " + JSON.parse(hechos).join(", "));

    ws.close();
  } catch (e) {
    console.error("  FALLA  no pude hablar con Chrome: " + e.message);
    fallos++;
  }

  console.log(fallos === 0
    ? `\n==> TODO OK  (${ok} chequeos)`
    : `\n==> ${fallos} FALLAS de ${ok + fallos} chequeos`);
  cerrar(fallos === 0 ? 0 : 1);
})();
