/* ============================================================
   DIBUJANTE = EL QUE PINTA EN LA PANTALLA
   ============================================================
   Todo lo que se ve pasa por aca.

   UNA IDEA CLAVE: HAY DOS MUNDOS DE COORDENADAS

     * Coordenadas del MUNDO: donde estan las cosas en el mapa.
       El cofre esta en x=800 aunque la pantalla mida 640.

     * Coordenadas de la PANTALLA: donde se ven en la tele.

   La CAMARA es lo que traduce uno en otro.
   Es igual que filmar una pelicula: los actores estan en el set
   (mundo), la camara elige que pedacito se ve (pantalla).

   Si el heroe camina a la derecha, en realidad podes pensarlo
   de dos formas: "el heroe avanza" o "el mundo entero retrocede".
   El juego hace la segunda. Por eso la camara suma/resta a todo.
   ============================================================ */

const Camara = {
  x: 0,
  y: 0,

  /* La camara sigue al heroe pero SIN salirse del mapa.
     Si no la frenaras, al llegar al borde verias el vacio negro. */
  seguir(objetivo, anchoMundo, altoMundo) {
    // 1. queremos al heroe justo en el centro de la pantalla
    this.x = objetivo.x + objetivo.w / 2 - CONFIG.ANCHO / 2;
    this.y = objetivo.y + objetivo.h / 2 - CONFIG.ALTO / 2;

    // 2. pero la frenamos en los bordes del mapa
    this.x = Math.max(0, Math.min(this.x, anchoMundo - CONFIG.ANCHO));
    this.y = Math.max(0, Math.min(this.y, altoMundo - CONFIG.ALTO));

    // 3. si el mapa es mas chico que la pantalla, lo centramos
    if (anchoMundo < CONFIG.ANCHO) this.x = (anchoMundo - CONFIG.ANCHO) / 2;
    if (altoMundo  < CONFIG.ALTO)  this.y = (altoMundo  - CONFIG.ALTO)  / 2;
  },
};


