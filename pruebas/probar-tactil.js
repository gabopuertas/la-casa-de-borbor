/* ============================================================
   PRUEBA: LOS CONTROLES TACTILES
   ============================================================
   Simula un celular: palanca, botones, tocar la pantalla,
   girar el telefono y el cambio de forma del juego.

   Correr:  node pruebas/probar-tactil.js
   ============================================================ */

const { crearNavegador, crearChequeador } = require("./navegador-falso");

// iPhone parado, con 5 dedos de deteccion
const n = crearNavegador({ tactil: 5, ancho: 390, alto: 844 });
const { titulo, chequear, nota, terminar } = crearChequeador();

n.arrancar();

setImmediate(() => {
  const { Tactil, Teclado, Juego, Jugador, CONFIG } =
    n.tomar("Tactil", "Teclado", "Juego", "Jugador", "CONFIG");

  const joystick = n.elementos["joystick"];
  const palanca  = n.elementos["palanca"];
  const pantalla = n.elementos["pantalla"];

  // el circulo de la palanca esta en (40,440) y mide 120: su centro es (100,500)
  const tocar = (evento, x, y) =>
    joystick.disparar(evento, { clientX: x, clientY: y, pointerType: "touch" });

  titulo("DETECCION");
  chequear(Tactil.activo === true, "detecta que hay pantalla tactil");
  chequear(n.contexto.document.body.classList.contains("tactil"), "prende los controles");

  titulo("LA PALANCA FINGE SER TECLAS");
  tocar("pointerdown", 100, 500);
  chequear(!Teclado.derecha() && !Teclado.izquierda() && !Teclado.arriba() && !Teclado.abajo(),
           "en el centro no camina (zona muerta)");

  tocar("pointermove", 155, 500);
  chequear(Teclado.derecha() && !Teclado.izquierda(), "a la derecha -> flecha derecha");
  chequear(!Teclado.arriba() && !Teclado.abajo(), "y no toca las verticales");

  tocar("pointermove", 100, 445);
  chequear(Teclado.arriba() && !Teclado.derecha(), "arriba -> flecha arriba (y suelta la anterior)");

  tocar("pointermove", 150, 550);
  chequear(Teclado.derecha() && Teclado.abajo(), "en diagonal aprieta las DOS flechas");

  tocar("pointermove", 400, 500);          // el dedo se va lejisimos
  const corrida = Number((palanca.style.transform.match(/translate\(([-\d.]+)px/) || [])[1]);
  chequear(Math.abs(corrida - 60) < 0.01,
           `la bolita no se escapa del circulo (${corrida}px, el radio es 60)`);
  chequear(Teclado.derecha(), "y sigue caminando a la derecha");

  tocar("pointerup", 400, 500);
  chequear(!Teclado.derecha() && !Teclado.abajo(), "al levantar el dedo suelta TODAS las flechas");
  chequear(palanca.style.transform === "translate(0px, 0px)", "la bolita vuelve al centro");

  titulo("LOS BOTONES");
  Teclado.limpiarCuadro();
  n.elementos["btnHablar"].disparar("pointerdown");
  chequear(Teclado.recienApretada("e"), "el boton E finge la tecla E");
  Teclado.limpiarCuadro();
  chequear(!Teclado.recienApretada("e"), "manteniendolo apretado NO se repite");
  n.elementos["btnHablar"].disparar("pointerup");
  chequear(!Teclado.apretada("e"), "al soltarlo, la tecla queda suelta");

  titulo("TOCAR LA PANTALLA = EMPEZAR");
  chequear(Juego.estado === "portada", "estamos en la portada");
  pantalla.disparar("pointerdown", { pointerType: "touch" });
  n.correr(1);
  chequear(Juego.estado === "jugando", "tocar la pantalla arranca la partida");

  const antes = Jugador.x;
  tocar("pointerdown", 100, 500);
  tocar("pointermove", 155, 500);
  n.correr(40);
  chequear(Jugador.x > antes, `y con la palanca el heroe camina (${antes.toFixed(0)} -> ${Jugador.x.toFixed(0)})`);
  tocar("pointerup", 155, 500);

  titulo("LA PANTALLA SE DA VUELTA");
  chequear(CONFIG.ANCHO === 480 && CONFIG.ALTO === 640,
           `en celular parado el juego es vertical (${CONFIG.ANCHO}x${CONFIG.ALTO})`);
  chequear(pantalla.width === 480 && pantalla.height === 640, "el canvas tomo ese tamanio");
  chequear(pantalla.style.aspectRatio === "480 / 640", "y el CSS lo acompaña");

  n.contexto.window.innerWidth = 844;
  n.contexto.window.innerHeight = 390;
  n.oyentes["resize"]();
  chequear(CONFIG.ANCHO === 640 && CONFIG.ALTO === 480,
           `al acostarlo vuelve a apaisado (${CONFIG.ANCHO}x${CONFIG.ALTO})`);
  n.contexto.window.innerWidth = 390;
  n.contexto.window.innerHeight = 844;
  n.oyentes["resize"]();

  titulo("EL TEXTO SE ADAPTA");
  chequear(Juego.segunControl("teclado", "dedos") === "dedos",
           'en celular dice "toca", no "apreta"');

  titulo("GIRAR EL TELEFONO");
  tocar("pointerdown", 100, 500);
  tocar("pointermove", 155, 500);
  chequear(Teclado.derecha(), "caminando antes de girar");
  n.oyentes["orientationchange"]();
  chequear(!Teclado.derecha(), "al girar el telefono no queda caminando solo");

  terminar();
});
