/* ============================================================
   LOS MAPAS
   ============================================================
   Mira bien esto, porque es la idea mas linda del juego:

   >>> LOS MAPAS SE DIBUJAN CON LETRAS <<<

   Cada letra es una casilla de 32x32 pixeles.
   Un '#' es una pared. Un '.' es pasto. Una 'A' es un arbol.

   Asi que si queres hacer un mapa nuevo, no necesitas ningun
   programa raro: escribis letras, como en un papel cuadriculado.

   LA UNICA REGLA IMPORTANTE:
   todas las filas tienen que tener EXACTAMENTE la misma cantidad
   de letras. Si una fila tiene 29 y las otras 30, el mapa
   se desarma. (El juego te avisa en la consola si pasa eso.)
   ============================================================ */


/* ------------------------------------------------------------
   LA LEYENDA DEL TERRENO
   ------------------------------------------------------------
   Como en los mapas de verdad: una tablita que dice que
   significa cada simbolo.

   solido: true  -> no podes pasar (pared, arbol, agua)
   solido: false -> podes caminar por encima
------------------------------------------------------------ */
const LEYENDA = {
  ".": { nombre: "pasto",  sprite: "pasto",  solido: false, reserva: (c,x,y,w,h) => Reservas.pasto(c,x,y,w,h)  },
  ",": { nombre: "flores", sprite: "flores", solido: false, reserva: (c,x,y,w,h) => Reservas.flores(c,x,y,w,h) },
  "-": { nombre: "camino", sprite: "camino", solido: false, reserva: (c,x,y,w,h) => Reservas.camino(c,x,y,w,h) },
  "#": { nombre: "piedra", sprite: "piedra", solido: true,  reserva: (c,x,y,w,h) => Reservas.piedra(c,x,y,w,h) },
  "A": { nombre: "arbol",  sprite: "arbol",  solido: true,  reserva: (c,x,y,w,h) => Reservas.arbol(c,x,y,w,h)  },
  "~": { nombre: "agua",   sprite: "agua",   solido: true,  reserva: (c,x,y,w,h) => Reservas.agua(c,x,y,w,h)   },
  "P": { nombre: "puerta", sprite: "puerta", solido: true,  reserva: (c,x,y,w,h) => Reservas.puerta(c,x,y,w,h) },
  ">": { nombre: "portal", sprite: "portal", solido: false, reserva: (c,x,y,w,h) => Reservas.portal(c,x,y,w,h) },
  "X": { nombre: "meta",   sprite: "meta",   solido: false, reserva: (c,x,y,w,h) => Reservas.meta(c,x,y,w,h)   },
};


/* ------------------------------------------------------------
   LAS COSAS QUE VIVEN ARRIBA DEL TERRENO
   ------------------------------------------------------------
   Estas letras NO son piso. Son cosas que se mueven o se juntan.
   Cuando el juego arranca, las saca del mapa, las convierte en
   objetos de verdad, y deja pasto en su lugar.
------------------------------------------------------------ */
const ENTIDADES = {
  "@": "jugador",
  "$": "moneda",
  "L": "llave",
  "C": "cofre",
  "V": "corazon",
  "G": "garrote",  // el arma: te deja romper enemigos
  "b": "baboso",   // enemigo lento: camina de un lado al otro sin mirarte
  "s": "sombra",   // enemigo que TE PERSIGUE si te acercas
};


/* ============================================================
   MAPA 1 - EL PUEBLO
   ============================================================
   Tranquilo, para aprender a moverse.
   Hay una llave (L) y una puerta (P) que esconde un cofre (C).
   El portal (>) te lleva al bosque.
   ============================================================ */
