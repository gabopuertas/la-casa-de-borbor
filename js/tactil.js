/* ============================================================
   CONTROLES TACTILES
   ============================================================
   El juego se hizo con teclado. En un celular no hay teclado.

   >>> LA IDEA CLAVE DE TODO ESTE ARCHIVO <<<

   No cambiamos NADA del juego. Ni el jugador, ni los enemigos,
   ni Chispa, ni el bucle. Nadie se entera de que existe una
   pantalla tactil.

   Lo que hacemos es que los botones de la pantalla FINJAN SER
   TECLAS: cuando apoyas el dedo en la palanca, este archivo
   anota "esta apretada la flecha derecha" en la misma listita
   donde lo anota el teclado de verdad.

   El resto del juego sigue preguntando lo mismo de siempre:

        Teclado.derecha()   ->   true

   ...y le da exactamente igual si eso vino de una tecla o de
   un dedo.

   Eso se llama ADAPTADOR: una pieza que traduce algo nuevo al
   idioma que el sistema ya hablaba. Es la forma mas barata y
   mas segura de agregar algo grande sin romper lo que funciona.

   (El enchufe de Chispa en js/amigo/cerebro.js es la misma idea.
    Si dos partes se hablan por un contrato claro, podes cambiar
    cualquiera de las dos sin tocar la otra.)
   ============================================================ */

