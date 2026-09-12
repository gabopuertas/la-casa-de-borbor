/* ============================================================
   MAIN = EL DIRECTOR DE ORQUESTA
   ============================================================
   Todos los otros archivos saben hacer UNA cosa.
   Este archivo es el que les dice cuando hacerla.

   ------------------------------------------------------------
   EL BUCLE DEL JUEGO (game loop)
   ------------------------------------------------------------
   Un videojuego es una PELICULA que se dibuja sola, muy rapido.
   El cine usa 24 dibujos por segundo. Los juegos, 60.

   Cada uno de esos dibujos se llama CUADRO (o "frame").
   Y en cada cuadro pasa siempre lo mismo, en este orden:

        1. LEER      que teclas estan apretadas
        2. PENSAR    mover todo, revisar choques, sumar puntos
        3. DIBUJAR   pintar la foto nueva
        4. REPETIR   (60 veces por segundo, para siempre)

   Eso es TODO. Desde el Pong de 1972 hasta el Fortnite: el mismo
   bucle. Lo que cambia es cuanta cosa entra en el paso 2 y 3.

   ------------------------------------------------------------
   LOS ESTADOS
   ------------------------------------------------------------
   El juego no siempre hace lo mismo. A veces esta en la portada,
   a veces jugando, a veces en pausa. Eso es una MAQUINA DE ESTADOS:
   en cada momento esta en UN estado, y hay reglas para cambiar.

        portada  --espacio-->  jugando
        jugando  --P-------->  pausa
        jugando  --sin vida->  perdiste
        jugando  --llegas X->  ganaste

   Sin estados, el codigo se llena de "si esto y no aquello y
   tampoco lo otro" y se vuelve imposible de entender.
   ============================================================ */