const MAPAS = {

  pueblo: {
    nombre: "El Pueblo",
    siguiente: "bosque",
    suelo: ".",
    grilla: [
      "##############################",
      "#............................#",
      "#...AA.......,,,......AA.....#",
      "#...AA.......,,,......AA.....#",
      "#.........$..................#",
      "#..@..........--------.......#",
      "#.............-......-.......#",
      "#.....$.......-......-.......#",
      "#.............-.#####-.......#",
      "#.............-.#...#-.......#",
      "#....G........-.#.C.#-.......#",
      "#.............-.#...#-.......#",
      "#.............-.##P##-.......#",
      "#.............--------.......#",
      "#....,,.~~~~~~...............#",
      "#....,,.~~~~~~......AA.......#",
      "#..L....~~~~~~......AA.......#",
      "#.b.................b...>..$.#",
      "#............................#",
      "##############################",
    ],
  },


  /* ==========================================================
     MAPA 2 - EL BOSQUE OSCURO
     ==========================================================
     Aparecen las sombras (s), que te persiguen.
     El portal esta encerrado: SI o SI necesitas la llave.
     ========================================================== */
  bosque: {
    nombre: "El Bosque Oscuro",
    siguiente: "castillo",
    suelo: ".",
    grilla: [
      "##############################",
      "#............................#",
      "#..@.....AAAA.........AAA....#",
      "#........AAAA....$....AAA....#",
      "#...........s................#",
      "##########.##########........#",
      "#....$......G............b...#",
      "#~~~~~~~~~~~~~~-~~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~~-~~~~~~~~~~~~~#",
      "#...V.................s......#",
      "#.....AAA.....AAA.....AAA....#",
      "#.....AAA.....AAA.....AAA....#",
      "#......$.......$.......$.....#",
      "#.........b........b.........#",
      "#................######P######",
      "#.................#..........#",
      "#.................#...>......#",
      "#..L..............#..........#",
      "#.................#..........#",
      "##############################",
    ],
  },


  /* ==========================================================
     MAPA 3 - EL CASTILLO
     ==========================================================
     El ultimo. Adentro esta la META (X): si llegas, ganaste.
     ========================================================== */
  castillo: {
    nombre: "El Castillo",
    siguiente: null,          // null = no hay siguiente, este es el final
    suelo: "-",
    grilla: [
      "##############################",
      "#----------------------------#",
      "#--@-------------------------#",
      "#------L---------------------#",
      "#########-##########-#########",
      "#----s--------$----G----s----#",
      "#----------------------------#",
      "##############P###############",
      "#-------b------------b-------#",
      "#-----####----------####-----#",
      "#-----#C-#----------#V-#-----#",
      "#-----#--#----------#--#-----#",
      "#-----##-#----------#-##-----#",
      "#-------------s--------------#",
      "#########-########-###########",
      "#-----$----------------$-----#",
      "###########--------###########",
      "###########-s----s-###########",
      "###########---X----###########",
      "##############################",
    ],
  },
};


/* ------------------------------------------------------------
   UN CONTROL DE CALIDAD
   ------------------------------------------------------------
   Esto revisa que todas las filas midan lo mismo y que no
   haya letras inventadas. Si algo esta mal, te lo dice en la
   consola del navegador (se abre con F12).

   Programar bien es, en gran parte, esto: dejar avisos para
   vos mismo del futuro, que se va a olvidar de todo.
------------------------------------------------------------ */
function revisarMapas() {
  let problemas = 0;

  for (const clave in MAPAS) {
    const mapa = MAPAS[clave];
    const ancho = mapa.grilla[0].length;

    mapa.grilla.forEach((fila, i) => {
      if (fila.length !== ancho) {
        console.error(
          `MAPA "${clave}": la fila ${i} tiene ${fila.length} letras ` +
          `pero deberia tener ${ancho}.`
        );
        problemas++;
      }

      for (const letra of fila) {
        if (!LEYENDA[letra] && !ENTIDADES[letra]) {
          console.error(`MAPA "${clave}": la letra "${letra}" no existe en la leyenda.`);
          problemas++;
        }
      }
    });
  }

  if (problemas === 0) console.log("Mapas revisados: todo bien!");
  return problemas === 0;
}
