# Cómo funciona un videojuego (el secreto)

## Los videojuegos no se mueven

Esto suena mentira, pero es así:

**En un videojuego no se mueve absolutamente nada.**

Lo que pasa es que la computadora dibuja una foto completa, la borra entera,
y dibuja otra foto casi igual pero con el héroe un poquito más a la derecha.
Y otra. Y otra. **60 veces por segundo.**

Tu cerebro no puede ver tan rápido, así que se rinde y te dice "se está moviendo".
Es exactamente el mismo truco de los dibujitos animados y del cine.

- El cine hace 24 fotos por segundo.
- Los videojuegos hacen 60.
- Cada foto se llama **cuadro** (o *frame*, en inglés).

Cuando alguien dice "me va a 15 FPS", quiere decir 15 fotos por segundo: se ve a los saltos.

---

## El bucle: las 4 cosas que pasan en cada foto

En cada uno de esos 60 cuadros por segundo, el juego hace siempre lo mismo, en este orden:

```
   ┌─────────────────────────────────────┐
   │                                     │
   │   1. LEER    ¿qué teclas hay        │
   │              apretadas?             │
   │                                     │
   │   2. PENSAR  mover todo,            │
   │              revisar choques,       │
   │              sumar puntos           │
   │                                     │
   │   3. DIBUJAR pintar la foto nueva   │
   │                                     │
   │   4. REPETIR ────────────────┐      │
   │                              │      │
   └──────────────────────────────┼──────┘
                                  │
              (60 veces por segundo, para siempre)
```

Esto se llama el **bucle del juego** (*game loop*), y es **igual en todos los juegos
del mundo**. El Pong de 1972 y el Fortnite de hoy hacen exactamente esto.
Lo único que cambia es cuántas cosas entran en el paso 2 y el 3.

En nuestro juego, el bucle está en `js/main.js`, en la función `cuadro()`.
Andá a mirarla ahora que sabés qué estás mirando.

---

## Por qué el orden importa tanto

Fijate qué pasaría si cambiáramos el orden:

- Si **dibujáramos antes de pensar**, verías siempre la foto vieja: el juego iría
  un cuadro atrasado y se sentiría "pegajoso".
- Si **revisáramos los choques antes de mover**, el héroe atravesaría las paredes,
  porque revisaríamos dónde estaba, no dónde está.

En programación, el orden no es un detalle. **El orden es la mitad del programa.**

---

## El problema de las computadoras rápidas y lentas

Acá hay algo que casi nadie sabe y es muy lindo.

Imaginate que escribís: "en cada cuadro, el héroe avanza 2 píxeles".

- En una compu rápida que hace 60 cuadros por segundo → avanza 120 píxeles por segundo.
- En una compu lenta que hace 30 cuadros por segundo → avanza 60 píxeles por segundo.

**¡El mismo juego se juega a la mitad de velocidad!** Eso es un desastre.

La solución se llama **delta time** (`dt` en el código). En vez de decir
"avanzá 2 píxeles", decís:

> "avanzá 2 píxeles **por cada cuadro de tiempo que haya pasado**"

Si la compu se trabó y pasó el doble de tiempo, `dt` vale 2, y el héroe avanza 4 píxeles
en ese cuadro. Se mueve a saltitos, pero **llega al mismo lugar en el mismo tiempo**.

Buscá en `js/main.js` la línea que dice `const dt =`. Esa línea sola es la diferencia
entre un juego bien hecho y uno mal hecho.

---

## Lo que la computadora ve

Esto ya lo viste si pusiste `MOSTRAR_CAJAS: true`.

La computadora **no ve dibujos**. Ve números:

```js
Jugador = {
  x: 128,          // a qué distancia del borde izquierdo
  y: 96,           // a qué distancia del borde de arriba
  w: 20,           // cuánto mide de ancho
  h: 24,           // cuánto mide de alto
  vidas: 3,
}
```

Eso es TODO lo que el héroe es, para el juego. Cuatro números y un poco más.

El dibujo bonito se pega encima al final, en el paso 3 (DIBUJAR),
y al juego le da exactamente igual cuál sea.

**Y por eso vos vas a poder meter tus dibujos sin romper nada.**

---

## Una cosa rara: la Y está al revés

En la escuela te enseñan que el eje Y va para arriba. En las computadoras **va para abajo**.

```
    x=0                          x=640
 y=0 ┌────────────────────────────────┐
     │  ← acá está el (0,0)           │
     │                                │
     │         y más grande           │
     │              =                 │
     │          más ABAJO             │
     │              ↓                 │
y=480└────────────────────────────────┘
```

¿Por qué? Porque las pantallas viejas dibujaban como se lee un libro: empezando arriba
a la izquierda, línea por línea hacia abajo. Quedó así para siempre.

Acordate de esto: **para que algo suba, hay que RESTARLE a la Y.**
Te vas a equivocar como diez veces. A todos nos pasa.
