# Hacer tus propios mapas

## Los mapas se dibujan con letras

Abrí `js/mapas.js`. Vas a ver esto:

```js
"##############################",
"#............................#",
"#...AA.......,,,......AA.....#",
```

**Eso es el mapa.** No hay ningún programa raro, ningún editor.
Son letras, como en una hoja cuadriculada.

Cada letra = **una casilla de 32 × 32 píxeles** en el juego.

Esto se llama un **mapa de baldosas** (*tile map*), y es como estaban hechos
casi todos los juegos de Nintendo y Sega. Zelda, Pokémon, Mario: todos así.

---

## La leyenda

### El terreno (por dónde se camina)

| Letra | Qué es | ¿Se puede pasar? |
|:---:|---|:---:|
| `.` | pasto | ✅ sí |
| `,` | flores | ✅ sí |
| `-` | camino de tierra | ✅ sí |
| `#` | pared de piedra | ❌ no |
| `A` | árbol | ❌ no |
| `~` | agua | ❌ no |
| `P` | puerta cerrada | 🔑 solo con llave |
| `>` | portal al mapa siguiente | ✅ sí |
| `X` | la META (ganaste) | ✅ sí |

### Las cosas (van *encima* del piso)

| Letra | Qué es |
|:---:|---|
| `@` | dónde empieza el héroe (**tiene que haber exactamente uno**) |
| `$` | moneda |
| `L` | llave |
| `C` | cofre (da 10 monedas) |
| `V` | corazón (+1 vida) |
| `G` | garrote (te deja romper 3 enemigos) |
| `b` | baboso (enemigo lento) |
| `s` | sombra (enemigo que te persigue) |

---

## LA REGLA DE ORO

> **Todas las filas tienen que tener EXACTAMENTE la misma cantidad de letras.**

Si una fila tiene 29 letras y las otras 30, el mapa se desarma
y las paredes aparecen corridas.

La buena noticia: **el juego te avisa**. Apretá `F12` en el navegador y mirá la consola.
Si algo está mal, dice en rojo:

```
MAPA "bosque": la fila 7 tiene 29 letras pero debería tener 30.
```

---

## Plantilla en blanco (30 × 20)

Copiá esto y empezá a rellenar. Ya tiene los bordes y el `@`:

```js
  miMapa: {
    nombre: "Mi Primer Mapa",
    siguiente: "bosque",       // a dónde lleva el portal. null si es el último.
    suelo: ".",                // qué queda cuando sacamos una moneda de ahí
    grilla: [
      "##############################",
      "#............................#",
      "#..@.........................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#............................#",
      "#.......................>....#",
      "#............................#",
      "##############################",
    ],
  },
```

Pegalo adentro de `const MAPAS = { ... }`, **antes** de la llave `}` final,
y acordate de la **coma** al final. En `js/config.js` poné:

```js
MAPA_INICIAL: "miMapa",
```

y F5. Ya estás jugando tu mapa.

---

## Cómo diseñar un mapa que sea divertido

Un mapa no es un dibujo lindo. Es un **problema** que el jugador tiene que resolver.

### 1. Nunca hagas un cuadrado vacío

Un campo abierto es aburrido: vas del punto A al B en línea recta y ya.
Poné árboles, paredes, agua. **Obligá a decidir** por dónde ir.

### 2. Mostrá el premio antes de dejarlo agarrar

Poné el cofre donde se vea desde lejos, pero con una pared en el medio.
Cuando el jugador *ve* algo que quiere, se pone a pensar cómo llegar.
Eso es diversión. Un tesoro escondido que nadie sabe que existe no genera nada.

### 3. La llave siempre en el lado difícil

Si la llave está al lado de la puerta, la puerta no existe.
Poné la llave lejos, o pasando a un enemigo.

### 4. Alterná tensión y descanso

Zona con enemigos → zona tranquila con un corazón → zona con enemigos.
Si todo el mapa es peligroso, el jugador se agota. Si nada lo es, se aburre.

### 5. Los enemigos son paredes que se mueven

Un baboso caminando en un pasillo angosto es mucho más interesante que
uno en el medio de un campo. **Pensalos como parte del terreno.**

### 6. Probalo vos, y cronometrá

Si tu mapa se termina en 10 segundos, es muy chico.
Si tardás 5 minutos y te aburrís, es muy grande.
Entre **30 segundos y 2 minutos** está bien.

---

## Trucos

**Empezá en papel cuadriculado.** En serio. Dibujá la grilla a mano,
poné las paredes, y recién después pasalo a letras. Es mucho más rápido.

**Los mapas pueden ser de cualquier tamaño**, no tienen que ser 30 × 20.
Probá uno largo y finito (`50 × 12`), como un pasillo: la cámara lo sigue sola.

**Podés encadenar todos los mapas que quieras.**
`pueblo → bosque → castillo → cueva → volcán → ...`
Cada uno apunta al siguiente con `siguiente:` y se conectan con `>`.

**El último mapa** lleva `siguiente: null` y tiene que tener la `X`.
