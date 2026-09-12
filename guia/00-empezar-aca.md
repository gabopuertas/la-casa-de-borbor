# Empezá acá

Hola BorBor. Este es tu juego.

Todavía no está terminado — está esperando que vos lo termines.

---

## Paso 1: jugalo

Andá a la carpeta del proyecto y hacé **doble clic en `index.html`**.
Se abre en el navegador. Listo, no hay que instalar nada.

- **Flechas** o **WASD** → caminar
- **Espacio** → empezar
- **P** → pausa
- **R** → volver a empezar

Jugalo hasta ganar. Fijate cuántas monedas podés juntar.

---

## Paso 2: mirá bien la pantalla de inicio

Abajo dice algo así:

```
Tus dibujos en el juego: 2 de 22
```

**Ese es el marcador de verdad.**

Todo lo que ves ahora mismo — el héroe, las monedas, los árboles — no son dibujos.
Son formas que la computadora arma con código: "hacé un círculo acá, pintalo de verde".
Son de relleno, hasta que lleguen los tuyos.

Ya hay **2**: el **robot amarillo** (que sos vos) y el **garrote**, los dos hechos por vos.
Y falta uno nuevo: **Chispa**, tu amigo robot. Andá a buscarlo en el mapa —
está a la izquierda, un poco más abajo de donde empezás. Agarralo y tocá a un baboso.

Tu misión es llegar a **22 de 22**. Cuando llegues, el juego va a ser tuyo entero.

---

## Paso 3: cambiá UNA cosa

Esto es lo más importante de todo el proyecto. Hacelo ahora:

1. Abrí el archivo `js/config.js` (con el Bloc de notas, TextEdit, o VS Code)
2. Buscá esta línea:

```js
VELOCIDAD_JUGADOR: 2.2,
```

3. Cambiá el `2.2` por un `8`
4. Guardá (Ctrl+S / Cmd+S)
5. Volvé al navegador y apretá **F5**

El héroe ahora es un cohete.

**Acabás de programar.** En serio. No es una metáfora: cambiaste el comportamiento
de un programa modificando su código. Eso es programar.

Ahora probá con `0.4`. Y después volvelo a `2.2`.

---

## Paso 4: rompé el juego a propósito

Ahora la parte más divertida, y la que más se aprende.

En `js/config.js` probá estas, de a una:

```js
TAMANIO_HEROE: 50,          // un robot gigante
VIDAS_INICIALES: 99,        // inmortal
VELOCIDAD_SOMBRA: 5,        // corré por tu vida
VISTA_SOMBRA: 30,           // te ven desde el otro lado del mapa
MONEDAS_DEL_COFRE: 1000,    // rico
MOSTRAR_CAJAS: true,        // ¡mirá esto!
MOSTRAR_FALTANTES: false,   // saca los carteles amarillos
```

Ese último es mágico: te muestra las **cajas invisibles**.
Vas a ver que el juego no ve dibujos — ve rectángulos.
El héroe, para el juego, es un rectángulo. El dibujo es solo la ropa que lleva puesta.

Por eso vas a poder poner *tus* dibujos sin romper nada.

Cuando termines de jugar con eso, volvelo a `false`.

> Los **carteles amarillos** que dicen `heroe.png`, `moneda.png` debajo de las cosas
> no son un error: son la lista de tareas. Te marcan qué dibujo todavía falta.
> Van a ir desapareciendo solos a medida que los hagas.

> **¿Y si rompo algo?** No pasa nada. No hay forma de romper la computadora desde acá.
> Si el juego deja de andar, apretá **F12** en el navegador: se abre la **consola**,
> y ahí te dice en rojo qué línea está mal. Los programadores viven mirando esa pantalla.

---

## ¿Y ahora?

Seguí en orden:

| Guía | De qué va |
|---|---|
| `01-como-funciona-un-videojuego.md` | El secreto: son 60 fotos por segundo |
| `02-las-partes-del-juego.md` | Qué hace cada archivo |
| `03-tus-dibujos.md` | Meter tus dibujos adentro del juego |
| `04-hacer-mapas.md` | Inventar tus propios mapas con letras |
| `06-animacion.md` | **Cómo hacer que el héroe camine de verdad** |
| `07-el-amigo.md` | **Cómo funciona la IA de Chispa** |
| `08-celulares.md` | Cómo se juega en un celular o tablet |
| `05-misiones.md` | 12 desafíos, de fácil a difícil |
| `glosario.md` | Las palabras raras, explicadas |
