/* ============================================================
   EL AMIGO - EL CUERPO
   ============================================================
   Chispa: el robot chiquito que acompaña a BorBor.

   Este archivo es SOLO EL CUERPO: donde esta, como se mueve,
   como se dibuja, como muestra lo que dice.

   No decide nada. Para decidir le pregunta al Cerebro.
   Igual que vos: tus piernas no eligen a donde ir.

   >>> EL CICLO DE LA IA <<<
   En cada pensamiento pasa esto, en este orden:

        PERCIBIR  ->  RECORDAR  ->  DECIDIR  ->  ACTUAR
        (percepcion)  (memoria)    (cerebro)    (aca)

   Ese ciclo es el mismo en un enemigo de Mario, en un auto
   que se maneja solo y en un robot de verdad. Cambia lo que
   hay adentro de cada paso, no el orden.
   ============================================================ */

const Amigo = {

  x: 0, y: 0,
  w: 18, h: 20,

  paso: 0,
  caminando: false,
  mirandoIzquierda: false,

  // lo que decidio el cerebro la ultima vez
  accion: "seguir",
  frase: "",
  fraseHasta: 0,

  ahora: 0,
  proximoPensamiento: 0,

  aparecerCerca(objetivo) {
    this.x = objetivo.x - 26;
    this.y = objetivo.y + 6;
    this.frase = "";
    this.fraseHasta = 0;

    // Si el lugar de al lado es una pared, lo ponemos encima del heroe
    if (Mundo.chocaCaja(this.x, this.y, this.w, this.h)) {
      this.x = objetivo.x;
      this.y = objetivo.y;
    }
  },

  /* ---------------------------------------------------------
     ACTUALIZAR
     --------------------------------------------------------- */
  actualizar(dt, ahora) {
    if (!CONFIG.AMIGO_ACTIVADO) return;

    this.ahora = ahora;

    /* ---- PENSAR (pocas veces por segundo) ----
       El juego se dibuja 60 veces por segundo, pero pensar
       60 veces por segundo seria un desperdicio enorme: el
       mundo no cambia tanto en 16 milesimas de segundo.

       Los juegos de verdad hacen exactamente esto: la IA
       "piensa" mucho menos seguido de lo que se dibuja.
       Es de las optimizaciones mas comunes que existen. */
    if (ahora >= this.proximoPensamiento) {
      this.proximoPensamiento = ahora + 1000 / CONFIG.AMIGO_PENSAMIENTOS_POR_SEGUNDO;
      this.pensar(ahora, false);
    }

    this.mover(dt);
  },

  pensar(ahora, forzar) {
    // 1. PERCIBIR: sacar una foto de como esta el mundo
    const p = Percepcion.mirar();

    // 2. RECORDAR: comparar con la foto anterior
    Memoria.actualizar(p, ahora);

    // 3. DECIDIR: preguntarle al cerebro
    const decision = Cerebro.pensar(p, Memoria, ahora, forzar);
    if (!decision) return;

    // 4. ACTUAR
    this.accion = decision.accion;

    const puedeHablar = forzar || Memoria.puedeHablar(ahora);
    if (puedeHablar && decision.frase) {
      this.decir(decision.frase, ahora);
      Memoria.anotarQueHablo(decision.idea, ahora);
    }
  },

  decir(texto, ahora) {
    this.frase = texto;
    // El globo dura mas si la frase es mas larga: tiempo de leerla.
    this.fraseHasta = ahora + 1400 + texto.length * 45;
  },

  // Cuando apretas E: le preguntas directamente
  preguntarle(ahora) {
    if (!CONFIG.AMIGO_ACTIVADO) return;
    this.pensar(ahora, true);
  },

  /* ---------------------------------------------------------
     MOVERSE
     ---------------------------------------------------------
     Tres comportamientos, segun lo que decidio el cerebro.
     --------------------------------------------------------- */
  mover(dt) {
    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
    const jx = Jugador.x + Jugador.w / 2, jy = Jugador.y + Jugador.h / 2;

    let dx = jx - cx;
    let dy = jy - cy;
    const distancia = Math.hypot(dx, dy);

    /* Si te alejaste muchisimo (cambiaste de mapa, o quedo atrapado
       atras de un arbol), aparece al lado tuyo. Hacer trampa asi
       es normalisimo en los juegos: es mucho mejor que un amigo
       que se pierde para siempre y arruina la partida. */
    if (distancia > CONFIG.TILE * 9) {
      this.aparecerCerca(Jugador);
      return;
    }

    let vx = 0, vy = 0;
    const velocidad = CONFIG.AMIGO_VELOCIDAD * dt;

    if (this.accion === "huir" && Percepcion.mirar().enemigoCerca) {
      // se pone del otro lado tuyo, lejos del enemigo
      const e = Percepcion.mirar().enemigoCerca.ref;
      const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
      let hx = cx - ex, hy = cy - ey;
      const largo = Math.hypot(hx, hy) || 1;
      // mitad "alejarme del enemigo", mitad "no perder a BorBor"
      vx = ((hx / largo) * 0.6 + (dx / (distancia || 1)) * 0.4) * velocidad;
      vy = ((hy / largo) * 0.6 + (dy / (distancia || 1)) * 0.4) * velocidad;

    } else if (distancia > CONFIG.AMIGO_DISTANCIA) {
      // te sigue, pero sin pegarse: frena cuando esta cerca
      vx = (dx / distancia) * velocidad;
      vy = (dy / distancia) * velocidad;
    }

    this.caminando = (vx !== 0 || vy !== 0);
    if (vx < -0.1) this.mirandoIzquierda = true;
    if (vx > 0.1)  this.mirandoIzquierda = false;

    // Colision por ejes separados, igual que el heroe
    if (!Mundo.chocaCaja(this.x + vx, this.y, this.w, this.h)) this.x += vx;
    if (!Mundo.chocaCaja(this.x, this.y + vy, this.w, this.h)) this.y += vy;

    this.paso += this.caminando ? dt * 0.3 : -this.paso * 0.2;
  },

  /* ---------------------------------------------------------
     DIBUJARSE
     --------------------------------------------------------- */
  dibujar() {
    if (!CONFIG.AMIGO_ACTIVADO) return;

    const flote = Math.sin(this.paso) * 2;
    const tam = 26;
    const dibX = this.x + this.w / 2 - tam / 2;
    const dibY = this.y + this.h - tam;

    if (CONFIG.SOMBRA) {
      Dibujante.sombra(this.x + this.w / 2, this.y + this.h - 1, this.w * 0.85, 6, 0.18);
    }

    Dibujante.dibujar(
      "amigo",
      dibX, dibY + flote, tam, tam,
      (c, x, y, w, h) => Reservas.amigo(c, x, y, w, h, this.mirandoIzquierda),
      "amigo.png"
    );

    if (CONFIG.MOSTRAR_CAJAS) Dibujante.caja(this.x, this.y, this.w, this.h, "#4ecdc4");
  },

  // El globo se dibuja aparte, DESPUES de todo lo demas,
  // para que ningun arbol ni enemigo lo tape.
  dibujarGlobo() {
    if (!CONFIG.AMIGO_ACTIVADO) return;
    if (!this.frase || this.ahora > this.fraseHasta) return;

    Dibujante.globo(this.frase, this.x + this.w / 2, this.y - 10);
  },
};
