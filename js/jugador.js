/* ============================================================
   EL JUGADOR (o sea, vos)
   ============================================================
   Un personaje de videojuego es basicamente una ficha con datos:

     donde esta (x, y)
     que tamanio tiene (w, h)
     para donde mira
     cuanta vida le queda

   ...y una funcion "actualizar" que se ejecuta 60 veces por segundo
   y decide que hacer con todo eso.

   ------------------------------------------------------------
   EL TRUCO DE MOVERSE EN DOS PASOS
   ------------------------------------------------------------
   Para chocar bien contra las paredes hay que mover
   PRIMERO en X y DESPUES en Y, por separado.

   Si movieras las dos al mismo tiempo, al rozar una esquina
   en diagonal el juego te frenaria del todo y quedarias trabado.
   Moviendo por separado, si te frena la X todavia podes deslizarte
   por la Y. Se siente mucho mejor. Probalo: hace que se muevan
   juntas y fijate lo incomodo que es caminar pegado a un arbol.
   ============================================================ */

const Jugador = {

  // ---------- posicion y tamanio de la CAJA (no del dibujo) ----------
  x: 0, y: 0,
  w: 20, h: 24,

  // ---------- estado ----------
  direccion: "abajo",
  caminando: false,
  paso: 0,              // para el rebote al caminar

  vidas: 3,
  monedas: 0,
  llaves: 0,
  golpes: 0,            // cuantos golpes de garrote te quedan

  invulnerableHasta: 0, // hasta que momento no te pueden pegar

  /* Lo pone en su casilla de salida.
     La caja es mas chica que la casilla (20x24 en vez de 32x32)
     y la centramos, para que el heroe pase comodo por los pasillos. */
  ponerEn(px, py) {
    this.x = px + (CONFIG.TILE - this.w) / 2;
    this.y = py + (CONFIG.TILE - this.h) / 2;
  },

  reiniciarTodo() {
    this.vidas = CONFIG.VIDAS_INICIALES;
    this.monedas = 0;
    this.llaves = 0;
    this.golpes = 0;
    this.direccion = "abajo";
    this.invulnerableHasta = 0;
  },

  esInvulnerable(ahora) {
    return ahora < this.invulnerableHasta;
  },

  /* ---------------------------------------------------------
     ACTUALIZAR = "que hago en este cuadro"
     ---------------------------------------------------------
     dt = cuantos cuadros de tiempo pasaron desde el cuadro anterior.
     Normalmente vale 1. Si la compu se traba un poquito vale 2.
     Multiplicar la velocidad por dt hace que el juego ande a la
     misma velocidad en una compu rapida y en una lenta.
     --------------------------------------------------------- */
  actualizar(dt) {

    // 1) LEER EL TECLADO -> decidir hacia donde vamos
    let mx = 0, my = 0;
    if (Teclado.izquierda()) mx -= 1;
    if (Teclado.derecha())   mx += 1;
    if (Teclado.arriba())    my -= 1;
    if (Teclado.abajo())     my += 1;

    this.caminando = (mx !== 0 || my !== 0);

    // 2) ARREGLAR LA DIAGONAL
    //    Si vas en diagonal te moves 1 a la derecha Y 1 abajo.
    //    Por Pitagoras eso son 1,41 de distancia: irias mas rapido
    //    en diagonal que en linea recta! (a + b = c al cuadrado...)
    //    Dividir por raiz de 2 (1,41) lo empareja.
    if (mx !== 0 && my !== 0) {
      const raiz2 = Math.SQRT2;
      mx /= raiz2;
      my /= raiz2;
    }

    // 3) PARA DONDE MIRA (para elegir el dibujo correcto)
    if (my < 0) this.direccion = "arriba";
    else if (my > 0) this.direccion = "abajo";
    if (mx < 0) this.direccion = "izq";
    else if (mx > 0) this.direccion = "der";

    const paso = CONFIG.VELOCIDAD_JUGADOR * dt;

    // 4) MOVERSE EN X, chequear, y si choca volver atras
    this.moverEje(mx * paso, 0);

    // 5) MOVERSE EN Y, chequear, y si choca volver atras
    this.moverEje(0, my * paso);

    /* 6) EL RELOJ DE LA CAMINATA
       "paso" es un numero que sube mientras caminas y se vuelve a 0
       cuando te quedas quieto. Todo el movimiento del heroe (el rebote,
       el balanceo, que cuadro mostrar) sale de este UNICO numero.

       Tener un solo reloj para toda la animacion es lo que hace que
       las partes esten sincronizadas entre si y no cada una por su lado. */
    if (this.caminando) this.paso += dt * CONFIG.VELOCIDAD_ANIMACION;
    else this.paso = 0;
  },

  moverEje(dx, dy) {
    if (dx === 0 && dy === 0) return;

    const nuevoX = this.x + dx;
    const nuevoY = this.y + dy;

    // Antes de chocar: si lo que tengo adelante es una puerta y
    // tengo llave, la abro y sigo de largo.
    if (Mundo.chocaCaja(nuevoX, nuevoY, this.w, this.h)) {

      if (this.llaves > 0 &&
          Mundo.intentarAbrirPuerta(nuevoX, nuevoY, this.w, this.h)) {
        this.llaves--;
        Sonidos.puerta();
        HUD.avisar("Abriste una puerta!");
      } else {
        return;  // choque: no me muevo. Simple y efectivo.
      }
    }

    this.x = nuevoX;
    this.y = nuevoY;
  },

  /* ---------------------------------------------------------
     RECIBIR DANIO
     ---------------------------------------------------------
     Los juegos te dan unos segundos de "no me podes pegar"
     despues de un golpe. Se llaman i-frames (invincibility frames).
     Sin eso, quedar pegado a un enemigo te sacaria 60 vidas
     por segundo y el juego seria imposible.
     --------------------------------------------------------- */
  recibirDanio(ahora, desdeX, desdeY) {
    if (this.esInvulnerable(ahora)) return false;

    this.vidas--;
    this.invulnerableHasta = ahora + CONFIG.INVULNERABLE_MS;
    Sonidos.danio();

    // Empujon: te alejamos del enemigo, si hay lugar
    const dx = (this.x + this.w / 2) - desdeX;
    const dy = (this.y + this.h / 2) - desdeY;
    const largo = Math.hypot(dx, dy) || 1;     // hypot = Pitagoras ya hecho
    const empuje = 14;

    const ex = this.x + (dx / largo) * empuje;
    const ey = this.y + (dy / largo) * empuje;
    if (!Mundo.chocaCaja(ex, this.y, this.w, this.h)) this.x = ex;
    if (!Mundo.chocaCaja(this.x, ey, this.w, this.h)) this.y = ey;

    return true;
  },

  curar() {
    if (this.vidas < CONFIG.VIDAS_MAXIMAS) {
      this.vidas++;
      Sonidos.curar();
      HUD.avisar("+1 corazon");
    } else {
      this.monedas += 5;
      Sonidos.moneda();
      HUD.avisar("Vida llena: +5 monedas");
    }
  },

  /* ---------------------------------------------------------
     ANIMACION FORMA 1: VARIOS DIBUJOS (cuadro por cuadro)
     ---------------------------------------------------------
     Es la animacion "de verdad", la de los dibujos animados:
     varios dibujos casi iguales que se van turnando rapido.

     Si existen heroe-1.png y heroe-2.png, los alterna.
     Si no existen, devuelve null y se usa el dibujo comun.
     --------------------------------------------------------- */
  cuadroActual() {
    // Quieto = el dibujo normal. Los cuadros son solo para caminar.
    if (!this.caminando) return null;

    // Primero busca cuadros de esta direccion; si no hay, los generales
    let cuadros = Sprites.cuadros("heroe-" + this.direccion);
    if (cuadros.length === 0) cuadros = Sprites.cuadros("heroe");
    if (cuadros.length === 0) return null;   // no hiciste cuadros todavia

    /* Cada media vuelta del ciclo (PI) cambiamos de cuadro.
       El % (resto de la division) hace que la cuenta vuelva a
       empezar sola: 0, 1, 2, 0, 1, 2, 0... para siempre.
       Sin el %, el numero crecería hasta el infinito. */
    const i = Math.floor(this.paso / Math.PI) % cuadros.length;
    return cuadros[i];
  },

  /* ---------------------------------------------------------
     ANIMACION FORMA 2: UN SOLO DIBUJO, MOVIDO CON MATEMATICA
     ---------------------------------------------------------
     No hace falta dibujar nada nuevo: agarramos el dibujo que
     ya tenemos y lo hacemos rebotar, inclinarse y aplastarse.

     Es sorprendente lo vivo que se ve un dibujo quieto con
     solo tres numeritos moviendose.
     --------------------------------------------------------- */
  movimientoDeCaminata() {
    if (!this.caminando) return { rebote: 0, inclinacion: 0, aplaste: 0 };

    /* Math.sin(paso) va de -1 a 1, como una ola.
       Math.abs() le saca el signo, asi que abs(sin()) va de 0 a 1
       y toca el 0 DOS VECES por vuelta... una por cada pie.
       Justo lo que necesitabamos para una caminata. */
    const salto = Math.abs(Math.sin(this.paso));

    return {
      // negativo = para ARRIBA (acordate que la Y va al reves)
      rebote: -salto * CONFIG.REBOTE_AL_CAMINAR,

      /* El balanceo usa sin() SIN el abs(), asi que da numeros
         negativos y positivos: se inclina para un lado con un pie
         y para el otro lado con el otro pie.

         Fijate lo preciso que es esto: el rebote usa abs(sin(paso))
         y el balanceo usa sin(paso). El MISMO numero, una funcion
         de diferencia, y salen dos movimientos distintos que encajan
         perfecto entre si. El pico del rebote cae justo en el pico
         de la inclinacion, que es cuando el pie esta en el aire. */
      inclinacion: Math.sin(this.paso) * CONFIG.BALANCEO_AL_CAMINAR,

      // se aplasta justo cuando el pie toca el piso (cuando salto vale 0)
      aplaste: (1 - salto) * CONFIG.APLASTE_AL_CAMINAR,
    };
  },

  dibujar(ahora) {
    // Parpadeo mientras sos invulnerable.
    // El % (resto de la division) hace que el resultado se repita
    // en ciclos: es la forma mas comun de hacer algo intermitente.
    if (this.esInvulnerable(ahora) && Math.floor(ahora / 90) % 2 === 0) return;

    /* El DIBUJO y la CAJA son dos cosas distintas:
       la caja mide 20x24 y el dibujo mide CONFIG.TAMANIO_HEROE.

       Lo centramos a lo ancho y lo alineamos ABAJO, para que los pies
       del dibujo queden donde estan los pies de la caja. Si lo centraras
       a lo alto, un dibujo grande parecería estar hundido en el piso. */
    const tam  = CONFIG.TAMANIO_HEROE;
    const dibX = this.x + this.w / 2 - tam / 2;
    const dibY = this.y + this.h - tam;

    /* LA SOMBRA VA PRIMERO (lo primero que se dibuja queda abajo)
       y NO se mueve junto con el heroe: se queda pegada al piso
       mientras el heroe rebota.

       Eso es lo que hace que parezca que DA PASOS en vez de flotar.
       Si la sombra subiera y bajara con el, el efecto desaparece.
       Probalo: es el detalle mas chiquito y el que mas se nota. */
    if (CONFIG.SOMBRA) {
      Dibujante.sombra(this.x + this.w / 2, this.y + this.h - 1, this.w * 0.9, 7);
    }

    Dibujante.conMovimiento(
      dibX, dibY, tam, tam,
      this.movimientoDeCaminata(),
      () => {
        const cuadro = this.cuadroActual();

        if (cuadro) {
          // hay cuadros de animacion: usamos el que toca
          Dibujante.imagen(cuadro, dibX, dibY, tam, tam);
        } else {
          // no hay: el dibujo de siempre (o el de reserva si falta)
          Dibujante.dibujar(
            ["heroe-" + this.direccion, "heroe"],
            dibX, dibY, tam, tam,
            (c, x, y, w, h) => Reservas.heroe(c, x, y, w, h, this.direccion),
            "heroe.png"
          );
        }
      }
    );

    if (CONFIG.MOSTRAR_CAJAS) Dibujante.caja(this.x, this.y, this.w, this.h, "#00ff88");
  },
};
