/* ============================================================
   SPRITES = LOS DIBUJOS DEL JUEGO
   ============================================================
   Un SPRITE es un dibujito que se mueve por la pantalla:
   el heroe, una moneda, un enemigo.

   >>> ESTE ES EL ARCHIVO MAS IMPORTANTE PARA VOS, BORBOR <<<

   Aca abajo hay una LISTA. Cada linea dice:

        "nombre que usa el juego"  :  "donde esta el archivo"

   Si el archivo existe -> el juego usa TU dibujo.
   Si el archivo NO existe -> el juego dibuja uno feito con codigo
                              (esos estan en reservas.js)

   O sea: el juego funciona desde el primer dia, aunque no tengas
   ni un dibujo. Y cada vez que agregas un PNG, una parte del juego
   se transforma en tuya. Es como pintar un dibujo por numeros.

   COMO AGREGAR UN DIBUJO:
     1. Haces el dibujo (en papel, o con la IA)
     2. Lo pasas por taller/recortar.html (le saca el fondo)
     3. Lo guardas con EL NOMBRE EXACTO que dice esta lista
     4. F5 en el navegador. Listo.

   Ojo con el nombre: "heroe.png" y "Heroe.PNG" no son lo mismo
   para la computadora. Tiene que ser igualito, todo en minuscula.
   ============================================================ */

const Sprites = {

  /* ---------------------------------------------------------
     LA LISTA DE DIBUJOS QUE EL JUEGO BUSCA
     --------------------------------------------------------- */
  lista: {

    // --- El heroe ---
    // Con SOLO "heroe.png" ya funciona todo.
    // Si despues haces uno para cada direccion, el juego los usa
    // automaticamente y el heroe va a mirar para donde camina.
    "heroe":         "imagenes/personajes/heroe.png",
    "heroe-abajo":   "imagenes/personajes/heroe-abajo.png",
    "heroe-arriba":  "imagenes/personajes/heroe-arriba.png",
    "heroe-izq":     "imagenes/personajes/heroe-izq.png",
    "heroe-der":     "imagenes/personajes/heroe-der.png",

    // --- Chispa, el amigo ---
    "amigo":         "imagenes/personajes/amigo.png",

    // --- Enemigos ---
    "baboso":        "imagenes/enemigos/baboso.png",
    "sombra":        "imagenes/enemigos/sombra.png",

    // --- Objetos que junta el heroe ---
    "moneda":        "imagenes/objetos/moneda.png",
    "llave":         "imagenes/objetos/llave.png",
    "cofre":         "imagenes/objetos/cofre.png",
    "corazon":       "imagenes/objetos/corazon.png",
    "garrote":       "imagenes/objetos/garrote.png",   // <-- el primero que hizo BorBor

    // --- El piso y las paredes ---
    "pasto":         "imagenes/suelo/pasto.png",
    "flores":        "imagenes/suelo/flores.png",
    "camino":        "imagenes/suelo/camino.png",
    "piedra":        "imagenes/suelo/piedra.png",
    "arbol":         "imagenes/suelo/arbol.png",
    "agua":          "imagenes/suelo/agua.png",
    "puerta":        "imagenes/suelo/puerta.png",
    "portal":        "imagenes/suelo/portal.png",
    "meta":          "imagenes/suelo/meta.png",
  },

  /* ---------------------------------------------------------
     LOS CUADROS DE ANIMACION (opcionales)
     ---------------------------------------------------------
     Si ademas del dibujo del heroe haces DOS dibujos casi iguales
     pero con las piernas distintas, el juego los alterna y el
     heroe camina de verdad. Se llaman asi:

         heroe-1.png   <- pie izquierdo adelante
         heroe-2.png   <- pie derecho adelante
         heroe-3.png   <- (si queres uno mas)

     Y si tenes dibujos por direccion, tambien funciona:
         heroe-abajo-1.png, heroe-abajo-2.png, ...

     Estos NO cuentan en el marcador de la portada, porque son
     un extra. El juego anda perfecto sin ellos.
     --------------------------------------------------------- */
  MAX_CUADROS: 4,

  extras: {},

  prepararExtras() {
    const bases = ["heroe", "heroe-abajo", "heroe-arriba", "heroe-izq", "heroe-der"];
    for (const base of bases) {
      for (let i = 1; i <= this.MAX_CUADROS; i++) {
        this.extras[base + "-" + i] = "imagenes/personajes/" + base + "-" + i + ".png";
      }
    }
  },

  // Aca se van guardando los dibujos que SI se encontraron
  imagenes: {},
  faltantes: [],
  total: 0,
  listos: 0,

  /* ---------------------------------------------------------
     CARGAR LOS DIBUJOS
     ---------------------------------------------------------
     Cargar una imagen TARDA (hay que leerla del disco).
     Entonces no podemos dibujarla al toque: hay que esperar.

     Por eso usamos onload / onerror: son "avisame cuando termines".
     Eso en programacion se llama ASINCRONO: pedis algo ahora
     y te contestan mas tarde, mientras el programa sigue vivo.
     --------------------------------------------------------- */
  cargarTodo(cuandoTermine) {
    this.prepararExtras();

    const obligatorios = Object.keys(this.lista);
    const opcionales   = Object.keys(this.extras);
    const todos = obligatorios.concat(opcionales);

    this.total = obligatorios.length;      // el marcador cuenta SOLO los obligatorios

    let respondidos = 0;

    const unoMenos = () => {
      respondidos++;
      if (respondidos === todos.length) cuandoTermine();
    };

    for (const nombre of todos) {
      const esObligatorio = this.lista[nombre] !== undefined;
      const ruta = esObligatorio ? this.lista[nombre] : this.extras[nombre];

      const img = new Image();

      img.onload = () => {                 // el dibujo EXISTE
        this.imagenes[nombre] = img;
        if (esObligatorio) this.listos++;
        unoMenos();
      };

      img.onerror = () => {                // el dibujo NO existe todavia
        if (esObligatorio) this.faltantes.push(nombre);
        unoMenos();
      };

      img.src = ruta;                      // esto dispara la carga
    }

    if (todos.length === 0) cuandoTermine();
  },

  // Devuelve el dibujo, o null si todavia no lo hiciste
  obtener(nombre) {
    return this.imagenes[nombre] || null;
  },

  /* Junta todos los cuadros de animacion que existan para un nombre.
     Si hiciste heroe-1.png y heroe-2.png, devuelve los dos.
     Si no hiciste ninguno, devuelve una lista vacia. */
  cuadros(base) {
    const encontrados = [];
    for (let i = 1; i <= this.MAX_CUADROS; i++) {
      const img = this.imagenes[base + "-" + i];
      if (img) encontrados.push(img);
    }
    return encontrados;
  },

  /* Busca el PRIMERO de la lista que exista.
     Sirve para el heroe: primero busca "heroe-izq",
     y si no lo hiciste todavia, usa "heroe" a secas. */
  primero(nombres) {
    for (const n of nombres) {
      if (this.imagenes[n]) return this.imagenes[n];
    }
    return null;
  },
};
