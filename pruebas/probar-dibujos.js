/* ============================================================
   PRUEBA: EL SISTEMA DE DIBUJOS
   ============================================================
   Lo mas importante del proyecto: que el juego funcione IGUAL
   con dibujos y sin dibujos, y que cada PNG nuevo reemplace
   solo al de reserva.

   Correr:  node pruebas/probar-dibujos.js
   ============================================================ */

const fs = require("fs");
const path = require("path");
const { crearNavegador, crearChequeador, RAIZ } = require("./navegador-falso");

const { titulo, chequear, nota, terminar } = crearChequeador();

/* ---------- 1. SIN NINGUN DIBUJO ---------- */
const vacio = crearNavegador({ tactil: 0 });
vacio.arrancar();

setImmediate(() => {
  const { Sprites, Juego } = vacio.tomar("Sprites", "Juego");

  titulo("LAS RUTAS DE LOS DIBUJOS");
  const rutas = Object.values(Sprites.lista);
  const carpetas = [...new Set(rutas.map(r => path.dirname(r)))];
  for (const c of carpetas) {
    chequear(fs.existsSync(path.join(RAIZ, c)), `existe la carpeta ${c}/`);
  }
  chequear(rutas.every(r => r.endsWith(".png")), `los ${rutas.length} dibujos son .png`);
  chequear(rutas.every(r => r === r.toLowerCase()), "todos los nombres estan en minuscula");
  chequear(new Set(rutas).size === rutas.length, "no hay rutas repetidas");

  titulo("EL JUEGO ANDA SIN NINGUN DIBUJO");
  chequear(Sprites.listos === 0, "no encontro ninguno");
  chequear(Sprites.faltantes.length === Sprites.total, `los ${Sprites.total} estan en la lista de faltantes`);
  chequear(Juego.estado === "portada", "y el juego arranca igual");
  vacio.correr(60);
  chequear(Juego.estado === "portada", "60 cuadros dibujando puras reservas, sin romperse");

  /* ---------- 2. CON UN SOLO DIBUJO ---------- */
  const conHeroe = crearNavegador({ tactil: 0, dibujos: ["imagenes/personajes/heroe.png"] });
  conHeroe.arrancar();

  setImmediate(() => {
    const S = conHeroe.tomar("Sprites").Sprites;
    const { Juego: J, Teclado: T } = conHeroe.tomar("Juego", "Teclado");

    titulo("UN DIBUJO REEMPLAZA A SU RESERVA");
    chequear(S.listos === 1, `encuentra 1 de ${S.total}`);
    chequear(S.total === Object.keys(S.lista).length,
             "el marcador cuenta todos los dibujos obligatorios");
    chequear(S.obtener("heroe") !== null, "heroe.png quedo cargado");
    chequear(S.obtener("moneda") === null, "moneda.png sigue faltando");
    chequear(S.primero(["heroe-izq", "heroe"]) === S.obtener("heroe"),
             "si falta heroe-izq.png, usa heroe.png (cadena de reserva)");
    chequear(S.primero(["baboso"]) === null, "si no hay ninguno, devuelve null y se dibuja la reserva");

    T.nuevas[" "] = true;
    conHeroe.correr(3);
    const usos = conHeroe.imagenesDibujadas.filter(r => r === "imagenes/personajes/heroe.png").length;
    chequear(usos > 0, `el juego dibuja el PNG del heroe en pantalla (${usos} veces en 3 cuadros)`);
    chequear(conHeroe.imagenesDibujadas.every(r => r === "imagenes/personajes/heroe.png"),
             "y no intenta dibujar ninguna imagen que no exista");

    /* ---------- 3. CON CUADROS DE ANIMACION ---------- */
    const conCuadros = crearNavegador({ tactil: 0, dibujos: [
      "imagenes/personajes/heroe.png",
      "imagenes/personajes/heroe-1.png",
      "imagenes/personajes/heroe-2.png",
    ]});
    conCuadros.arrancar();

    setImmediate(() => {
      const { Sprites: Sp, Jugador, Teclado: Te, CONFIG } =
        conCuadros.tomar("Sprites", "Jugador", "Teclado", "CONFIG");

      titulo("ANIMACION POR CUADROS");
      chequear(Sp.listos === 1, `el marcador sigue en 1 de ${Sp.total}: los cuadros NO suman`);
      chequear(Sp.cuadros("heroe").length === 2, "encuentra 2 cuadros de animacion");
      chequear(Sp.cuadros("heroe-abajo").length === 0, "no inventa cuadros que no existen");

      Te.nuevas[" "] = true; conCuadros.correr(2);

      Jugador.caminando = false;
      chequear(Jugador.cuadroActual() === null, "quieto: usa el dibujo normal, no los cuadros");

      Jugador.caminando = true;
      const ciclo = [];
      for (let i = 0; i < 8; i++) {
        Jugador.paso = (i * Math.PI) / 2;
        const c = Jugador.cuadroActual();
        ciclo.push(c ? c.src.replace("imagenes/personajes/", "") : "null");
      }
      nota("ciclo: " + ciclo.join(" -> "));
      chequear(new Set(ciclo).size === 2, "caminando: alterna entre los 2 cuadros");
      chequear(ciclo[0] === "heroe-1.png" && ciclo[2] === "heroe-2.png",
               "cambia de cuadro a cada paso (cada PI)");

      titulo("ANIMACION CON MATEMATICA (con un solo dibujo)");
      Jugador.paso = Math.PI / 2;
      const arriba = Jugador.movimientoDeCaminata();
      chequear(arriba.rebote < 0, `en el aire el rebote es negativo = para arriba (${arriba.rebote.toFixed(1)})`);
      const izq = (Jugador.paso = Math.PI / 2, Jugador.movimientoDeCaminata().inclinacion);
      const der = (Jugador.paso = 3 * Math.PI / 2, Jugador.movimientoDeCaminata().inclinacion);
      chequear(izq > 0 && der < 0,
               `se inclina para los DOS lados (${izq.toFixed(0)} y ${der.toFixed(0)} grados)`);

      Jugador.caminando = false;
      const quieto = Jugador.movimientoDeCaminata();
      chequear(quieto.rebote === 0 && quieto.inclinacion === 0, "quieto no se mueve nada");

      chequear(CONFIG.TAMANIO_HEROE > 0, `el tamanio del heroe es una perilla (${CONFIG.TAMANIO_HEROE})`);

      terminar();
    });
  });
});
