/* ============================================================
   MEMORIA = LO QUE EL AMIGO SE ACUERDA
   ============================================================
   La percepcion solo ve el AHORA. Un ser que solo ve el ahora
   no puede ser interesante: repetiria las mismas cosas para
   siempre y nunca se daria cuenta de nada.

   La memoria guarda el ANTES. Y con el antes y el ahora juntos
   aparece algo nuevo: los CAMBIOS.

      antes: 3 corazones  |  ahora: 2 corazones
      -> te lastimaron!

   Fijate que "te lastimaron" no existe en ningun lado del juego.
   No hay ninguna variable que diga eso. Es algo que el amigo
   DEDUCE comparando dos fotos. Eso ya es un poquito de
   inteligencia: sacar informacion nueva de lo que ya tenias.

   La memoria tambien sirve para algo muy poco glamoroso y muy
   importante: NO REPETIRSE. Un personaje que dice la misma
   frase 40 veces deja de parecer vivo en 10 segundos.
   ============================================================ */

const Memoria = {

  // --- lo que habia en la foto anterior ---
  vidaAntes: 0,
  monedasAntes: 0,
  llavesAntes: 0,
  mapaAntes: null,

  // --- cosas que acaban de pasar (duran un instante) ---
  eventos: {},

  // --- historia ---
  vecesLastimado: 0,
  vecesLastimadoAca: 0,
  mapasVisitados: [],

  // --- para no repetirse ---
  ultimaVezQueDijo: {},   // nombre de la idea -> momento
  frasesUsadas: {},       // nombre de la idea -> lista de numeros ya usados
  momentoUltimaFrase: -99999,

  // --- para saber si estas perdido ---
  ultimaPosicion: { x: 0, y: 0 },
  quietoDesde: 0,

  reiniciar() {
    this.vidaAntes = CONFIG.VIDAS_INICIALES;
    this.monedasAntes = 0;
    this.llavesAntes = 0;
    this.mapaAntes = null;
    this.eventos = {};
    this.vecesLastimado = 0;
    this.vecesLastimadoAca = 0;
    this.mapasVisitados = [];
    this.ultimaVezQueDijo = {};
    this.frasesUsadas = {};
    this.momentoUltimaFrase = -99999;
    this.quietoDesde = 0;
  },

  /* ---------------------------------------------------------
     COMPARAR LA FOTO DE AHORA CON LA DE ANTES
     --------------------------------------------------------- */
  actualizar(p, ahora) {
    this.eventos = {};    // los eventos duran un solo pensamiento

    if (p.mapa !== this.mapaAntes) {
      this.eventos.mapaNuevo = true;
      this.vecesLastimadoAca = 0;
      if (!this.mapasVisitados.includes(p.mapa)) this.mapasVisitados.push(p.mapa);
      this.mapaAntes = p.mapa;
    }

    if (p.vida < this.vidaAntes) {
      this.eventos.teLastimaron = true;
      this.vecesLastimado++;
      this.vecesLastimadoAca++;
    }
    if (p.vida > this.vidaAntes) this.eventos.teCuraste = true;

    if (p.monedas > this.monedasAntes) {
      this.eventos.monedasGanadas = p.monedas - this.monedasAntes;
    }
    if (p.llaves > this.llavesAntes) this.eventos.llaveNueva = true;

    // Guardamos la foto de ahora, que en el proximo pensamiento
    // va a ser la foto de antes. Asi se encadena todo.
    this.vidaAntes = p.vida;
    this.monedasAntes = p.monedas;
    this.llavesAntes = p.llaves;

    // Estas quieto? (te moviste menos de 20 pixeles desde la ultima vez)
    const movimiento = Math.hypot(
      Jugador.x - this.ultimaPosicion.x,
      Jugador.y - this.ultimaPosicion.y
    );
    if (movimiento < 20) {
      if (this.quietoDesde === 0) this.quietoDesde = ahora;
    } else {
      this.quietoDesde = 0;
      this.ultimaPosicion = { x: Jugador.x, y: Jugador.y };
    }
  },

  // Hace cuanto que estas sin moverte, en segundos
  segundosQuieto(ahora) {
    if (this.quietoDesde === 0) return 0;
    return (ahora - this.quietoDesde) / 1000;
  },

  puedeHablar(ahora) {
    return ahora - this.momentoUltimaFrase > CONFIG.AMIGO_PAUSA_ENTRE_FRASES;
  },

  // Hace cuanto dijo algo de este tipo (para no ser repetitivo)
  dijoHaceMuyPoco(idea, ahora) {
    const ultima = this.ultimaVezQueDijo[idea];
    if (ultima === undefined) return false;
    return ahora - ultima < CONFIG.AMIGO_NO_REPETIR;
  },

  /* Elige una frase de la lista SIN repetir hasta haberlas usado
     todas. Es el mismo truco de un mazo de cartas: no barajas de
     nuevo hasta que se te acaban. Si eligieras siempre al azar,
     la misma frase saldria dos veces seguidas bastante seguido
     y quedaria raro. */
  elegirFrase(idea, frases) {
    if (!this.frasesUsadas[idea]) this.frasesUsadas[idea] = [];
    let usadas = this.frasesUsadas[idea];

    if (usadas.length >= frases.length) {
      usadas = this.frasesUsadas[idea] = [];   // se acabo el mazo: barajamos
    }

    const libres = [];
    for (let i = 0; i < frases.length; i++) {
      if (!usadas.includes(i)) libres.push(i);
    }

    const elegida = libres[Math.floor(Math.random() * libres.length)];
    usadas.push(elegida);
    return frases[elegida];
  },

  anotarQueHablo(idea, ahora) {
    this.ultimaVezQueDijo[idea] = ahora;
    this.momentoUltimaFrase = ahora;
  },
};
