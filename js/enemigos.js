/* ============================================================
   LOS ENEMIGOS
   ============================================================
   Hay dos clases, y son distintas A PROPOSITO:

     BABOSO  -> camina para un lado hasta chocar, y se da vuelta.
                No te mira. No le importas. Es un obstaculo que anda.

     SOMBRA  -> si te acercas, TE PERSIGUE. Si te alejas, se olvida.

   Esto es INTELIGENCIA ARTIFICIAL de videojuego. No es magia:
   son unos pocos "si pasa esto, hace aquello". Lo importante no es
   que el enemigo sea inteligente, es que el jugador CREA que lo es.

   Un juego bueno mezcla enemigos aburridos y enemigos peligrosos.
   Si todos te persiguen, es un caos y no podes pensar.
   Si ninguno te persigue, te aburris. La gracia esta en la mezcla.
   ============================================================ */

const Enemigos = {

  lista: [],

  vaciar() {
    this.lista = [];
  },

  crear(tipo, px, py) {
    const tamanio = 24;

    this.lista.push({
      tipo: tipo,
      x: px + (CONFIG.TILE - tamanio) / 2,
      y: py + (CONFIG.TILE - tamanio) / 2,
      w: tamanio,
      h: tamanio,

      // Direccion inicial al azar, asi no arrancan todos igual.
      // Math.random() da un numero entre 0 y 1.
      dx: Math.random() < 0.5 ? -1 : 1,
      dy: 0,

      persiguiendo: false,
      vivo: true,       // cuando lo rompes con el garrote pasa a false
    });
  },

  actualizar(dt, ahora) {
    for (const e of this.lista) {

      if (!e.vivo) continue;          // a los rotos no hay que moverlos

      if (e.tipo === "baboso") this.moverBaboso(e, dt);
      else                     this.moverSombra(e, dt);

      if (!this.seTocan(e, Jugador)) continue;

      /* ---------------------------------------------------------
         CHOQUE CON UN ENEMIGO
         ---------------------------------------------------------
         Aca pasa una de dos cosas, y la diferencia la hace el
         garrote de BorBor:

           tenes golpes  ->  el enemigo se rompe
           no tenes      ->  te saca un corazon

         Fijate que es el MISMO choque. Lo que cambia no es el
         choque, es el estado del jugador. Casi todo el "poder"
         en los videojuegos funciona asi: no cambia el mundo,
         cambia la regla con la que el mundo te trata.
         --------------------------------------------------------- */
      if (Jugador.golpes > 0) {
        e.vivo = false;
        Jugador.golpes--;
        Sonidos.golpe();
        HUD.avisar(Jugador.golpes > 0
          ? "Le diste! Te quedan " + Jugador.golpes + " golpes"
          : "Se te gasto el garrote");
      } else {
        Jugador.recibirDanio(ahora, e.x + e.w / 2, e.y + e.h / 2);
      }
    }
  },

  /* ---------------------------------------------------------
     BABOSO: ida y vuelta
     --------------------------------------------------------- */
  moverBaboso(e, dt) {
    const paso = CONFIG.VELOCIDAD_BABOSO * dt;
    const nx = e.x + e.dx * paso;
    const ny = e.y + e.dy * paso;

    if (Mundo.chocaCaja(nx, ny, e.w, e.h)) {
      // Choque: me doy vuelta.
      // Multiplicar por -1 da vuelta el signo: 1 pasa a -1, -1 pasa a 1.
      e.dx *= -1;
      e.dy *= -1;

      // De vez en cuando cambia de eje, asi no es TAN predecible
      if (Math.random() < 0.35) {
        const guardar = e.dx;
        e.dx = e.dy;
        e.dy = guardar;
      }
    } else {
      e.x = nx;
      e.y = ny;
    }
  },

  /* ---------------------------------------------------------
     SOMBRA: te persigue si te ve
     ---------------------------------------------------------
     "Verte" aca es solo medir la distancia. Si estas mas cerca
     que CONFIG.VISTA_SOMBRA casillas, te persigue.

     Para perseguir usa una idea muy simple:
     se mueve por el eje donde esta MAS LEJOS de vos.
     Si esta bloqueada, prueba el otro eje.
     No es la mejor IA del mundo, pero funciona y se entiende.
     --------------------------------------------------------- */
  moverSombra(e, dt) {
    const cx = e.x + e.w / 2,  cy = e.y + e.h / 2;
    const jx = Jugador.x + Jugador.w / 2;
    const jy = Jugador.y + Jugador.h / 2;

    const dx = jx - cx;
    const dy = jy - cy;

    // Math.hypot(a, b) es la distancia en linea recta. Pitagoras.
    const distancia = Math.hypot(dx, dy);
    e.persiguiendo = distancia < CONFIG.VISTA_SOMBRA * CONFIG.TILE;

    if (!e.persiguiendo) {
      this.moverBaboso(e, dt * 0.5);   // si no te ve, deambula lento
      return;
    }

    const paso = CONFIG.VELOCIDAD_SOMBRA * dt;

    // Math.sign devuelve -1, 0 o 1: solo el SENTIDO, sin la cantidad
    const pasoX = Math.sign(dx) * paso;
    const pasoY = Math.sign(dy) * paso;

    const primeroEnX = Math.abs(dx) > Math.abs(dy);

    // Dos ayudantes: uno mueve en X, otro en Y.
    // Cada uno avisa (true/false) si pudo o si habia pared.
    const moverX = (m) => {
      if (m !== 0 && !Mundo.chocaCaja(e.x + m, e.y, e.w, e.h)) { e.x += m; return true; }
      return false;
    };
    const moverY = (m) => {
      if (m !== 0 && !Mundo.chocaCaja(e.x, e.y + m, e.w, e.h)) { e.y += m; return true; }
      return false;
    };

    // Intenta por el eje donde estas mas lejos.
    // Si hay una pared, prueba por el otro: asi la sombra
    // "rodea" los arboles en vez de quedarse clavada empujandolos.
    if (primeroEnX) {
      if (!moverX(pasoX)) moverY(pasoY);
    } else {
      if (!moverY(pasoY)) moverX(pasoX);
    }
  },

  /* ---------------------------------------------------------
     SE TOCAN DOS CAJAS?  (esto se llama colision AABB)
     ---------------------------------------------------------
     AABB = "Axis Aligned Bounding Box": cajas derechitas,
     sin rotar. Es la forma mas rapida y mas usada de detectar
     choques en 2D.

     El truco es pensarlo AL REVES. Es mucho mas facil listar
     las 4 formas de NO tocarse:

        A esta totalmente a la izquierda de B
        A esta totalmente a la derecha de B
        A esta totalmente arriba de B
        A esta totalmente abajo de B

     Si ninguna de esas 4 pasa... entonces se tocan. Listo.
     --------------------------------------------------------- */
  seTocan(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  },

  dibujar() {
    for (const e of this.lista) {
      if (!e.vivo) continue;

      const dibujoDeReserva = (e.tipo === "baboso")
        ? (c, x, y, w, h) => Reservas.baboso(c, x, y, w, h)
        : (c, x, y, w, h) => Reservas.sombra(c, x, y, w, h);

      Dibujante.dibujar(
        e.tipo,
        e.x - 4, e.y - 6, CONFIG.TILE, CONFIG.TILE,
        dibujoDeReserva,
        e.tipo + ".png"
      );

      // Signito de alerta cuando la sombra te vio
      if (e.persiguiendo) {
        Dibujante.textoConSombra("!", e.x + e.w / 2, e.y - 8, 14, "#ff4d6d");
      }

      if (CONFIG.MOSTRAR_CAJAS) Dibujante.caja(e.x, e.y, e.w, e.h, "#ff4d6d");
    }
  },
};
