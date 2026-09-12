/* ============================================================
   CEREBRO = EL ENCHUFE
   ============================================================
   Este archivo es chiquito pero es el mas importante de todos
   para entender como se arma software que dura.

   El cuerpo del amigo (amigo.js) NO sabe como se piensa.
   Solo sabe hacer esta pregunta:

        Cerebro.pensar(percepcion, memoria) -> { accion, frase }

   Esa pregunta se llama CONTRATO o INTERFAZ. Es una promesa:
   "vos dame un resumen del mundo, yo te devuelvo que hacer".

   Mientras se cumpla el contrato, adentro puede haber CUALQUIER
   COSA: nuestra lista de ideas con puntajes, un modelo de
   lenguaje, un dado... el cuerpo ni se entera.

   >>> POR QUE ESTO IMPORTA <<<
   Hoy el amigo piensa con reglas, porque asi funciona sin
   internet, gratis, y sobre todo porque se puede LEER y ENTENDER.
   Manana podes enchufarle un modelo de IA de verdad sin tocar
   ni una linea del cuerpo, ni del juego.

   Cambiar una pieza sin romper las otras es, basicamente,
   de que se trata programar bien.
   ============================================================ */

const Cerebro = {

  // Cual de los cerebros esta enchufado ahora
  motor: "local",

  /* ---------------------------------------------------------
     CEREBRO 1: LOCAL (el que esta funcionando)
     ---------------------------------------------------------
     Usa la lista de ideas con puntajes de decision.js.
     Anda sin internet, no cuesta nada, es instantaneo
     y se puede leer entero en 10 minutos.
     --------------------------------------------------------- */
  local(p, m, ahora, forzar) {
    return Decision.elegir(p, m, ahora, forzar);
  },

  /* ---------------------------------------------------------
     CEREBRO 2: REMOTO (la plantilla, apagada)
     ---------------------------------------------------------
     Asi se le enchufaria un modelo de IA de verdad.

     No esta prendido por dos razones honestas:

       1. Haria falta un servidor propio con una clave secreta.
          Una clave NUNCA puede ir adentro de una pagina web:
          cualquiera que abra el codigo la puede leer y usar
          con tu tarjeta. Por eso hace falta un intermediario.

       2. Este juego tiene que andar con doble clic y sin
          internet. Esa es una decision de diseño, no una
          limitacion tecnica.

     Fijate igual la forma: devuelve EXACTAMENTE lo mismo que
     el cerebro local. Ese es todo el truco.
     --------------------------------------------------------- */
  urlDelServidor: null,     // por ejemplo "https://mi-servidor.workers.dev/pensar"

  async remoto(p, m) {
    if (!this.urlDelServidor) return null;

    const respuesta = await fetch(this.urlDelServidor, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        situacion: p,                  // el mismo resumen que arma percepcion.js
        recuerdos: { lastimado: m.vecesLastimado },
        instruccion: "Sos Chispa, el amigo robot. Contesta en UNA frase corta, " +
                     "en español rioplatense, como le hablarias a un chico de 10 años.",
      }),
    });

    const datos = await respuesta.json();
    return { idea: "remoto", accion: "seguir", frase: datos.frase };
  },

  /* ---------------------------------------------------------
     LA PUERTA DE ENTRADA
     ---------------------------------------------------------
     El cuerpo llama SIEMPRE a esta funcion, y nunca se entera
     de cual cerebro contesto.
     --------------------------------------------------------- */
  pensar(p, m, ahora, forzar = false) {
    if (this.motor === "local") return this.local(p, m, ahora, forzar);

    // Un cerebro remoto tarda (viaja por internet), asi que no puede
    // contestar en el mismo instante. Habria que pedirlo ahora y usar
    // la respuesta cuando llegue. Eso es programacion ASINCRONA,
    // lo mismo que pasa al cargar los dibujos en sprites.js.
    return null;
  },
};