const Juego = {

  estado: "cargando",
  anterior: 0,
  ahora: 0,

  /* ---------------------------------------------------------
     ARRANQUE
     --------------------------------------------------------- */
  iniciar() {
    const canvas = document.getElementById("pantalla");
    Dibujante.iniciar(canvas);
    Teclado.iniciar();

    revisarMapas();   // control de calidad de los mapas

    // Mostramos "cargando" mientras buscamos los dibujos
    this.dibujarCargando();

    // Primero los dibujos, y CUANDO TERMINEN, el resto.
    // No podemos arrancar antes: no sabriamos que dibujos existen.
    Sprites.cargarTodo(() => {

      console.log(
        "%c Dibujos encontrados: " + Sprites.listos + " de " + Sprites.total,
        "background:#ffd166; color:#12121c; font-weight:bold; padding:2px 6px"
      );
      if (Sprites.faltantes.length) {
        console.log("Todavia faltan estos (y el juego los dibuja con codigo):");
        console.log(Sprites.faltantes.join(", "));
      }

      this.estado = "portada";
      this.anterior = performance.now();
      requestAnimationFrame((t) => this.cuadro(t));
    });
  },

  /* ---------------------------------------------------------
     CARGAR UN MAPA
     ---------------------------------------------------------
     Armar un mapa es: limpiar lo viejo y poner lo nuevo.
     Si te olvidas de limpiar, los enemigos del mapa anterior
     quedan dando vueltas en el nuevo. (Pasa. Siempre pasa.)
     --------------------------------------------------------- */
  cargarMapa(clave) {
    Mundo.cargar(clave);
    Enemigos.vaciar();
    Objetos.vaciar();

    for (const s of Mundo.spawns) {
      if (s.tipo === "jugador") {
        Jugador.ponerEn(s.x, s.y);
      } else if (s.tipo === "baboso" || s.tipo === "sombra") {
        Enemigos.crear(s.tipo, s.x, s.y);
      } else {
        Objetos.crear(s.tipo, s.x, s.y);
      }
    }

    Amigo.aparecerCerca(Jugador);   // Chispa viaja con vos a todos lados

    Camara.seguir(Jugador, Mundo.anchoPx, Mundo.altoPx);
    HUD.avisar(Mundo.mapa.nombre);
  },

  empezarPartida() {
    Jugador.reiniciarTodo();
    Memoria.reiniciar();     // Chispa arranca sin recuerdos de la partida anterior
    HUD.limpiar();
    this.cargarMapa(CONFIG.MAPA_INICIAL);
    this.estado = "jugando";
  },

  /* ---------------------------------------------------------
     UN CUADRO DEL JUEGO
     --------------------------------------------------------- */
  cuadro(tiempo) {
    this.ahora = tiempo;

    /* dt = "delta time" = cuanto tiempo paso desde el cuadro anterior,
       medido en "cuadros ideales" de 1/60 de segundo.

       Si la compu va perfecta, dt = 1.
       Si se trabo un toque, dt = 2 y todo se mueve el doble
       para compensar. Asi el juego dura lo mismo en cualquier compu.

       El Math.min(3, ...) es un seguro: si dejas la pestania
       en segundo plano 10 segundos, sin ese limite el heroe
       aparecería teletransportado del otro lado del mapa. */
    const dt = Math.min(3, (tiempo - this.anterior) / (1000 / 60));
    this.anterior = tiempo;

    Reservas.tiempo += dt;   // el reloj de las animaciones

    this.leerTeclas();

    if (this.estado === "jugando") {
      this.pensar(dt);
    }

    this.dibujarTodo();

    // Muy importante: al final del cuadro, lo "recien apretado"
    // deja de ser nuevo. Si no, una tecla valdria por 60 toques.
    Teclado.limpiarCuadro();

    // Y pedimos el proximo cuadro. Esto es lo que hace el bucle.
    requestAnimationFrame((t) => this.cuadro(t));
  },

  leerTeclas() {
    const empezar = Teclado.recienApretada(" ", "enter");

    switch (this.estado) {

      case "portada":
        if (empezar) this.empezarPartida();
        break;

      case "jugando":
        if (Teclado.recienApretada("p")) this.estado = "pausa";
        if (Teclado.recienApretada("r")) this.empezarPartida();
        if (Teclado.recienApretada("e")) Amigo.preguntarle(this.ahora);
        break;

      case "pausa":
        if (Teclado.recienApretada("p", "escape")) this.estado = "jugando";
        break;

      case "perdiste":
      case "ganaste":
        if (empezar || Teclado.recienApretada("r")) this.empezarPartida();
        break;
    }
  },

  /* ---------------------------------------------------------
     PENSAR = la logica de un cuadro
     ---------------------------------------------------------
     El ORDEN importa. Primero se mueve todo, despues se revisa
     que paso. Si revisaras antes de mover, siempre irias un
     cuadro atrasado y las colisiones fallarian.
     --------------------------------------------------------- */
  pensar(dt) {
    Jugador.actualizar(dt);
    Enemigos.actualizar(dt, this.ahora);
    Objetos.actualizar();
    Amigo.actualizar(dt, this.ahora);
    HUD.actualizar(dt);

    Camara.seguir(Jugador, Mundo.anchoPx, Mundo.altoPx);

    // Pise un portal?
    const debajo = Mundo.letraEnCentro(Jugador);

    if (debajo === ">" && Mundo.mapa.siguiente) {
      Sonidos.portal();
      this.cargarMapa(Mundo.mapa.siguiente);
    }

    if (debajo === "X") {
      Sonidos.ganar();
      this.estado = "ganaste";
    }

    if (Jugador.vidas <= 0) {
      Sonidos.perder();
      this.estado = "perdiste";
    }
  },

  /* ---------------------------------------------------------
     DIBUJAR
     ---------------------------------------------------------
     El orden es como apilar calcomanias:
     lo que dibujas ultimo queda arriba de todo.

        1. el piso
        2. los objetos
        3. los enemigos
        4. el heroe
        5. el HUD  (arriba de todo, sin camara)
     --------------------------------------------------------- */
  dibujarTodo() {
    Dibujante.limpiar("#0c0c14");

    if (this.estado === "portada") { this.dibujarPortada(); return; }

    Dibujante.conCamara(() => {
      Mundo.dibujar();
      Objetos.dibujar();
      Amigo.dibujar();
      Enemigos.dibujar();
      Jugador.dibujar(this.ahora);

      // El globo de Chispa va al final para que no lo tape nada
      Amigo.dibujarGlobo();
    });

    HUD.dibujar();

    if (this.estado === "pausa")    this.dibujarPausa();
    if (this.estado === "perdiste") this.dibujarPerdiste();
    if (this.estado === "ganaste")  this.dibujarGanaste();
  },

  dibujarCargando() {
    Dibujante.limpiar("#0c0c14");
    Dibujante.textoConSombra("Cargando...", CONFIG.ANCHO / 2, CONFIG.ALTO / 2, 24, "#ffd166");
  },

  dibujarPortada() {
    const cx = CONFIG.ANCHO / 2;

    /* Partimos el titulo en dos: la ultima palabra grande y dorada,
       y el resto chiquito arriba. Asi "La Casa de BorBor" queda

              LA CASA DE
               BORBOR

       .split(" ")  corta el texto en palabras
       .pop()       saca la ultima y te la da
       .join(" ")   vuelve a pegar las que quedaron

       Lo bueno: si algun dia cambias NOMBRE_JUEGO en config.js,
       la portada se reacomoda sola. No hay que tocar nada aca. */
    const palabras = CONFIG.NOMBRE_JUEGO.toUpperCase().split(" ");
    const ultima = palabras.pop();
    const arriba = palabras.join(" ");

    if (arriba) Dibujante.textoConSombra(arriba, cx, 120, 26, "#e8e8f0");
    Dibujante.textoConSombra(ultima, cx, 168, 46, "#ffd166");

    // Un heroe de muestra saludando en la portada
    Dibujante.dibujar(
      ["heroe-abajo", "heroe"],
      cx - 32, 200, 64, 64,
      (c, x, y, w, h) => Reservas.heroe(c, x, y, w, h, "abajo")
    );

    Dibujante.texto("Flechas o WASD para caminar", cx, 300, 16, "#9a9ab5", "center", false);
    Dibujante.texto("Junta monedas, abri puertas, llega al castillo", cx, 324, 16, "#9a9ab5", "center", false);
    Dibujante.texto("Te acompaña " + CONFIG.NOMBRE_AMIGO + ". Apreta E para preguntarle",
                    cx, 348, 15, "#4ecdc4", "center", false);

    // Parpadea para llamar la atencion (otra vez sin/coseno al rescate)
    if (Math.floor(Reservas.tiempo / 30) % 2 === 0) {
      Dibujante.textoConSombra("Apreta ESPACIO para empezar", cx, 392, 20, "#7bc74d");
    }

    // El contador de dibujos: el objetivo de BorBor es llegar a 15/15
    const color = Sprites.faltantes.length === 0 ? "#7bc74d" : "#9a9ab5";
    Dibujante.texto(
      "Tus dibujos en el juego: " + Sprites.listos + " de " + Sprites.total,
      cx, CONFIG.ALTO - 24, 14, color, "center", false
    );
  },

  dibujarPausa() {
    Dibujante.velo(0.6);
    Dibujante.textoConSombra("PAUSA", CONFIG.ANCHO / 2, CONFIG.ALTO / 2 - 6, 40, "#ffd166");
    Dibujante.texto("P para seguir", CONFIG.ANCHO / 2, CONFIG.ALTO / 2 + 28, 16, "#9a9ab5", "center", false);
  },

  dibujarPerdiste() {
    Dibujante.velo(0.72, "#3a0a14");
    Dibujante.textoConSombra("TE QUEDASTE SIN CORAZONES", CONFIG.ANCHO / 2, CONFIG.ALTO / 2 - 20, 26, "#ff4d6d");
    Dibujante.texto("Monedas juntadas: " + Jugador.monedas, CONFIG.ANCHO / 2, CONFIG.ALTO / 2 + 14, 17, "#ffd166", "center");
    Dibujante.texto("Apreta ESPACIO para volver a intentar", CONFIG.ANCHO / 2, CONFIG.ALTO / 2 + 48, 15, "#e8e8f0", "center", false);
  },

  dibujarGanaste() {
    Dibujante.velo(0.72, "#1a2a12");
    Dibujante.textoConSombra("GANASTE!", CONFIG.ANCHO / 2, CONFIG.ALTO / 2 - 30, 44, "#ffd166");
    Dibujante.texto("Llegaste al final del castillo", CONFIG.ANCHO / 2, CONFIG.ALTO / 2 + 6, 17, "#e8e8f0", "center", false);
    Dibujante.texto("Monedas: " + Jugador.monedas + "   Corazones: " + Jugador.vidas,
                    CONFIG.ANCHO / 2, CONFIG.ALTO / 2 + 36, 17, "#7bc74d", "center");
    Dibujante.texto("Apreta ESPACIO para jugar de nuevo", CONFIG.ANCHO / 2, CONFIG.ALTO / 2 + 70, 15, "#9a9ab5", "center", false);
  },
};


/* ============================================================
   LA CHISPA QUE PRENDE TODO
   ============================================================
   Esperamos a que el navegador termine de armar la pagina.
   Si arrancaramos antes, document.getElementById("pantalla")
   devolveria null porque el canvas todavia no existiria.
   ============================================================ */
window.addEventListener("DOMContentLoaded", () => {

  console.log(
    "%c " + CONFIG.NOMBRE_JUEGO.toUpperCase() + " ",
    "background:#4ea8de; color:#fff; font-size:16px; font-weight:bold; padding:4px 10px"
  );
  console.log("Esta es la CONSOLA. Aca el juego te cuenta cosas.");
  console.log("Proba escribir:  CONFIG.VELOCIDAD_JUGADOR = 8   y apreta Enter.");

  Juego.iniciar();
});
