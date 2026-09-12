/* ============================================================
   TECLADO = LAS OREJAS DEL JUEGO
   ============================================================
   El juego no "mira" el teclado todo el tiempo.
   El navegador le AVISA cuando pasa algo. Eso se llama EVENTO.

     keydown -> "che, apretaron una tecla"
     keyup   -> "che, la soltaron"

   Nosotros anotamos en una listita cuales estan apretadas ahora.
   Despues, en cada cuadro del juego, preguntamos la lista.

   Hay DOS preguntas distintas y es importante entender la diferencia:

     apretada()       -> "la esta manteniendo apretada?"  (para CAMINAR)
     recienApretada() -> "la apreto JUSTO ahora?"         (para SALTAR, PAUSA)

   Si usaras apretada() para la pausa, con un solo toque
   pausarias y despausarias 60 veces por segundo. Un desastre.
   ============================================================ */

const Teclado = {

  // Que teclas estan apretadas EN ESTE MOMENTO
  activas: {},

  // Que teclas se apretaron EN ESTE CUADRO (se vacia al final de cada cuadro)
  nuevas: {},

  iniciar() {
    window.addEventListener("keydown", (e) => {
      // Las flechas y el espacio hacen scrollear la pagina. Se lo prohibimos.
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) {
        e.preventDefault();
      }

      const t = e.key.toLowerCase();

      // Si NO estaba apretada antes, entonces es nueva
      if (!this.activas[t]) this.nuevas[t] = true;

      this.activas[t] = true;

      Sonidos.encender(); // primera tecla = permiso para hacer ruido
    });

    window.addEventListener("keyup", (e) => {
      this.activas[e.key.toLowerCase()] = false;
    });

    // Si te vas a otra pestania, soltamos todo (si no, el heroe sigue caminando solo)
    window.addEventListener("blur", () => { this.activas = {}; });
  },

  apretada(...teclas) {
    return teclas.some(t => this.activas[t]);
  },

  recienApretada(...teclas) {
    return teclas.some(t => this.nuevas[t]);
  },

  // ---------- Atajos con nombre ----------
  // Asi en el resto del juego escribimos Teclado.arriba() y se entiende solo.
  arriba()    { return this.apretada("arrowup", "w"); },
  abajo()     { return this.apretada("arrowdown", "s"); },
  izquierda() { return this.apretada("arrowleft", "a"); },
  derecha()   { return this.apretada("arrowright", "d"); },

  // Se llama al final de cada cuadro: lo "nuevo" ya dejo de ser nuevo
  limpiarCuadro() {
    this.nuevas = {};
  },
};
