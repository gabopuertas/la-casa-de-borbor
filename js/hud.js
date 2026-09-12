/* ============================================================
   HUD = LA INFORMACION DE LA PANTALLA
   ============================================================
   HUD quiere decir "Heads-Up Display": los corazones, el puntaje,
   el nombre del mapa. Todo lo que NO es parte del mundo.

   El nombre viene de los aviones de caza: les proyectan los datos
   en el vidrio de la cabina para que el piloto no tenga que bajar
   la cabeza (heads up = cabeza arriba).

   >>> DETALLE IMPORTANTE <<<
   El HUD se dibuja SIN LA CAMARA. Los corazones tienen que quedarse
   quietos en la esquina aunque camines por todo el mapa.

   Por eso en main.js primero se dibuja el mundo (con camara)
   y DESPUES el HUD (sin camara). El orden de dibujado es como
   apilar calcos: lo ultimo que dibujas queda arriba de todo.
   ============================================================ */

const HUD = {

  mensaje: "",
  mensajeFrames: 0,   // cuantos cuadros le quedan al cartelito

  avisar(texto) {
    this.mensaje = texto;
    this.mensajeFrames = 150;   // 150 cuadros = mas o menos 2 segundos y medio
  },

  limpiar() {
    this.mensaje = "";
    this.mensajeFrames = 0;
  },

  actualizar(dt) {
    if (this.mensajeFrames > 0) this.mensajeFrames -= dt;
  },

  dibujar() {
    const c = Dibujante.ctx;

    // Una barra oscura arriba para que los numeros se lean siempre,
    // aunque abajo haya pasto clarito o agua brillante.
    c.save();
    c.globalAlpha = 0.55;
    c.fillStyle = "#12121c";
    c.fillRect(0, 0, CONFIG.ANCHO, 34);
    c.restore();

    // ---------- CORAZONES ----------
    for (let i = 0; i < CONFIG.VIDAS_MAXIMAS; i++) {
      const x = 10 + i * 26;
      const y = 3;

      if (i < Jugador.vidas) {
        Dibujante.dibujar("corazon", x, y, 26, 26,
          (cc, xx, yy, ww, hh) => Reservas.corazon(cc, xx, yy, ww, hh));
      } else {
        // corazon vacio: solo el contorno, apagado
        c.save();
        c.globalAlpha = 0.28;
        Reservas.corazon(c, x, y, 26, 26);
        c.restore();
      }
    }

    // ---------- MONEDAS ----------
    Dibujante.dibujar("moneda", 168, 4, 24, 24,
      (cc, xx, yy, ww, hh) => Reservas.moneda(cc, xx, yy, ww, hh));
    Dibujante.texto(String(Jugador.monedas), 196, 24, 17, "#ffd166");

    // ---------- LLAVES ----------
    Dibujante.dibujar("llave", 250, 4, 24, 24,
      (cc, xx, yy, ww, hh) => Reservas.llave(cc, xx, yy, ww, hh));
    Dibujante.texto(String(Jugador.llaves), 278, 24, 17, "#ffd166");

    // ---------- GARROTE (solo aparece si tenes) ----------
    // Un HUD que muestra todo todo el tiempo cansa la vista.
    // Lo que vale 0 y no importa, mejor no dibujarlo.
    if (Jugador.golpes > 0) {
      Dibujante.dibujar("garrote", 330, 4, 24, 24,
        (cc, xx, yy, ww, hh) => Reservas.garrote(cc, xx, yy, ww, hh));
      Dibujante.texto(String(Jugador.golpes), 358, 24, 17, "#7bc74d");
    }

    // ---------- NOMBRE DEL MAPA ----------
    Dibujante.texto(Mundo.mapa.nombre, CONFIG.ANCHO - 12, 23, 15, "#e8e8f0", "right");

    // ---------- CARTELITO TEMPORAL ----------
    if (this.mensajeFrames > 0) {
      // Se desvanece al final: durante los ultimos 40 cuadros
      // la opacidad baja de 1 a 0. Eso es un "fade out".
      const opacidad = Math.min(1, this.mensajeFrames / 40);

      c.save();
      c.globalAlpha = opacidad;
      Dibujante.textoConSombra(this.mensaje, CONFIG.ANCHO / 2, CONFIG.ALTO - 26, 18, "#ffd166");
      c.restore();
    }

    // ---------- AVISO DE DIBUJOS FALTANTES ----------
    if (CONFIG.MOSTRAR_FALTANTES && Sprites.faltantes.length > 0) {
      Dibujante.texto(
        "Dibujos hechos: " + Sprites.listos + "/" + Sprites.total,
        10, CONFIG.ALTO - 8, 11, "rgba(255,255,255,0.45)"
      );
    }
  },
};