const Dibujante = {

  ctx: null,

  iniciar(canvas) {
    this.ctx = canvas.getContext("2d");
    // sin suavizado: los dibujos quedan nitidos, estilo consola vieja
    this.ctx.imageSmoothingEnabled = false;
  },

  limpiar(color = "#12121c") {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, CONFIG.ANCHO, CONFIG.ALTO);
  },

  // Prende la camara: a partir de aca, todo lo que dibujes
  // usa coordenadas DEL MUNDO y el canvas se encarga de correrlo.
  conCamara(dibujar) {
    this.ctx.save();
    this.ctx.translate(-Math.round(Camara.x), -Math.round(Camara.y));
    dibujar(this.ctx);
    this.ctx.restore();   // save + restore siempre van de a dos, como parentesis
  },

  /* ---------------------------------------------------------
     LA FUNCION MAS IMPORTANTE DEL JUEGO
     ---------------------------------------------------------
     "Dibuja este sprite. Si no existe, usa el dibujo de reserva."

     nombre   -> "moneda", o una lista ["heroe-izq", "heroe"]
     reserva  -> la funcion de reservas.js que dibuja con codigo
     etiqueta -> texto para avisar que falta ese dibujo
     --------------------------------------------------------- */
  dibujar(nombre, x, y, w, h, reserva, etiqueta = null) {
    const img = Array.isArray(nombre)
      ? Sprites.primero(nombre)
      : Sprites.obtener(nombre);

    if (img) {
      // Math.round evita que el dibujo quede "entre dos pixeles" y se vea borroso
      this.ctx.drawImage(img, Math.round(x), Math.round(y), w, h);
    } else {
      reserva(this.ctx, Math.round(x), Math.round(y), w, h);

      if (etiqueta && CONFIG.MOSTRAR_FALTANTES) {
        this.etiquetaFaltante(etiqueta, x, y, w, h);
      }
    }
  },

  etiquetaFaltante(texto, x, y, w, h) {
    const c = this.ctx;
    c.save();
    c.font = "8px monospace";
    c.textAlign = "center";
    const ancho = c.measureText(texto).width + 6;
    c.fillStyle = "rgba(0,0,0,0.65)";
    c.fillRect(x + w / 2 - ancho / 2, y + h - 1, ancho, 10);
    c.fillStyle = "#ffd166";
    c.fillText(texto, x + w / 2, y + h + 7);
    c.restore();
  },

  // Dibuja una imagen que ya tenemos en la mano (sin buscarla por nombre)
  imagen(img, x, y, w, h) {
    this.ctx.drawImage(img, Math.round(x), Math.round(y), w, h);
  },

  /* ---------------------------------------------------------
     LA SOMBRA
     ---------------------------------------------------------
     Una manchita oscura abajo de los pies. Parece un detalle
     tonto y es de las cosas que MAS cambian un juego visto
     desde arriba: sin sombra, los personajes parecen pegados
     como calcomanias. Con sombra, parecen apoyados en el piso.
     --------------------------------------------------------- */
  sombra(cx, cy, ancho, alto, opacidad = 0.22) {
    const c = this.ctx;
    c.save();
    c.globalAlpha = opacidad;
    c.fillStyle = "#000";
    c.beginPath();
    c.ellipse(cx, cy, ancho / 2, alto / 2, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  },

  /* ---------------------------------------------------------
     DIBUJAR CON MOVIMIENTO
     ---------------------------------------------------------
     Esta es la magia de que el heroe "camine" con UN SOLO dibujo.

     No tocamos el dibujo. Lo que movemos es EL PAPEL donde
     se dibuja. El canvas nos deja tres ordenes para eso:

        translate -> correr el papel
        rotate    -> girar el papel
        scale     -> estirar o aplastar el papel

     >>> EL DETALLE IMPORTANTE: EL PUNTO DE GIRO <<<

     Por defecto, el canvas gira todo alrededor del punto (0,0),
     o sea la esquina de arriba a la izquierda de la pantalla.
     Si rotaras asi, el heroe saldria volando por la pantalla.

     Lo que queremos es que gire alrededor de SUS PIES, como
     una persona de verdad que se balancea. El truco clasico es:

        1. correr el papel hasta los pies
        2. girar / aplastar ahi
        3. correr el papel de vuelta

     Asi el giro pasa donde nosotros queremos.
     --------------------------------------------------------- */
  conMovimiento(x, y, w, h, mov, dibujar) {
    const c = this.ctx;

    const pieX = x + w / 2;    // el punto entre los dos pies
    const pieY = y + h;

    c.save();

    c.translate(0, mov.rebote);          // sube y baja todo

    c.translate(pieX, pieY);             // 1. me paro en los pies
    // Los grados se convierten a radianes: media vuelta = 180 grados = PI.
    // Las computadoras siempre trabajan en radianes.
    c.rotate((mov.inclinacion * Math.PI) / 180);
    c.scale(1 + mov.aplaste, 1 - mov.aplaste);   // mas ancho = mas bajito
    c.translate(-pieX, -pieY);           // 3. vuelvo

    dibujar();

    c.restore();                         // deja el papel como estaba
  },

  /* ---------------------------------------------------------
     EL GLOBO DE DIALOGO
     ---------------------------------------------------------
     El canvas NO sabe partir un texto en renglones: si le das
     una frase larga, la escribe toda derecho y se va de pantalla.

     Asi que hay que partirla a mano. El truco es simple:
     vas agregando palabras de a una y midiendo cuanto ocupa.
     Cuando te pasas del ancho, cortas y arrancas un renglon nuevo.
     Esto se llama "ajuste de linea" (word wrap) y es lo que hace
     tu procesador de textos cada vez que escribis.
     --------------------------------------------------------- */
  partirTexto(texto, anchoMaximo) {
    const palabras = texto.split(" ");
    const renglones = [];
    let actual = "";

    for (const palabra of palabras) {
      const prueba = actual ? actual + " " + palabra : palabra;

      if (this.ctx.measureText(prueba).width > anchoMaximo && actual) {
        renglones.push(actual);   // este renglon ya esta lleno
        actual = palabra;         // la palabra arranca el siguiente
      } else {
        actual = prueba;
      }
    }
    if (actual) renglones.push(actual);
    return renglones;
  },

  cajaRedonda(x, y, w, h, radio) {
    const c = this.ctx;
    c.beginPath();
    if (c.roundRect) {
      c.roundRect(x, y, w, h, radio);
    } else {
      c.rect(x, y, w, h);   // por si el navegador es viejito
    }
  },

  globo(texto, cx, baseY, anchoMaximo = 150) {
    const c = this.ctx;
    c.save();
    c.font = 'bold 11px "Trebuchet MS", sans-serif';

    const renglones = this.partirTexto(texto, anchoMaximo);

    let ancho = 0;
    for (const r of renglones) ancho = Math.max(ancho, c.measureText(r).width);
    ancho += 18;
    const alto = renglones.length * 14 + 12;

    const x = Math.round(cx - ancho / 2);
    const y = Math.round(baseY - alto);

    c.fillStyle = "rgba(16,16,26,0.92)";
    c.strokeStyle = "#4ecdc4";
    c.lineWidth = 2;

    // la colita va primero, asi el globo le tapa el borde de arriba
    c.beginPath();
    c.moveTo(cx - 6, y + alto - 2);
    c.lineTo(cx, y + alto + 8);
    c.lineTo(cx + 6, y + alto - 2);
    c.closePath();
    c.fill();
    c.stroke();

    this.cajaRedonda(x, y, ancho, alto, 7);
    c.fill();
    c.stroke();

    c.fillStyle = "#e8e8f0";
    c.textAlign = "center";
    renglones.forEach((r, i) => c.fillText(r, cx, y + 18 + i * 14));

    c.restore();
  },

  // Para el modo aprendiz: muestra las "cajas invisibles"
  caja(x, y, w, h, color = "#ff00ff") {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, w - 1, h - 1);
  },

  texto(txt, x, y, tamanio = 16, color = "#fff", alineacion = "left", negrita = true) {
    const c = this.ctx;
    c.font = (negrita ? "bold " : "") + tamanio + 'px "Trebuchet MS", sans-serif';
    c.textAlign = alineacion;
    c.fillStyle = color;
    c.fillText(txt, x, y);
    c.textAlign = "left";
  },

  textoConSombra(txt, x, y, tamanio, color, alineacion = "center") {
    this.texto(txt, x + 2, y + 2, tamanio, "rgba(0,0,0,0.7)", alineacion);
    this.texto(txt, x, y, tamanio, color, alineacion);
  },

  // Una cortina oscura encima de todo (para la pausa, el game over...)
  velo(opacidad = 0.7, color = "#000") {
    this.ctx.save();
    this.ctx.globalAlpha = opacidad;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, CONFIG.ANCHO, CONFIG.ALTO);
    this.ctx.restore();
  },
};
