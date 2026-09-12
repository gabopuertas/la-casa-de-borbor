/* ============================================================
   DECISION = COMO ELIGE QUE HACER
   ============================================================
   Aca esta el corazon de la inteligencia del amigo.

   La forma mas obvia de programar esto seria una escalera
   gigante de "si pasa esto, haces aquello":

       si hay un enemigo cerca -> avisar
       si no, si hay una llave -> avisar
       si no, si ... -> ...

   Funciona, pero se pudre rapido: cuando tenes 20 reglas ya no
   sabes cual gana, agregar una en el medio rompe las de abajo,
   y no podes decir "esto es MAS urgente que aquello".

   >>> LA FORMA QUE USAN LOS JUEGOS DE VERDAD <<<

   Se llama IA POR UTILIDAD (utility AI), y es asi:

      1. Cada idea se PUNTUA sola: "que tan urgente soy ahora?"
      2. Gana la del puntaje mas alto.

   Eso es todo. Y cambia todo, porque:

      - agregar una idea nueva NO toca ninguna de las otras
      - el orden en la lista no importa
      - podes afinar el comportamiento cambiando numeros

   Los Sims funcionan asi. Y muchisimos juegos mas.
   No tiene nada de magico: son numeritos compitiendo.
   ============================================================ */

const Decision = {

  /* ---------------------------------------------------------
     LA LISTA DE IDEAS
     ---------------------------------------------------------
     Cada idea tiene:

       nombre  -> para acordarse de que ya la dijo
       puntaje -> que tan urgente es AHORA (0 = no aplica)
       accion  -> que hace el cuerpo del amigo
       frases  -> que puede decir (elige una sin repetir)

     >>> PROBA CAMBIAR LOS PUNTAJES Y MIRA COMO CAMBIA <<<
     --------------------------------------------------------- */
  ideas: [

    {
      nombre: "peligro",
      puntaje: (p, m) =>
        (p.enemigoCerca && p.enemigoCerca.persiguiendo && p.enemigoCerca.distancia < 4)
          ? 100 : 0,
      accion: "huir",
      frases: [
        "Cuidado! Te esta siguiendo!",
        "Corre, corre, corre!",
        "Esa cosa te vio!",
        "Yo me escondo atras tuyo, eh",
      ],
    },

    {
      nombre: "casi-sin-vida",
      puntaje: (p, m) => (p.vida <= 1 ? 95 : 0),
      accion: "seguir",
      frases: [
        "Te queda un solo corazon!",
        "Ojo que si te tocan, se termina",
        "Busca un corazon, dale",
      ],
    },

    {
      nombre: "te-lastimaron",
      puntaje: (p, m) => (m.eventos.teLastimaron ? 90 : 0),
      accion: "seguir",
      frases: [
        "Ay! Estas bien?",
        "Eso dolio...",
        "Con el garrote no te pasaba eso",
      ],
    },

    {
      nombre: "garrote-a-mano",
      puntaje: (p, m) =>
        (p.golpes > 0 && p.enemigoCerca && p.enemigoCerca.distancia < 5) ? 80 : 0,
      accion: "seguir",
      frases: [
        "Tenes garrote! Chocalo de una",
        "Dale con el palo, no le tengas miedo",
        "Ahora los enemigos te tienen miedo a vos",
      ],
    },

    {
      nombre: "puerta-sin-llave",
      puntaje: (p, m) =>
        (p.puertaCerca !== null && p.puertaCerca < 3 && p.llaves === 0) ? 75 : 0,
      accion: "seguir",
      frases: [
        "Esa puerta necesita una llave",
        "Sin llave no entramos. Hay que buscarla",
        "Yo empujaria, pero no tengo brazos fuertes",
      ],
    },

    {
      nombre: "tenes-llave",
      puntaje: (p, m) =>
        (p.puertaCerca !== null && p.puertaCerca < 4 && p.llaves > 0) ? 70 : 0,
      accion: "seguir",
      frases: [
        "Tenes la llave! Camina contra la puerta",
        "Dale, abrila",
      ],
    },

    {
      nombre: "objeto-cerca",
      puntaje: (p, m) => {
        if (!p.objetoCerca || p.objetoCerca.distancia > 4) return 0;
        // los premios buenos valen mas que una moneda suelta
        const valor = { corazon: 65, garrote: 62, llave: 60, cofre: 58, moneda: 35 };
        return valor[p.objetoCerca.tipo] || 30;
      },
      accion: "señalar",
      frases: {
        // Esta idea tiene frases distintas segun QUE vio.
        // Un mismo pensamiento puede decirse de varias maneras.
        corazon: ["Un corazon! Agarralo", "Vida gratis ahi"],
        garrote: ["Un garrote! Eso pega fuerte", "Agarra ese palo, en serio"],
        llave:   ["Ahi hay una llave!", "Llave a la vista"],
        cofre:   ["Un cofre! Debe tener monedas", "Ese cofre es nuestro"],
        moneda:  ["Moneda ahi nomas", "No la dejes, es plata"],
      },
    },

    {
      nombre: "meta",
      puntaje: (p, m) => (p.metaCerca !== null && p.metaCerca < 6 ? 68 : 0),
      accion: "seguir",
      frases: [
        "Esa luz de ahi es el final!",
        "Ya casi, ya casi!",
        "Llegamos! Pisa la luz",
      ],
    },

    {
      nombre: "portal",
      puntaje: (p, m) => (p.portalCerca !== null && p.portalCerca < 4 ? 55 : 0),
      accion: "seguir",
      frases: [
        "Ese portal lleva al proximo lugar",
        "Seguro? Una vez que entramos no se vuelve",
        "Yo voy con vos, no te preocupes",
      ],
    },

    {
      nombre: "estas-perdido",
      puntaje: (p, m) => (m.segundosQuieto(Amigo.ahora) > 7 ? 45 : 0),
      accion: "señalar",
      frases: [
        "Nos quedamos quietos, eh",
        "Probaste ir para el otro lado?",
        "Si no sabes por donde, yo tampoco. Pero caminemos",
        "Los mapas se hacen con letras, sabias? Mira mapas.js",
      ],
    },

    {
      nombre: "mapa-nuevo",
      puntaje: (p, m) => (m.eventos.mapaNuevo ? 40 : 0),
      accion: "seguir",
      frases: [
        "Uh, esto es nuevo...",
        "Ojo aca, no conozco este lugar",
        "Vamos despacio",
      ],
    },

    {
      nombre: "felicitar",
      puntaje: (p, m) => (m.eventos.llaveNueva ? 38 : (m.eventos.monedasGanadas >= 5 ? 36 : 0)),
      accion: "seguir",
      frases: [
        "Buenisimo!",
        "Asi se hace!",
        "Sos un crack",
      ],
    },

    {
      nombre: "limpio",
      puntaje: (p, m) => (p.quedanEnemigos === 0 && p.quedanObjetos === 0 ? 30 : 0),
      accion: "seguir",
      frases: [
        "No queda nada por aca. Busquemos la salida",
        "Limpiamos todo el lugar!",
      ],
    },

    {
      // Esta es la de puntaje mas bajo: solo gana cuando no pasa
      // NADA interesante. Es la charla de ascensor del amigo.
      nombre: "charla",
      puntaje: (p, m) => 5,
      accion: "seguir",
      frases: [
        "Che, que lindo dia para una aventura",
        "Sabias que todo esto son numeros?",
        "Yo no tengo vida, asi que no me pueden matar. Ventajas.",
        "Me gusta como dibujaste este mundo",
        "Apreta E si queres que te diga algo util",
        "Mi cerebro esta en js/amigo/. Podes leerlo si queres",
        "Pensar 6 veces por segundo me alcanza. No soy tan rapido",
      ],
    },
  ],

  /* ---------------------------------------------------------
     ELEGIR: la parte facil, porque el trabajo ya esta hecho
     ---------------------------------------------------------
     Recorremos todas las ideas, cada una se pone su nota,
     y gana la mas alta. Nada mas.
     --------------------------------------------------------- */
  elegir(p, m, ahora, forzar = false) {

    let mejor = null;
    let mejorPuntaje = 0;

    for (const idea of this.ideas) {
      let puntaje = idea.puntaje(p, m);
      if (puntaje <= 0) continue;

      /* Si lo dijo hace muy poco, le bajamos MUCHO el puntaje
         en vez de prohibirlo. Asi, si de verdad es urgentisimo
         (un enemigo encima), lo va a decir igual. La urgencia
         le gana al aburrimiento. */
      if (m.dijoHaceMuyPoco(idea.nombre, ahora)) puntaje *= 0.15;

      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejor = idea;
      }
    }

    if (!mejor) return null;

    // Si le preguntaste con E, no queremos charla de ascensor
    if (forzar && mejor.nombre === "charla" && mejorPuntaje <= 5) {
      // igual contesta, pero al menos algo
    }

    return {
      idea: mejor.nombre,
      accion: mejor.accion,
      frase: this.sacarFrase(mejor, p, m),
    };
  },

  sacarFrase(idea, p, m) {
    let lista = idea.frases;

    // Algunas ideas tienen frases distintas segun el caso
    if (!Array.isArray(lista)) {
      const clave = p.objetoCerca ? p.objetoCerca.tipo : null;
      lista = lista[clave] || ["Mira eso"];
      return Memoria.elegirFrase(idea.nombre + ":" + clave, lista);
    }

    return Memoria.elegirFrase(idea.nombre, lista);
  },
};