const Tactil = {

  activo: false,

  // que dedo esta manejando la palanca
  dedoDeLaPalanca: null,
  radio: 50,

  /* ---------------------------------------------------------
     HAY PANTALLA TACTIL?
     ---------------------------------------------------------
     maxTouchPoints dice cuantos dedos puede detectar la pantalla.
     0 = no es tactil.

     Y aceptamos "?tactil=1" al final de la direccion para poder
     probar los controles desde la compu, sin celular a mano.
     --------------------------------------------------------- */
  hayPantallaTactil() {
    if (new URLSearchParams(location.search).has("tactil")) return true;
    return navigator.maxTouchPoints > 0;
  },

  iniciar() {
    this.activo = this.hayPantallaTactil();
    if (!this.activo) return;

    // Esta clase prende los controles en el CSS
    document.body.classList.add("tactil");

    this.conectarPalanca();
    this.conectarBotones();
    this.conectarPantalla();
    this.evitarGestosDelNavegador();
  },

  /* ---------------------------------------------------------
     FINGIR UNA TECLA
     ---------------------------------------------------------
     Esta funcion es TODO el truco del archivo.
     Hace lo mismo que hace js/teclado.js cuando apretas
     una tecla de verdad.
     --------------------------------------------------------- */
  fingirTecla(tecla, apretada) {
    // Si no estaba apretada y ahora si, es "recien apretada".
    // Eso es lo que usa la pausa y el boton de Chispa.
    if (apretada && !Teclado.activas[tecla]) Teclado.nuevas[tecla] = true;

    Teclado.activas[tecla] = apretada;
  },

  soltarTodasLasFlechas() {
    for (const t of ["arrowup", "arrowdown", "arrowleft", "arrowright"]) {
      Teclado.activas[t] = false;
    }
  },

  /* ---------------------------------------------------------
     LA PALANCA (joystick)
     ---------------------------------------------------------
     Medimos cuanto se corrio el dedo desde el centro.
     Eso nos da una flecha (dx, dy) que apunta hacia donde
     queres ir. Despues esa flecha se convierte en teclas.

     La ZONA MUERTA es importante: si no la pusieramos, el
     personaje saldria caminando con el mas minimo temblor del
     dedo y se sentiria descontrolado. Todos los joysticks de
     todas las consolas tienen zona muerta.
     --------------------------------------------------------- */
  conectarPalanca() {
    const base = document.getElementById("joystick");
    const palanca = document.getElementById("palanca");

    const centro = () => {
      const caja = base.getBoundingClientRect();
      this.radio = caja.width / 2;
      return { x: caja.left + caja.width / 2, y: caja.top + caja.height / 2 };
    };

    const mover = (e) => {
      const c = centro();
      let dx = e.clientX - c.x;
      let dy = e.clientY - c.y;

      // Si el dedo se va lejos, lo "atamos" al borde del circulo.
      // Math.hypot es Pitagoras: la distancia en linea recta.
      const largo = Math.hypot(dx, dy);
      if (largo > this.radio) {
        dx = (dx / largo) * this.radio;
        dy = (dy / largo) * this.radio;
      }

      // la bolita sigue al dedo
      palanca.style.transform = `translate(${dx}px, ${dy}px)`;

      // 25% del radio: mas abajo de eso, no cuenta
      const zonaMuerta = this.radio * 0.25;

      this.fingirTecla("arrowleft",  dx < -zonaMuerta);
      this.fingirTecla("arrowright", dx >  zonaMuerta);
      this.fingirTecla("arrowup",    dy < -zonaMuerta);
      this.fingirTecla("arrowdown",  dy >  zonaMuerta);
    };

    base.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.dedoDeLaPalanca = e.pointerId;

      /* setPointerCapture = "este dedo es mio hasta que lo levante".
         Sin esto, si arrastras el dedo fuera del circulo, el
         navegador deja de avisarnos y el personaje se queda
         caminando solo para siempre. Bug clasico. */
      base.setPointerCapture(e.pointerId);

      Sonidos.encender();   // el primer toque tambien habilita el sonido
      mover(e);
    });

    base.addEventListener("pointermove", (e) => {
      if (e.pointerId !== this.dedoDeLaPalanca) return;
      e.preventDefault();
      mover(e);
    });

    const soltar = (e) => {
      if (e.pointerId !== this.dedoDeLaPalanca) return;
      this.dedoDeLaPalanca = null;
      palanca.style.transform = "translate(0px, 0px)";
      this.soltarTodasLasFlechas();
    };

    base.addEventListener("pointerup", soltar);
    base.addEventListener("pointercancel", soltar);
  },

  /* ---------------------------------------------------------
     LOS BOTONES
     --------------------------------------------------------- */
  conectarBotones() {
    const botones = [
      ["btnHablar", "e"],
      ["btnPausa",  "p"],
    ];

    for (const [id, tecla] of botones) {
      const boton = document.getElementById(id);
      if (!boton) continue;

      boton.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        boton.setPointerCapture(e.pointerId);
        Sonidos.encender();
        this.fingirTecla(tecla, true);
      });

      const soltar = (e) => {
        e.preventDefault();
        this.fingirTecla(tecla, false);
      };
      boton.addEventListener("pointerup", soltar);
      boton.addEventListener("pointercancel", soltar);
    }

    // Pantalla completa (en algunos celulares no existe: lo escondemos)
    const btnPantalla = document.getElementById("btnPantalla");
    if (btnPantalla) {
      if (!document.documentElement.requestFullscreen) {
        btnPantalla.style.display = "none";
      } else {
        btnPantalla.addEventListener("click", () => {
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen().catch(() => {});
        });
      }
    }
  },

  /* ---------------------------------------------------------
     TOCAR LA PANTALLA = ESPACIO
     ---------------------------------------------------------
     En la portada, al perder y al ganar, tocar en cualquier
     lado tiene que servir. Nadie busca un boton chiquito.
     --------------------------------------------------------- */
  conectarPantalla() {
    const canvas = document.getElementById("pantalla");

    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      Sonidos.encender();

      if (["portada", "perdiste", "ganaste"].includes(Juego.estado)) {
        // Solo "recien apretada": el juego la lee en este cuadro
        // y se limpia sola al final. No hay que soltar nada.
        Teclado.nuevas[" "] = true;
      }
    });
  },

  /* ---------------------------------------------------------
     APAGAR LAS MAÑAS DEL NAVEGADOR
     ---------------------------------------------------------
     En el celular, el navegador quiere hacer cosas con tus
     dedos: hacer zoom con dos, refrescar si arrastras para
     abajo, seleccionar texto si mantenes apretado...

     Todo eso arruina un juego. Se lo pedimos que no lo haga.
     --------------------------------------------------------- */
  evitarGestosDelNavegador() {
    // zoom con dos dedos
    document.addEventListener("touchmove", (e) => {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    // zoom de Safari
    document.addEventListener("gesturestart", (e) => e.preventDefault());

    // doble toque = zoom
    document.addEventListener("dblclick", (e) => e.preventDefault());

    // Si giras el telefono, la palanca queda en otro lado:
    // soltamos todo para que el heroe no siga caminando solo.
    window.addEventListener("orientationchange", () => {
      this.dedoDeLaPalanca = null;
      this.soltarTodasLasFlechas();
      const palanca = document.getElementById("palanca");
      if (palanca) palanca.style.transform = "translate(0px, 0px)";
    });
  },
};
