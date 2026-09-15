/* ============================================================
   PRUEBA GRANDE: EL JUEGO ENTERO
   ============================================================
   Juega solo, sin abrir Chrome, y revisa que todo funcione:
   caminar, chocar, juntar cosas, pelear, viajar, ganar, perder,
   la pausa, los controles y la IA de Chispa.

   Correr:  node pruebas/probar-juego.js
   ============================================================ */

const { crearNavegador, crearChequeador } = require("./navegador-falso");

const n = crearNavegador({ tactil: 0 });     // una compu, sin pantalla tactil
const { titulo, chequear, nota, terminar } = crearChequeador();
const correr = n.correr;

n.arrancar();

setImmediate(() => {
  const { Juego, Jugador, Mundo, Objetos, Enemigos, Teclado, Sprites, CONFIG,
          Amigo, Percepcion, Memoria, Decision, Cerebro, Tactil } =
    n.tomar("Juego", "Jugador", "Mundo", "Objetos", "Enemigos", "Teclado", "Sprites",
            "CONFIG", "Amigo", "Percepcion", "Memoria", "Decision", "Cerebro", "Tactil");

  titulo("ARRANQUE");
  chequear(Juego.estado === "portada", "llega a la portada despues de cargar");
  chequear(Sprites.faltantes.length === Sprites.total,
           `detecta los ${Sprites.total} dibujos faltantes`);
  correr(3);

  titulo("EMPEZAR SIN TECLADO (compu con mouse)");
  chequear(Tactil.activo === false, "no se detecto pantalla tactil (es una compu)");
  chequear(Juego.segunControl("conTeclado", "conDedos") === "conTeclado", "el texto habla de teclas");
  n.elementos["pantalla"].disparar("pointerdown", { pointerType: "mouse" });
  correr(1);
  chequear(Juego.estado === "jugando",
           "UN CLIC en la pantalla arranca el juego, sin tocar ninguna tecla");

  titulo("SI APARECE UN DEDO, SE ADAPTA SOLO");
  chequear(!n.contexto.document.body.classList.contains("tactil"), "todavia sin controles tactiles");
  n.oyentes["touchstart"]();
  chequear(Tactil.activo === true, "un toque en la pantalla prende los controles");
  chequear(n.contexto.document.body.classList.contains("tactil"), "y aparecen en pantalla");
  chequear(Juego.segunControl("conTeclado", "conDedos") === "conDedos", "y el texto cambia solo");

  titulo("Y SI VUELVE EL TECLADO, TAMBIEN");
  Tactil.huboUnDedo = false;
  n.oyentes["keydown"]({ key: "ArrowRight" });
  chequear(Tactil.activo === false, "usar una flecha apaga los controles tactiles");
  n.oyentes["keydown"]({ key: "F5" });
  chequear(Tactil.activo === false, "una tecla que no es del juego no cambia nada");

  titulo("EMPEZAR PARTIDA");
  Juego.empezarPartida();
  Teclado.nuevas[" "] = true;
  correr(1);
  chequear(Juego.estado === "jugando", "espacio arranca la partida");
  chequear(Mundo.clave === CONFIG.MAPA_INICIAL, "carga el mapa inicial");
  chequear(Jugador.vidas === CONFIG.VIDAS_INICIALES, "el heroe tiene sus vidas");
  chequear(Enemigos.lista.length === 2 && Objetos.lista.length === 6,
           `nacen enemigos (${Enemigos.lista.length}) y objetos (${Objetos.lista.length})`);

  titulo("CAMINAR");
  const x0 = Jugador.x;
  Teclado.activas["arrowright"] = true;
  correr(40);
  chequear(Jugador.x > x0, `camina a la derecha (${x0.toFixed(0)} -> ${Jugador.x.toFixed(0)})`);
  Teclado.activas["arrowright"] = false;

  titulo("CHOCAR CONTRA PAREDES");
  Teclado.activas["arrowup"] = true;
  correr(300);
  Teclado.activas["arrowup"] = false;
  chequear(!Mundo.chocaCaja(Jugador.x, Jugador.y, Jugador.w, Jugador.h),
           "nunca queda adentro de una pared");
  chequear(Jugador.y >= CONFIG.TILE, `la pared de arriba lo frena (y=${Jugador.y.toFixed(0)})`);

  titulo("2000 CUADROS SIN ROMPERSE");
  const dirs = ["arrowright", "arrowdown", "arrowleft", "arrowup"];
  let atascado = false;
  for (let i = 0; i < 2000; i++) {
    Teclado.activas = { [dirs[Math.floor(i / 60) % 4]]: true };
    correr(1);
    if (Mundo.chocaCaja(Jugador.x, Jugador.y, Jugador.w, Jugador.h)) atascado = true;
  }
  Teclado.activas = {};
  chequear(!atascado, "nunca se mete en una pared en 2000 cuadros");
  nota(`estado tras 2000 cuadros: ${Juego.estado}, vidas ${Jugador.vidas}, monedas ${Jugador.monedas}`);

  titulo("JUNTAR UNA MONEDA");
  Juego.empezarPartida(); correr(1);
  const moneda = Objetos.lista.find(o => o.tipo === "moneda");
  const monedasAntes = Jugador.monedas;
  Jugador.x = moneda.x; Jugador.y = moneda.y;
  correr(1);
  chequear(Jugador.monedas === monedasAntes + 1, "agarrar una moneda suma 1");
  chequear(!moneda.vivo, "la moneda desaparece");

  titulo("LLAVE Y PUERTA");
  const llave = Objetos.lista.find(o => o.tipo === "llave");
  Jugador.x = llave.x; Jugador.y = llave.y; correr(1);
  chequear(Jugador.llaves === 1, "agarrar la llave suma 1");
  chequear(Mundo.letraEn(18, 12) === "P", "la puerta existe en el mapa (fila 12, columna 18)");
  Jugador.ponerEn(18 * 32, 13 * 32);
  Teclado.activas["arrowup"] = true; correr(20); Teclado.activas = {};
  chequear(Mundo.letraEn(18, 12) !== "P", "la llave abre la puerta");
  chequear(Jugador.llaves === 0, "la puerta consume la llave");

  titulo("EL GARROTE");
  Juego.empezarPartida(); correr(1);
  const garrote = Objetos.lista.find(o => o.tipo === "garrote");
  chequear(!!garrote, "hay un garrote en el pueblo");
  Jugador.x = garrote.x; Jugador.y = garrote.y; correr(1);
  chequear(Jugador.golpes === CONFIG.GOLPES_DEL_GARROTE, `agarrarlo da ${Jugador.golpes} golpes`);

  const malo = Enemigos.lista[0];
  const vidasAntes = Jugador.vidas;
  Jugador.x = malo.x; Jugador.y = malo.y; correr(1);
  chequear(!malo.vivo, "con garrote, tocar un enemigo lo rompe");
  chequear(Jugador.golpes === CONFIG.GOLPES_DEL_GARROTE - 1, "se gasta un golpe");
  chequear(Jugador.vidas === vidasAntes, "y NO te saca corazon");

  const malo2 = Enemigos.lista[1];
  Jugador.golpes = 0;
  Jugador.invulnerableHasta = 0;
  Jugador.x = malo2.x; Jugador.y = malo2.y; correr(1);
  chequear(malo2.vivo, "sin garrote, el enemigo sobrevive");
  chequear(Jugador.vidas === vidasAntes - 1, "y te saca un corazon");

  titulo("VIAJAR ENTRE MAPAS");
  Juego.empezarPartida(); correr(1);
  Jugador.ponerEn(24 * 32, 17 * 32);            // el portal del pueblo
  correr(2);
  chequear(Mundo.clave === "bosque", "el portal lleva al bosque");
  chequear(Enemigos.lista.length === 5,
           `el bosque trae sus propios enemigos (${Enemigos.lista.length})`);

  titulo("GANAR");
  Juego.cargarMapa("castillo"); correr(1);
  chequear(Mundo.letraEn(14, 18) === "X", "la meta existe en el castillo");
  Jugador.ponerEn(14 * 32, 18 * 32);
  correr(2);
  chequear(Juego.estado === "ganaste", "llegar a la meta = ganaste");

  titulo("PERDER");
  Juego.empezarPartida(); correr(1);
  Jugador.vidas = 0; correr(2);
  chequear(Juego.estado === "perdiste", "sin corazones = perdiste");
  Teclado.nuevas[" "] = true; correr(1);
  chequear(Juego.estado === "jugando" && Jugador.vidas === CONFIG.VIDAS_INICIALES,
           "espacio reinicia la partida");

  titulo("CHISPA: EL CUERPO");
  Juego.empezarPartida(); correr(2);
  const cerca = Math.hypot(Amigo.x - Jugador.x, Amigo.y - Jugador.y);
  chequear(cerca < 64, `aparece al lado de BorBor (${cerca.toFixed(0)} px)`);

  Jugador.ponerEn(10 * 32, 5 * 32);
  Amigo.x = 3 * 32; Amigo.y = 5 * 32;
  const antesDeSeguir = Math.hypot(Amigo.x - Jugador.x, Amigo.y - Jugador.y);
  Amigo.accion = "seguir";
  correr(60);
  const despues = Math.hypot(Amigo.x - Jugador.x, Amigo.y - Jugador.y);
  chequear(despues < antesDeSeguir, `te sigue (${antesDeSeguir.toFixed(0)} -> ${despues.toFixed(0)} px)`);
  chequear(!Mundo.chocaCaja(Amigo.x, Amigo.y, Amigo.w, Amigo.h), "no atraviesa paredes");

  titulo("CHISPA: PERCEPCION");
  const p = Percepcion.mirar();
  chequear(p.vida === Jugador.vidas && p.mapa === "pueblo", "ve la vida y el mapa");
  chequear(typeof p.quedanEnemigos === "number" && p.quedanEnemigos > 0,
           `cuenta los enemigos vivos (${p.quedanEnemigos})`);
  Jugador.ponerEn(18 * 32, 13 * 32);
  chequear(Percepcion.mirar().puertaCerca !== null, "detecta la puerta cuando estas al lado");

  titulo("CHISPA: MEMORIA");
  Memoria.reiniciar();
  Memoria.vidaAntes = 3;
  Memoria.actualizar({ vida: 2, monedas: 0, llaves: 0, mapa: "pueblo" }, 1000);
  chequear(Memoria.eventos.teLastimaron === true, 'deduce "te lastimaron" comparando dos fotos');
  chequear(Memoria.vecesLastimado === 1, "lleva la cuenta");
  Memoria.actualizar({ vida: 2, monedas: 4, llaves: 0, mapa: "pueblo" }, 2000);
  chequear(!Memoria.eventos.teLastimaron, "el evento dura un solo pensamiento");
  chequear(Memoria.eventos.monedasGanadas === 4, "detecta monedas ganadas");

  const frases = [];
  for (let i = 0; i < 4; i++) frases.push(Memoria.elegirFrase("x", ["a", "b", "c", "d"]));
  chequear(new Set(frases).size === 4, "no repite frases hasta usarlas todas");

  titulo("CHISPA: DECISION (IA por utilidad)");
  Memoria.reiniciar();
  const sinNada = {
    vida: 3, vidaMaxima: 5, monedas: 0, llaves: 0, golpes: 0, mapa: "pueblo",
    enemigoCerca: null, persiguiendote: 0, quedanEnemigos: 3,
    objetoCerca: null, quedanObjetos: 3,
    puertaCerca: null, portalCerca: null, metaCerca: null,
  };
  chequear(Decision.elegir(sinNada, Memoria, 9e9).idea === "charla",
           "sin novedades gana la charla (puntaje 5)");

  const enPeligro = Object.assign({}, sinNada, {
    enemigoCerca: { tipo: "sombra", distancia: 2, persiguiendo: true, ref: { x: 0, y: 0, w: 1, h: 1 } },
  });
  chequear(Decision.elegir(enPeligro, Memoria, 9e9).idea === "peligro",
           "un enemigo encima gana a todo lo demas (puntaje 100)");

  const puertaCerrada = Object.assign({}, sinNada, { puertaCerca: 2, llaves: 0 });
  chequear(Decision.elegir(puertaCerrada, Memoria, 9e9).idea === "puerta-sin-llave",
           "puerta sin llave le gana a una moneda");

  const conCorazon = Object.assign({}, sinNada, { objetoCerca: { tipo: "corazon", distancia: 2 } });
  const conMoneda  = Object.assign({}, sinNada, { objetoCerca: { tipo: "moneda",  distancia: 2 } });
  const idea = Decision.ideas.find(i => i.nombre === "objeto-cerca");
  chequear(idea.puntaje(conCorazon, Memoria) > idea.puntaje(conMoneda, Memoria),
           `un corazon vale mas que una moneda (${idea.puntaje(conCorazon, Memoria)} vs ${idea.puntaje(conMoneda, Memoria)})`);

  chequear(Cerebro.motor === "local" && typeof Cerebro.pensar === "function",
           "el cerebro local esta enchufado");

  titulo("CHISPA: PREGUNTARLE CON E");
  Juego.empezarPartida(); correr(2);
  Amigo.frase = ""; Amigo.fraseHasta = 0;
  Memoria.momentoUltimaFrase = 9e9;             // simulamos que acaba de hablar
  Amigo.preguntarle(1000);
  chequear(Amigo.frase !== "", `contesta aunque este en pausa de charla: "${Amigo.frase}"`);

  titulo("CHISPA: SE PUEDE APAGAR");
  CONFIG.AMIGO_ACTIVADO = false;
  const xQuieto = Amigo.x;
  Jugador.ponerEn(2 * 32, 2 * 32);
  correr(30);
  chequear(Amigo.x === xQuieto, "con AMIGO_ACTIVADO en false no hace nada");
  CONFIG.AMIGO_ACTIVADO = true;

  titulo("PAUSA");
  Juego.empezarPartida(); correr(2);
  Teclado.nuevas["p"] = true; correr(1);
  chequear(Juego.estado === "pausa", "P pausa");
  const xPausa = Jugador.x;
  Teclado.activas["arrowright"] = true; correr(30); Teclado.activas = {};
  chequear(Jugador.x === xPausa, "en pausa el heroe no se mueve");
  Teclado.nuevas["p"] = true; correr(1);
  chequear(Juego.estado === "jugando", "P despausa");

  terminar();
});
