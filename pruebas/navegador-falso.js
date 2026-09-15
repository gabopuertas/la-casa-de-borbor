/* ============================================================
   UN NAVEGADOR DE MENTIRA
   ============================================================
   Para probar el juego sin abrir Chrome.

   El juego habla con el navegador todo el tiempo: le pide el
   canvas, le pregunta por el teclado, le pide imagenes, le pide
   un cuadro nuevo 60 veces por segundo...

   Aca fabricamos un navegador falso que contesta todas esas
   preguntas. Como el juego no sabe distinguir, corre igual,
   pero adentro de Node y sin dibujar nada.

   Eso permite jugar 2000 cuadros en medio segundo y revisar que
   nunca pase nada raro. A mano tardarias media hora y te
   olvidarias de mirar la mitad de las cosas.

   Los cuatro archivos de pruebas usan ESTE navegador. Antes cada
   uno tenia su copia, y cuando el juego empezo a pedirle algo
   nuevo al navegador (documentElement, AudioContext) habia que
   acordarse de arreglar las cuatro copias. Una sola fuente
   de verdad: el mismo problema que tenia el taller de sprites.
   ============================================================ */

const fs = require("fs");
const vm = require("vm");
const path = require("path");

// Los archivos del juego, EN EL MISMO ORDEN que en index.html.
// Si cambias el orden en index.html, cambialo aca tambien.
const ARCHIVOS = [
  "config", "sonidos", "teclado", "sprites", "reservas", "dibujante",
  "mapas", "mundo", "jugador", "enemigos", "objetos", "hud",
  "amigo/percepcion", "amigo/memoria", "amigo/decision", "amigo/cerebro", "amigo/amigo",
  "tactil", "main",
];

// La raiz del proyecto: la carpeta de arriba de esta
const RAIZ = path.join(__dirname, "..");

/* Un lapiz de canvas que no dibuja nada pero acepta todo.
   El Proxy contesta cualquier metodo con una funcion vacia,
   asi no hay que escribir los 40 metodos del canvas a mano. */
function crearLapiz(alDibujarImagen) {
  return new Proxy({}, {
    get(guardados, clave) {
      if (clave === "measureText") return () => ({ width: 20 });
      if (clave === "drawImage" && alDibujarImagen) return alDibujarImagen;
      if (clave in guardados) return guardados[clave];
      return () => {};
    },
    set(guardados, clave, valor) { guardados[clave] = valor; return true; },
  });
}

/* Un elemento HTML de mentira que se acuerda de sus escuchadores,
   asi las pruebas pueden disparar clics y toques. */
function crearElemento(id, lapiz) {
  return {
    id,
    manejadores: {},
    style: {},
    width: 0,
    height: 0,
    classList: {
      clases: new Set(),
      add(c) { this.clases.add(c); },
      remove(c) { this.clases.delete(c); },
      contains(c) { return this.clases.has(c); },
      toggle() {},
    },
    addEventListener(evento, fn) { (this.manejadores[evento] ||= []).push(fn); },
    setPointerCapture() {},
    getBoundingClientRect: () => ({ left: 40, top: 440, width: 120, height: 120 }),
    getContext: () => lapiz,

    // dispara un evento como si el usuario hubiera hecho algo
    disparar(evento, datos = {}) {
      (this.manejadores[evento] || []).forEach((fn) =>
        fn(Object.assign(
          { preventDefault() {}, pointerId: 1, pointerType: "mouse", key: "x" },
          datos)));
    },
  };
}

