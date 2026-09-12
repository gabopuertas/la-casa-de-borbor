/* ============================================================
   RESERVAS = DIBUJOS HECHOS CON CODIGO
   ============================================================
   Estos son los dibujos "de emergencia".
   El juego los usa MIENTRAS no exista tu PNG.

   Y aca hay algo copado para entender:
   una computadora puede dibujar de DOS maneras.

     1) IMAGEN (un PNG): una grilla de pixeles ya pintados.
        Como una foto. Si la agrandas mucho, se pixela.

     2) VECTORES (codigo): ordenes tipo "hace un circulo aca,
        de este tamanio, de este color". Como explicarle a
        alguien por telefono lo que tiene que dibujar.

   Todo lo de este archivo es la forma 2.
   Cada funcion son instrucciones: mover el lapiz, pintar, cerrar.

   ctx = "contexto", el lapiz magico del canvas.
   x, y = donde arranca el dibujo (esquina de arriba a la izquierda)
   w, h = ancho y alto

   IMPORTANTE: en la computadora el eje Y va PARA ABAJO.
   y = 0 es arriba de todo. Y mas grande = mas abajo.
   Al reves de lo que te ensenian en matematica. Cuesta acostumbrarse.
   ============================================================ */

const Reservas = {

  tiempo: 0, // sube solo, sirve para que el agua y el portal se muevan

  // ---------- ayudita para no repetir ----------
  caja(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  },

  circulo(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  },

  /* ==========================================================
     EL PISO Y LAS PAREDES
     ========================================================== */

  pasto(ctx, x, y, w, h) {
    this.caja(ctx, x, y, w, h, "#4c9a3f");
    // manchitas mas oscuras para que no sea un cuadrado plano aburrido
    ctx.fillStyle = "#438a37";
    ctx.fillRect(x + 5,  y + 7,  3, 3);
    ctx.fillRect(x + 20, y + 14, 3, 3);
    ctx.fillRect(x + 12, y + 24, 3, 3);
  },

  flores(ctx, x, y, w, h) {
    this.pasto(ctx, x, y, w, h);
    const puntos = [[8, 9], [22, 12], [15, 23]];
    const colores = ["#ff6b9d", "#ffd166", "#fff"];
    puntos.forEach((p, i) => this.circulo(ctx, x + p[0], y + p[1], 3, colores[i]));
  },

  camino(ctx, x, y, w, h) {
    this.caja(ctx, x, y, w, h, "#c8a86b");
    ctx.fillStyle = "#b9985c";
    ctx.fillRect(x + 4,  y + 6,  8, 5);
    ctx.fillRect(x + 18, y + 18, 9, 6);
  },

  piedra(ctx, x, y, w, h) {
    this.caja(ctx, x, y, w, h, "#7a7a86");
    // los ladrillos: dos filas corridas, como una pared de verdad
    ctx.fillStyle = "#5e5e6b";
    ctx.fillRect(x, y + h / 2 - 1, w, 2);
    ctx.fillRect(x + w / 2 - 1, y, 2, h / 2);
    ctx.fillRect(x + w / 4 - 1, y + h / 2, 2, h / 2);
    ctx.fillRect(x + (w * 3) / 4 - 1, y + h / 2, 2, h / 2);
  },

  arbol(ctx, x, y, w, h) {
    this.pasto(ctx, x, y, w, h);
    this.caja(ctx, x + w / 2 - 3, y + h - 10, 6, 10, "#6b4423");  // tronco
    this.circulo(ctx, x + w / 2, y + h / 2 - 2, w / 2 - 2, "#2f6b2a"); // copa
    this.circulo(ctx, x + w / 2 - 4, y + h / 2 - 6, 5, "#3d8536");    // brillito
  },

  agua(ctx, x, y, w, h) {
    this.caja(ctx, x, y, w, h, "#3a7bd5");
    // Math.sin hace un vaiven suave (va y viene, va y viene).
    // Por eso sirve para olas, para latidos, para todo lo que oscila.
    const ola = Math.sin(this.tiempo / 18 + x / 14) * 3;
    ctx.fillStyle = "#6fa8f5";
    ctx.fillRect(x + 4, y + 10 + ola, 12, 2);
    ctx.fillRect(x + 16, y + 20 - ola, 10, 2);
  },

  puerta(ctx, x, y, w, h) {
    this.caja(ctx, x, y, w, h, "#8b5a2b");
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    this.circulo(ctx, x + w - 9, y + h / 2, 3, "#ffd166"); // el picaporte
  },

  portal(ctx, x, y, w, h) {
    this.pasto(ctx, x, y, w, h);
    // el portal "respira": crece y se achica con sin()
    const latido = 2 + Math.sin(this.tiempo / 10) * 2;
    this.circulo(ctx, x + w / 2, y + h / 2, w / 2 - 3, "#6b2d8b");
    this.circulo(ctx, x + w / 2, y + h / 2, w / 2 - 6 - latido, "#b06bd8");
    this.circulo(ctx, x + w / 2, y + h / 2, 3 + latido, "#f0c8ff");
  },

  meta(ctx, x, y, w, h) {
    this.caja(ctx, x, y, w, h, "#2a2a3a");
    const brillo = Math.sin(this.tiempo / 8) * 0.3 + 0.7;
    ctx.globalAlpha = brillo;
    this.circulo(ctx, x + w / 2, y + h / 2, w / 2 - 4, "#f2c14e");
    ctx.globalAlpha = 1;                 // SIEMPRE devolver la transparencia a 1,
    ctx.fillStyle = "#7a5a00";           // si no, todo lo que dibujes despues
    ctx.font = "bold 16px sans-serif";   // sale medio transparente. Error clasico!
    ctx.textAlign = "center";
    ctx.fillText("*", x + w / 2, y + h / 2 + 6);
    ctx.textAlign = "left";
  },

  /* ==========================================================
     EL TRUCO DE LA ESCALA
     ==========================================================
     Problema: el heroe se dibuja de 32x32 adentro del juego,
     pero en la portada se muestra de 64x64. Si usaramos numeros
     fijos ("la cabeza va en y=11, de radio 8"), al agrandarlo
     la cabeza quedaria diminuta y el cuerpo gigante.

     Solucion: dibujamos SIEMPRE como si midiera 32x32, empezando
     desde el 0,0. Y antes le pedimos al canvas:

        translate -> "corre el origen hasta donde va el dibujo"
        scale     -> "y ahora agranda todo lo que dibuje"

     Asi un mismo dibujo sirve para cualquier tamanio, y siempre
     con las proporciones bien. Es como dibujar en una hoja chica
     y despues sacarle una ampliacion en la fotocopiadora.
     ========================================================== */
  escalado(ctx, x, y, w, h, dibujo) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(w / 32, h / 32);   // 32 es nuestro tamanio "de base"
    dibujo();
    ctx.restore();               // deja el canvas como estaba
  },

  /* ==========================================================
     LOS PERSONAJES
     ========================================================== */

  heroe(ctx, x, y, w, h, direccion) {
    this.escalado(ctx, x, y, w, h, () => {
      // De aca para abajo dibujamos como si la casilla fuera de 32x32

      this.caja(ctx, 6, 12, 20, 16, "#4ea8de");    // cuerpo
      this.circulo(ctx, 16, 11, 8, "#ffd9a0");     // cabeza

      ctx.fillStyle = "#6b4423";                   // pelo
      ctx.fillRect(8, 3, 16, 6);

      // Los ojos: solo se ven si NO esta de espaldas
      if (direccion !== "arriba") {
        ctx.fillStyle = "#222";
        let ojoIzq = 12, ojoDer = 18;
        if (direccion === "izq") { ojoIzq -= 3; ojoDer -= 3; }
        if (direccion === "der") { ojoIzq += 3; ojoDer += 3; }
        ctx.fillRect(ojoIzq, 10, 2, 3);
        ctx.fillRect(ojoDer, 10, 2, 3);
      }

      ctx.fillStyle = "#2a4a6a";                   // pies
      ctx.fillRect(7, 28, 7, 4);
      ctx.fillRect(18, 28, 7, 4);
    });
  },

  amigo(ctx, x, y, w, h, mirandoIzquierda) {
    this.escalado(ctx, x, y, w, h, () => {
      // la antena
      ctx.strokeStyle = "#9ad7d3";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, 9);
      ctx.lineTo(16, 3);
      ctx.stroke();
      this.circulo(ctx, 16, 2, 2.5, "#ff4d6d");

      // el cuerpo, redondito
      this.circulo(ctx, 16, 19, 12, "#2a9d94");
      this.circulo(ctx, 16, 19, 10, "#4ecdc4");

      // el visor
      this.caja(ctx, 8, 15, 16, 7, "#14323a");

      // el ojo mira para donde camina
      const corrimiento = mirandoIzquierda ? -3 : 3;
      this.circulo(ctx, 16 + corrimiento, 18.5, 2.5, "#bff6ff");
    });
  },

  baboso(ctx, x, y, w, h) {
    this.escalado(ctx, x, y, w, h, () => {
      // se aplasta y se estira, como si respirara
      const aplaste = Math.sin(this.tiempo / 9) * 2;

      ctx.fillStyle = "#7bc74d";
      ctx.beginPath();
      ctx.ellipse(16, 22 + aplaste / 2, 13, 10 - aplaste, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.fillRect(10, 16, 4, 4);
      ctx.fillRect(19, 16, 4, 4);
      ctx.fillStyle = "#222";
      ctx.fillRect(11, 17, 2, 2);
      ctx.fillRect(20, 17, 2, 2);
    });
  },

  sombra(ctx, x, y, w, h) {
    this.escalado(ctx, x, y, w, h, () => {
      const flota = Math.sin(this.tiempo / 7) * 2;

      // Media luna arriba + tres puntas abajo: la silueta de fantasma
      ctx.fillStyle = "#3a2a55";
      ctx.beginPath();
      ctx.arc(16, 16 + flota, 13, Math.PI, 0);
      ctx.lineTo(29, 29 + flota);
      ctx.lineTo(3, 29 + flota);
      ctx.closePath();
      ctx.fill();

      this.circulo(ctx, 11, 16 + flota, 3, "#ff4d6d");
      this.circulo(ctx, 21, 16 + flota, 3, "#ff4d6d");
    });
  },

  /* ==========================================================
     LOS OBJETOS
     ========================================================== */

  moneda(ctx, x, y, w, h) {
    this.escalado(ctx, x, y, w, h, () => {
      // Truco de animacion: la moneda "gira" porque le cambiamos el ANCHO.
      // Cuando es finita parece que esta de costado. No gira de verdad,
      // solo se hace mas flaca y mas gorda. La magia del cine.
      const ancho = Math.abs(Math.cos(this.tiempo / 12)) * 10 + 3;

      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.ellipse(16, 16, ancho, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c99a2e";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  },

  llave(ctx, x, y, w, h) {
    this.escalado(ctx, x, y, w, h, () => {
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.arc(11, 16, 6, 0, Math.PI * 2);    // el aro
      ctx.fill();
      ctx.fillRect(15, 14, 12, 4);            // el palito
      ctx.fillRect(23, 16, 4, 5);             // los dientes

      this.circulo(ctx, 11, 16, 2.5, "#3a3a55");  // el agujero del aro
    });
  },

  cofre(ctx, x, y, w, h) {
    this.escalado(ctx, x, y, w, h, () => {
      this.caja(ctx, 4, 12, 24, 16, "#8b5a2b");   // el cuerpo
      this.caja(ctx, 4, 8,  24, 8,  "#a06a33");   // la tapa

      ctx.fillStyle = "#ffd166";
      ctx.fillRect(13, 14, 6, 8);                 // la cerradura
      ctx.fillStyle = "#6b4423";
      ctx.fillRect(4, 20, 24, 2);
    });
  },

  garrote(ctx, x, y, w, h) {
    this.escalado(ctx, x, y, w, h, () => {
      this.caja(ctx, 14, 17, 5, 13, "#6b4423");     // el mango
      this.caja(ctx, 11, 3, 11, 15, "#8b5a2b");     // la cabeza, mas gorda
      ctx.fillStyle = "#a06a33";                    // una veta mas clara
      ctx.fillRect(13, 5, 3, 11);
      this.circulo(ctx, 24, 8, 4, "#3d8536");       // una hojita
    });
  },

  corazon(ctx, x, y, w, h) {
    this.escalado(ctx, x, y, w, h, () => {
      const late = Math.sin(this.tiempo / 8) * 1.5;

      // Un corazon son dos circulos arriba y un triangulo abajo
      ctx.fillStyle = "#ff4d6d";
      ctx.beginPath();
      ctx.arc(11, 13 - late, 6, 0, Math.PI * 2);
      ctx.arc(21, 13 - late, 6, 0, Math.PI * 2);
      ctx.moveTo(5, 15 - late);
      ctx.lineTo(16, 27 - late);
      ctx.lineTo(27, 15 - late);
      ctx.closePath();
      ctx.fill();
    });
  },
};
