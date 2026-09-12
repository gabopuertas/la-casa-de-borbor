/* ============================================================
   MUNDO = EL MAPA YA ARMADO
   ============================================================
   mapas.js tiene el mapa escrito con letras (texto).
   mundo.js lo convierte en algo que el juego puede usar:
   una grilla, una lista de enemigos, una lista de monedas...

   Eso de "traducir un texto a algo util" se llama PARSEAR.
   Lo hacen los navegadores con el HTML, los celulares con los
   mensajes... es una de las tareas mas comunes de la programacion.

   ------------------------------------------------------------
   COLISIONES: EL TRUCO MAS IMPORTANTE DE LOS VIDEOJUEGOS
   ------------------------------------------------------------
   El heroe NO es un dibujo para el juego. Para el juego el heroe
   es un RECTANGULO INVISIBLE (x, y, ancho, alto). Una "caja".

   Para saber si choca contra una pared, el juego no mira el dibujo:
   se fija en que casillas cae esa caja. Si alguna es solida, choco.

   Por eso podes poner MI dibujo o TU dibujo y las colisiones
   siguen funcionando igual: el dibujo es solo la ropa.

   (Poné CONFIG.MOSTRAR_CAJAS = true y vas a VER las cajas.)
   ============================================================ */

const Mundo = {

  clave: null,       // "pueblo", "bosque", "castillo"
  mapa: null,        // el objeto entero del mapa
  grilla: [],        // filas convertidas en listas de letras
  ancho: 0,          // en casillas
  alto: 0,
  anchoPx: 0,        // en pixeles
  altoPx: 0,
  spawns: [],        // las cosas que habia que sacar del mapa

  cargar(clave) {
    const mapa = MAPAS[clave];
    if (!mapa) {
      console.error("No existe el mapa:", clave);
      return;
    }

    this.clave = clave;
    this.mapa = mapa;
    this.spawns = [];

    // .split("") corta un texto en letras sueltas: "abc" -> ["a","b","c"]
    this.grilla = mapa.grilla.map(fila => fila.split(""));

    this.alto = this.grilla.length;
    this.ancho = this.grilla[0].length;
    this.anchoPx = this.ancho * CONFIG.TILE;
    this.altoPx = this.alto * CONFIG.TILE;

    // Recorremos TODAS las casillas buscando entidades.
    // Dos "for" uno adentro del otro: uno para las filas, otro
    // para las columnas. Es la forma normal de recorrer una grilla.
    for (let fil = 0; fil < this.alto; fil++) {
      for (let col = 0; col < this.ancho; col++) {

        const letra = this.grilla[fil][col];
        const tipo = ENTIDADES[letra];

        if (tipo) {
          this.spawns.push({
            tipo: tipo,
            x: col * CONFIG.TILE,
            y: fil * CONFIG.TILE,
          });

          // La sacamos del mapa y dejamos piso normal en su lugar
          this.grilla[fil][col] = mapa.suelo;
        }
      }
    }
  },

  // ---------- PREGUNTAS SOBRE EL MAPA ----------

  letraEn(col, fil) {
    if (col < 0 || fil < 0 || col >= this.ancho || fil >= this.alto) return "#";
    return this.grilla[fil][col];
  },

  esSolido(col, fil) {
    const info = LEYENDA[this.letraEn(col, fil)];
    return info ? info.solido : true;   // si no lo conozco, mejor que sea pared
  },

  // La casilla que hay en un punto en pixeles
  colDe(x) { return Math.floor(x / CONFIG.TILE); },
  filDe(y) { return Math.floor(y / CONFIG.TILE); },

  /* ---------------------------------------------------------
     CHOCA ESTA CAJA CONTRA UNA PARED?
     ---------------------------------------------------------
     Miramos todas las casillas que la caja toca.
     Ojo con el -1: si la caja va de x=0 a x=32 (ancho 32),
     ocupa los pixeles del 0 al 31, NO el 32. El pixel 32 ya es
     la casilla de al lado. Ese "-1" evita chocar con paredes
     que en realidad no estas tocando. Es un bug clasico.
     --------------------------------------------------------- */
  chocaCaja(x, y, w, h) {
    const colIni = this.colDe(x);
    const colFin = this.colDe(x + w - 1);
    const filIni = this.filDe(y);
    const filFin = this.filDe(y + h - 1);

    for (let fil = filIni; fil <= filFin; fil++) {
      for (let col = colIni; col <= colFin; col++) {
        if (this.esSolido(col, fil)) return true;
      }
    }
    return false;
  },

  /* Busca puertas en las casillas que toca la caja.
     Si encuentra una y hay llave, la abre (la borra del mapa). */
  intentarAbrirPuerta(x, y, w, h) {
    const colIni = this.colDe(x), colFin = this.colDe(x + w - 1);
    const filIni = this.filDe(y), filFin = this.filDe(y + h - 1);

    for (let fil = filIni; fil <= filFin; fil++) {
      for (let col = colIni; col <= colFin; col++) {
        if (this.letraEn(col, fil) === "P") {
          this.grilla[fil][col] = this.mapa.suelo;   // chau puerta
          return true;
        }
      }
    }
    return false;
  },

  // Que hay justo abajo del centro de algo (para el portal y la meta)
  letraEnCentro(obj) {
    return this.letraEn(
      this.colDe(obj.x + obj.w / 2),
      this.filDe(obj.y + obj.h / 2)
    );
  },

  /* ---------------------------------------------------------
     DIBUJAR EL MAPA
     ---------------------------------------------------------
     Truco de rendimiento: NO dibujamos las 600 casillas.
     Solo las que entran en la pantalla en este momento.

     Un mapa de 30x20 son 600 casillas. A 60 cuadros por segundo
     serian 36.000 dibujos por segundo. Dibujando solo lo visible
     bajamos a unas 350. La compu lo agradece.

     Esto se llama CULLING: descartar lo que no se ve.
     --------------------------------------------------------- */
  dibujar() {
    const T = CONFIG.TILE;

    const colIni = Math.max(0, this.colDe(Camara.x) - 1);
    const filIni = Math.max(0, this.filDe(Camara.y) - 1);
    const colFin = Math.min(this.ancho - 1, this.colDe(Camara.x + CONFIG.ANCHO) + 1);
    const filFin = Math.min(this.alto - 1,  this.filDe(Camara.y + CONFIG.ALTO) + 1);

    for (let fil = filIni; fil <= filFin; fil++) {
      for (let col = colIni; col <= colFin; col++) {

        const letra = this.grilla[fil][col];
        const info = LEYENDA[letra];
        if (!info) continue;

        Dibujante.dibujar(
          info.sprite,
          col * T, fil * T, T, T,
          info.reserva
        );

        if (CONFIG.MOSTRAR_CAJAS && info.solido) {
          Dibujante.caja(col * T, fil * T, T, T, "rgba(255,0,255,0.5)");
        }
      }
    }
  },
};
