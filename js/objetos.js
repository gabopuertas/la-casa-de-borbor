/* ============================================================
   LOS OBJETOS QUE SE JUNTAN
   ============================================================
   Monedas, llaves, cofres y corazones.

   Todos funcionan igual: estan quietos esperando, y cuando tu
   caja toca su caja, pasa algo y desaparecen.

   Fijate un detalle: NO los borramos de la lista cuando los
   agarras. Les ponemos "vivo = false" y listo.

   Por que? Porque borrar cosas de una lista MIENTRAS la estas
   recorriendo es una de las formas mas faciles de romper un
   programa: se corren todos los lugares y te saltas elementos.
   Marcarlos como muertos es mas seguro y mas rapido.
   ============================================================ */

const Objetos = {

  lista: [],

  vaciar() {
    this.lista = [];
  },

  crear(tipo, px, py) {
    const tamanio = 22;

    this.lista.push({
      tipo: tipo,
      x: px + (CONFIG.TILE - tamanio) / 2,
      y: py + (CONFIG.TILE - tamanio) / 2,
      w: tamanio,
      h: tamanio,
      vivo: true,

      // desfase al azar: asi no flotan todos sincronizados como robots
      desfase: Math.random() * 10,
    });
  },

  actualizar() {
    for (const o of this.lista) {
      if (!o.vivo) continue;
      if (!Enemigos.seTocan(o, Jugador)) continue;

      o.vivo = false;
      this.agarrar(o.tipo);
    }
  },

  // Que pasa segun QUE agarraste.
  // "switch" es un "si / si no / si no" mas ordenado cuando
  // comparas siempre la misma cosa contra muchos valores.
  agarrar(tipo) {
    switch (tipo) {

      case "moneda":
        Jugador.monedas += 1;
        Sonidos.moneda();
        break;

      case "llave":
        Jugador.llaves += 1;
        Sonidos.llave();
        HUD.avisar("Conseguiste una llave!");
        break;

      case "cofre":
        Jugador.monedas += CONFIG.MONEDAS_DEL_COFRE;
        Sonidos.cofre();
        HUD.avisar("Tesoro! +" + CONFIG.MONEDAS_DEL_COFRE + " monedas");
        break;

      case "corazon":
        Jugador.curar();
        break;

      case "garrote":
        Jugador.golpes += CONFIG.GOLPES_DEL_GARROTE;
        Sonidos.golpe();
        HUD.avisar("Garrote! Podes romper " + Jugador.golpes + " enemigos");
        break;
    }
  },

  dibujar() {
    for (const o of this.lista) {
      if (!o.vivo) continue;

      // Flotan: suben y bajan con sin(), como el agua y el portal.
      // Un mismo truco matematico sirve para mil cosas distintas.
      const flote = (o.tipo === "cofre")
        ? 0                                                   // el cofre es pesado, no flota
        : Math.sin(Reservas.tiempo / 14 + o.desfase) * 2.5;

      const reserva = {
        moneda:  (c,x,y,w,h) => Reservas.moneda(c,x,y,w,h),
        llave:   (c,x,y,w,h) => Reservas.llave(c,x,y,w,h),
        cofre:   (c,x,y,w,h) => Reservas.cofre(c,x,y,w,h),
        corazon: (c,x,y,w,h) => Reservas.corazon(c,x,y,w,h),
        garrote: (c,x,y,w,h) => Reservas.garrote(c,x,y,w,h),
      }[o.tipo];

      Dibujante.dibujar(
        o.tipo,
        o.x - 5, o.y - 5 + flote, CONFIG.TILE, CONFIG.TILE,
        reserva,
        o.tipo + ".png"
      );

      if (CONFIG.MOSTRAR_CAJAS) Dibujante.caja(o.x, o.y, o.w, o.h, "#ffd166");
    }
  },
};