/* ------------------------------------------------------------
   crearNavegador(opciones)
   ------------------------------------------------------------
     tactil      -> cuantos dedos detecta la pantalla (0 = compu)
     ancho/alto  -> tamanio de la ventana
     dibujos     -> lista de rutas de PNG que "existen"
                    (todo lo demas da error al cargar, como en la
                     vida real cuando el dibujo todavia no se hizo)
------------------------------------------------------------ */
function crearNavegador(opciones = {}) {
  const { tactil = 0, ancho = 1280, alto = 800, dibujos = [] } = opciones;

  const existentes = new Set(dibujos);
  const imagenesDibujadas = [];
  const elementos = {};
  const oyentes = {};
  let rafCola = [];
  let reloj = 0;

  const lapiz = crearLapiz((img) => imagenesDibujadas.push(img && img._src));
  const elemento = (id) => (elementos[id] ||= crearElemento(id, lapiz));

  const parlantes = class {
    constructor() { this.state = "running"; this.currentTime = 0; this.destination = {}; }
    resume() {}
    createOscillator() { return { type: "", frequency: { value: 0 }, connect() {}, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
  };

  const contexto = {
    console: { log() {}, error: console.error, warn() {} },
    performance: { now: () => reloj },
    requestAnimationFrame: (fn) => rafCola.push(fn),
    setTimeout: () => 0,
    setInterval: () => 0,
    Math, Object, Array, String, Number, Boolean, JSON, Date,
    Proxy, Error, Set, Map, Uint8Array, URLSearchParams,

    document: {
      getElementById: (id) => elemento(id),
      addEventListener: () => {},
      documentElement: { requestFullscreen: null },
      body: { classList: elemento("body").classList },
    },

    window: {
      innerWidth: ancho,
      innerHeight: alto,
      addEventListener: (evento, fn) => { oyentes[evento] = fn; },
      matchMedia: () => ({ matches: tactil > 0 }),
      AudioContext: parlantes,
    },

    navigator: { maxTouchPoints: tactil },
    location: { search: "" },
  };
  contexto.globalThis = contexto;

  // Imagenes: las que estan en la lista cargan, el resto fallan
  contexto.Image = class {
    set src(ruta) {
      this._src = ruta;
      setImmediate(() => {
        if (existentes.has(ruta)) { if (this.onload) this.onload(); }
        else { if (this.onerror) this.onerror(); }
      });
    }
    get src() { return this._src; }
  };

  vm.createContext(contexto);
  for (const archivo of ARCHIVOS) {
    const codigo = fs.readFileSync(path.join(RAIZ, "js", archivo + ".js"), "utf8");
    vm.runInContext(codigo, contexto, { filename: archivo + ".js" });
  }

  return {
    contexto,
    elementos,
    oyentes,
    imagenesDibujadas,

    // arranca el juego (como cuando el navegador termina de leer la pagina)
    arrancar() { oyentes["DOMContentLoaded"](); },

    // hace pasar N cuadros de juego
    correr(cuadros) {
      for (let i = 0; i < cuadros; i++) {
        reloj += 16.67;
        const cola = rafCola;
        rafCola = [];
        for (const fn of cola) fn(reloj);
      }
    },

    ahora: () => reloj,

    /* Los "const" de un script no quedan como propiedades del contexto,
       asi que para agarrarlos hay que evaluar una expresion adentro. */
    tomar(...nombres) {
      return vm.runInContext(`({${nombres.join(", ")}})`, contexto);
    },
  };
}

/* ------------------------------------------------------------
   Contador de chequeos, compartido por todas las pruebas
------------------------------------------------------------ */
function crearChequeador() {
  let ok = 0, fallos = 0;
  return {
    titulo(t) { console.log("\n--- " + t + " ---"); },
    chequear(condicion, mensaje) {
      if (condicion) { ok++; console.log("  OK   " + mensaje); }
      else { fallos++; console.log("  FALLA " + mensaje); }
      return condicion;
    },
    nota(m) { console.log("       " + m); },
    terminar() {
      console.log(fallos === 0
        ? `\n==> TODO OK  (${ok} chequeos)`
        : `\n==> ${fallos} FALLAS de ${ok + fallos} chequeos`);
      process.exit(fallos === 0 ? 0 : 1);
    },
  };
}

module.exports = { crearNavegador, crearChequeador, RAIZ, ARCHIVOS };
