/* ============================================================
   PERCEPCION = LOS SENTIDOS DEL AMIGO
   ============================================================
   Antes de decidir algo, cualquier ser vivo (o cualquier IA)
   necesita PERCIBIR: enterarse de como esta el mundo ahora.

   Este archivo hace una sola cosa: mirar el juego y armar
   un resumen. Como una foto de la situacion:

      "quedan 2 corazones, hay una sombra a 3 casillas
       persiguiendo, hay una llave a 5 casillas"

   Ese resumen se lo pasamos al cerebro para que decida.

   >>> POR QUE SEPARAR ESTO <<<
   Podriamos preguntar "cuantas vidas tiene?" en el medio de
   la logica de decision. Pero entonces la decision quedaria
   pegada al juego y no se podria probar ni cambiar sola.

   Separando PERCIBIR de DECIDIR conseguimos algo enorme:
   el cerebro no sabe nada de videojuegos. Solo recibe un
   resumen y contesta que hacer. Por eso despues vamos a poder
   cambiarle el cerebro sin tocar nada mas.
   ============================================================ */

const Percepcion = {

  /* Convierte pixeles a casillas, que es como piensa una persona.
     "esta a 96 pixeles" no le dice nada a nadie.
     "esta a 3 casillas" se entiende al toque. */
  enCasillas(pixeles) {
    return pixeles / CONFIG.TILE;
  },

  distancia(a, b) {
    const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
    const bx = b.x + b.w / 2, by = b.y + b.h / 2;
    return Math.hypot(ax - bx, ay - by);
  },

  /* Busca una letra del mapa cerca del jugador.
     Recorre un cuadrado de casillas alrededor. No mira el mapa
     entero: solo lo que tendria "a la vista". */
  buscarEnMapa(letra, radioEnCasillas) {
    const col = Mundo.colDe(Jugador.x + Jugador.w / 2);
    const fil = Mundo.filDe(Jugador.y + Jugador.h / 2);
    const r = radioEnCasillas;

    let masCerca = null;

    for (let f = fil - r; f <= fil + r; f++) {
      for (let c = col - r; c <= col + r; c++) {
        if (Mundo.letraEn(c, f) !== letra) continue;

        const d = Math.hypot(c - col, f - fil);
        if (masCerca === null || d < masCerca) masCerca = d;
      }
    }
    return masCerca;   // en casillas, o null si no hay
  },

  /* ---------------------------------------------------------
     LA FOTO DE LA SITUACION
     --------------------------------------------------------- */
  mirar() {

    // --- Los enemigos ---
    let enemigoCerca = null;
    let persiguiendote = 0;
    let quedanEnemigos = 0;

    for (const e of Enemigos.lista) {
      if (!e.vivo) continue;
      quedanEnemigos++;

      const d = this.enCasillas(this.distancia(e, Jugador));
      if (e.persiguiendo) persiguiendote++;

      if (enemigoCerca === null || d < enemigoCerca.distancia) {
        enemigoCerca = { tipo: e.tipo, distancia: d, persiguiendo: !!e.persiguiendo, ref: e };
      }
    }

    // --- Las cosas que se juntan ---
    let objetoCerca = null;
    let quedanObjetos = 0;

    for (const o of Objetos.lista) {
      if (!o.vivo) continue;
      quedanObjetos++;

      const d = this.enCasillas(this.distancia(o, Jugador));
      if (objetoCerca === null || d < objetoCerca.distancia) {
        objetoCerca = { tipo: o.tipo, distancia: d, ref: o };
      }
    }

    // --- El mapa ---
    return {
      // como esta el heroe
      vida: Jugador.vidas,
      vidaMaxima: CONFIG.VIDAS_MAXIMAS,
      monedas: Jugador.monedas,
      llaves: Jugador.llaves,
      golpes: Jugador.golpes,

      // donde estamos
      mapa: Mundo.clave,
      nombreMapa: Mundo.mapa.nombre,

      // que hay alrededor
      enemigoCerca,
      persiguiendote,
      quedanEnemigos,
      objetoCerca,
      quedanObjetos,

      puertaCerca: this.buscarEnMapa("P", 5),
      portalCerca: this.buscarEnMapa(">", 5),
      metaCerca:   this.buscarEnMapa("X", 6),
    };
  },
};
