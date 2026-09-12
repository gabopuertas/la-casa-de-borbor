/* ============================================================
   CONFIG = LA PERILLA DEL JUEGO
   ============================================================
   Todos los NUMEROS importantes del juego viven aca, juntos.

   Por que? Porque asi, si queres que el heroe corra mas rapido,
   no tenes que buscar por todos lados: cambias UN numero aca.

   Esto en programacion se llama "no dejar numeros magicos sueltos".
   Un numero suelto en el medio del codigo es un numero magico:
   nadie se acuerda que significaba tres semanas despues.

   >>> PROBA CAMBIAR ESTOS NUMEROS Y APRETA F5 EN EL NAVEGADOR <<<
   ============================================================ */

const CONFIG = {

  // ---------- Tamanios ----------
  TILE: 32,          // cada casilla del mapa mide 32x32 pixeles
  ANCHO: 640,        // ancho del canvas (20 casillas de 32)
  ALTO: 480,         // alto del canvas  (15 casillas de 32)

  // ---------- Nombres ----------
  // El titulo se muestra en la pestania del navegador y en la portada.
  // La portada agranda LA ULTIMA PALABRA, asi que el nombre importante
  // conviene dejarlo al final: "La Casa de BORBOR".
  NOMBRE_JUEGO: "La Casa de BorBor",

  // ---------- El heroe ----------
  NOMBRE_HEROE: "BorBor",
  VELOCIDAD_JUGADOR: 2.2,    // pixeles por cuadro. Proba 5 y despues 0.5 :)
  TAMANIO_HEROE: 34,         // que tan grande se DIBUJA (la casilla mide 32).
                             // Solo cambia el dibujo, no el tamanio real:
                             // el heroe sigue chocando igual contra las paredes.
  VIDAS_INICIALES: 3,
  VIDAS_MAXIMAS: 5,
  INVULNERABLE_MS: 1200,     // tiempo que parpadeas sin recibir danio

  /* ---------- COMO SE MUEVE EL HEROE AL CAMINAR ----------
     Estas 4 perillas controlan que tan "vivo" se ve.
     Poné todo en 0 y vas a ver lo tieso que queda. */
  VELOCIDAD_ANIMACION: 0.22,   // que tan rapido es el ciclo de caminata
  REBOTE_AL_CAMINAR: 2.5,      // cuanto sube y baja, en pixeles
  BALANCEO_AL_CAMINAR: 6,      // cuanto se inclina, en GRADOS
  APLASTE_AL_CAMINAR: 0.07,    // cuanto se aplasta al pisar (0 a 1)
  SOMBRA: true,                // la manchita oscura abajo de los pies

  /* ---------- CHISPA, EL AMIGO ----------
     Su cerebro esta en la carpeta js/amigo/ */
  AMIGO_ACTIVADO: true,
  NOMBRE_AMIGO: "Chispa",
  AMIGO_VELOCIDAD: 2.6,              // un toque mas rapido que vos, para alcanzarte
  TAMANIO_AMIGO: 28,                 // que tan grande se dibuja
  AMIGO_FLOTA: 2.5,                  // cuanto sube y baja en el aire (0 = se posa)
  AMIGO_DISTANCIA: 42,               // a que distancia te sigue, en pixeles
  AMIGO_PENSAMIENTOS_POR_SEGUNDO: 6, // NO piensa 60 veces por segundo: no hace falta
  AMIGO_PAUSA_ENTRE_FRASES: 2800,    // milisegundos callado entre frase y frase
  AMIGO_NO_REPETIR: 15000,           // cuanto tarda en volver a decir lo mismo

  // ---------- Los enemigos ----------
  VELOCIDAD_BABOSO: 0.6,     // el lento, camina de un lado al otro
  VELOCIDAD_SOMBRA: 1.15,    // el que te persigue
  VISTA_SOMBRA: 6,           // en casillas: si estas mas cerca, te ve

  // ---------- Premios ----------
  MONEDAS_DEL_COFRE: 10,
  GOLPES_DEL_GARROTE: 3,     // cuantos enemigos podes romper con un garrote

  // ---------- Donde empieza la aventura ----------
  MAPA_INICIAL: "pueblo",

  // ---------- Modo aprendiz (cosas para ver como funciona) ----------
  MOSTRAR_FALTANTES: true,   // escribe el nombre del dibujo que todavia falta
  MOSTRAR_CAJAS: false,      // true = ves las "cajas invisibles" de colision
};
