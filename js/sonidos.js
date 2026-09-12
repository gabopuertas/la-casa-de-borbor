/* ============================================================
   SONIDOS
   ============================================================
   Sorpresa: aca NO hay ningun archivo de musica.
   La computadora FABRICA los sonidos en el momento.

   Un sonido es una vibracion. Si vibra rapido -> agudo (piii).
   Si vibra lento -> grave (buum).
   Esa velocidad se llama FRECUENCIA y se mide en Hertz (Hz).

      262 Hz  = Do
      440 Hz  = La  (la nota con la que se afinan las guitarras)
      880 Hz  = La, pero una octava mas arriba (el doble!)

   Fijate: el doble de frecuencia = la misma nota mas aguda.
   Eso es matematica escondida adentro de la musica.
   ============================================================ */

const Sonidos = {

  ctx: null,

  // Los navegadores no dejan sonar nada hasta que el usuario toca algo.
  // (Para que ninguna pagina te grite apenas la abris.)
  // Por eso encendemos el audio con la primera tecla.
  encender() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  },

  /* Toca UNA nota.
     frecuencia = que tan agudo (Hz)
     duracion   = cuanto dura (en segundos)
     tipo       = la "forma" de la onda: square suena a consola vieja   */
  tono(frecuencia, duracion, tipo = "square", volumen = 0.06) {
    if (!this.ctx) return;

    const oscilador = this.ctx.createOscillator(); // el que vibra
    const ganancia  = this.ctx.createGain();       // el volumen

    oscilador.type = tipo;
    oscilador.frequency.value = frecuencia;

    // Bajamos el volumen de a poco hasta 0 para que no haga "clack" al cortar
    ganancia.gain.setValueAtTime(volumen, this.ctx.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duracion);

    oscilador.connect(ganancia);       // el que vibra -> el volumen
    ganancia.connect(this.ctx.destination); // el volumen -> los parlantes

    oscilador.start();
    oscilador.stop(this.ctx.currentTime + duracion);
  },

  // Varias notas, una atras de la otra. Eso es una melodia.
  melodia(notas, tipo = "square") {
    let espera = 0;
    for (const [frecuencia, duracion] of notas) {
      setTimeout(() => this.tono(frecuencia, duracion, tipo), espera * 1000);
      espera += duracion;
    }
  },

  // ---------- Los sonidos del juego ----------
  // Cambiale los numeros y escucha que pasa!
  moneda()   { this.melodia([[988, 0.05], [1319, 0.10]]); },
  llave()    { this.melodia([[784, 0.06], [1047, 0.06], [1319, 0.12]]); },
  cofre()    { this.melodia([[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.16]]); },
  puerta()   { this.melodia([[220, 0.10], [330, 0.14]], "triangle"); },
  golpe()    { this.melodia([[300, 0.04], [150, 0.09]], "sawtooth"); },
  danio()    { this.melodia([[180, 0.12], [120, 0.18]], "sawtooth"); },
  curar()    { this.melodia([[659, 0.08], [880, 0.14]], "sine"); },
  portal()   { this.melodia([[440, 0.07], [587, 0.07], [880, 0.07], [1175, 0.14]], "sine"); },
  perder()   { this.melodia([[392, 0.16], [330, 0.16], [262, 0.16], [196, 0.40]], "sawtooth"); },
  ganar()    { this.melodia([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.30], [784, 0.12], [1047, 0.45]]); },
};
