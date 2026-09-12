# Las partes del juego

## Por qué no está todo en un archivo solo

Podríamos haber puesto las 1.200 líneas del juego en un archivo gigante.
Funcionaría igual.

Pero hacer eso es como tener **una sola caja** con la ropa, los juguetes,
los cubiertos y los útiles del colegio todo mezclado. Entra todo, sí.
Buscar algo se vuelve imposible.

Entonces partimos el juego en archivos, y cada archivo tiene **un solo trabajo**.
Eso se llama **separar responsabilidades**, y es de las ideas más importantes
de toda la programación.

La prueba de que está bien hecho es esta:

> Si querés cambiar los ruiditos, tocás **un solo archivo** y no te podés
> llevar puesto el resto del juego.

---

## El mapa del proyecto

```
video games BorBor/
│
├── index.html          ← el ESQUELETO. Doble clic acá para jugar.
├── css/
│   └── estilo.css      ← la ROPA de la página (colores, tamaños)
│
├── js/                 ← el CEREBRO
│   ├── config.js       ← 🔧 los números que podés cambiar
│   ├── sonidos.js      ← 🔊 fabrica los ruiditos
│   ├── teclado.js      ← ⌨️  escucha las teclas
│   ├── sprites.js      ← 🖼️  carga TUS dibujos
│   ├── reservas.js     ← ✏️  dibujos de emergencia hechos con código
│   ├── dibujante.js    ← 🎨 pinta en la pantalla + la cámara
│   ├── mapas.js        ← 🗺️  los mapas, escritos con letras
│   ├── mundo.js        ← 🧱 arma el mapa y sabe dónde hay paredes
│   ├── jugador.js      ← 🧍 vos
│   ├── enemigos.js     ← 👾 los malos
│   ├── objetos.js      ← 💰 monedas, llaves, cofres
│   ├── hud.js          ← ❤️  los corazones y números de arriba
│   └── main.js         ← 🎬 el director: ordena a todos los demás
│
├── imagenes/           ← 👉 ACÁ VAN TUS DIBUJOS
│   ├── personajes/
│   ├── enemigos/
│   ├── objetos/
│   └── suelo/
│
├── taller/
│   ├── recortar.html   ← la herramienta para hacer sprites
│   └── prompts-ia.md   ← cómo pedirle dibujos a la IA
│
└── guia/               ← estas explicaciones
```

---

## Qué hace cada uno, en una frase

| Archivo | Su único trabajo | Analogía |
|---|---|---|
| `config.js` | Guardar los números importantes | El tablero de perillas |
| `sonidos.js` | Hacer ruido | El músico |
| `teclado.js` | Saber qué teclas hay apretadas | Las orejas |
| `sprites.js` | Buscar tus PNG y avisar cuáles hay | El bibliotecario |
| `reservas.js` | Dibujar con código lo que falta | El suplente |
| `dibujante.js` | Pintar cosas y mover la cámara | El camarógrafo |
| `mapas.js` | Guardar los mapas escritos con letras | El libro de mapas |
| `mundo.js` | Traducir las letras a un mapa jugable | El albañil |
| `jugador.js` | Todo lo del héroe | El actor principal |
| `enemigos.js` | Todo lo de los malos | Los villanos |
| `objetos.js` | Todo lo que se junta | El tesorero |
| `hud.js` | Los datos en pantalla | El tablero del auto |
| `main.js` | Decirle a todos cuándo actuar | El director |

---

## El orden de los `<script>` importa

Abrí `index.html` y mirá el final. Hay 13 líneas `<script>`, una abajo de la otra.

**El orden no es decorativo.** La computadora lee de arriba hacia abajo,
como un libro. No podés usar algo que todavía no explicaste.

`main.js` va **último** porque usa a todos los demás. Si lo pusieras primero,
al arrancar buscaría a `Jugador` y encontraría… nada. Error.

Es igual que una receta: no podés decir "batí la mezcla" antes de decir cuál mezcla.

---

## El orden de DIBUJADO también importa

Andá a `main.js`, función `dibujarTodo()`. Fijate el orden:

```
   1. el piso
   2. los objetos
   3. los enemigos
   4. el héroe
   5. el HUD (los corazones)
```

Dibujar es como **pegar calcomanías**: la última que pegás tapa a las de abajo.

- Si dibujaras el piso **después** del héroe, el pasto le taparía la cabeza.
- Si dibujaras los corazones **antes** que el mundo, quedarían enterrados.

Probá cambiarlo de orden a propósito y mirá el desastre. Se aprende muchísimo
rompiendo cosas con intención.

---

## La cámara: la idea más difícil de este juego

Nuestros mapas son de **30 × 20 casillas** = 960 × 640 píxeles.
Pero la pantalla es de **640 × 480**.

O sea: **el mapa no entra en la pantalla.** Nunca ves el mapa entero.

Entonces hay dos mundos de números distintos:

- **Coordenadas del mundo**: dónde están las cosas de verdad en el mapa.
  El cofre está en `x = 800`.
- **Coordenadas de la pantalla**: dónde se ven en la tele.
  La pantalla llega solo hasta `640`.

La **cámara** es la que traduce uno en otro. Es igual que filmar una película:
los actores están en el set (el mundo), y la cámara elige qué pedacito se ve.

Y acá está el truco mental que cuesta entender:

> Cuando el héroe camina a la derecha, **el héroe no se mueve en la pantalla**.
> El héroe queda en el medio y **el mundo entero se corre para la izquierda**.

Es como cuando vas en el auto: vos sentís que los árboles pasan para atrás.

En el código eso es una sola línea, en `dibujante.js`:

```js
this.ctx.translate(-Camara.x, -Camara.y);
```

"Corré todo lo que voy a dibujar, tanto para allá." Una línea, y ya tenés cámara.

Y el HUD (los corazones) se dibuja **después** de apagar la cámara.
Por eso se quedan quietos en la esquina aunque camines por todo el mapa.
