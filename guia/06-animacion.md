# Cómo hacer que el héroe camine

Sí, se puede. Y hay **dos formas distintas** de lograrlo.
Las dos ya están puestas en el juego. Una funciona ahora mismo con el dibujo
que hiciste, y la otra es la "de verdad" para cuando quieras dibujar más.

---

## Primero: qué es una animación

Una animación no es un dibujo que se mueve. **Es una serie de dibujos quietos
que se turnan rápido.**

Los dibujitos animados de la tele son eso: alguien dibujó miles de hojas casi
iguales y las pasan a 24 por segundo. Tu ojo las une y ve movimiento.

En los videojuegos cada uno de esos dibujos se llama **cuadro** (o *frame*).

---

# Forma 1 — Mover el dibujo con matemática ✨

**Esta ya está funcionando.** No tuviste que dibujar nada nuevo.

El robot es UN dibujo quieto. Lo que hace el juego es agarrarlo y, mientras
caminás, moverlo un poquito de tres maneras al mismo tiempo:

| Movimiento | Qué hace | Perilla en `config.js` |
|---|---|---|
| 🔼 **Rebote** | sube y baja, un rebote por cada pie | `REBOTE_AL_CAMINAR` |
| ↔️ **Balanceo** | se inclina a un lado y al otro | `BALANCEO_AL_CAMINAR` |
| ⬇️ **Aplaste** | se achata al pisar | `APLASTE_AL_CAMINAR` |
| ⚫ **Sombra** | la manchita del piso | `SOMBRA` |
| 📏 **Tamaño** | qué tan grande se dibuja | `TAMANIO_HEROE` |

> `TAMANIO_HEROE` cambia **solo el dibujo**. La caja invisible con la que el
> héroe choca contra las paredes sigue midiendo lo mismo. Poné `60` y
> `MOSTRAR_CAJAS: true` al mismo tiempo: vas a ver un robot enorme con una
> cajita chiquita adentro. Dibujo y lógica, separados.

### Probá esto ahora

Andá a `js/config.js` y poné:

```js
REBOTE_AL_CAMINAR: 14,
BALANCEO_AL_CAMINAR: 45,
```

F5 y caminá. El robot se vuelve loco 🤪. Ahora poné todo en `0`:

```js
REBOTE_AL_CAMINAR: 0,
BALANCEO_AL_CAMINAR: 0,
APLASTE_AL_CAMINAR: 0,
SOMBRA: false,
```

Caminá. **Parece una calcomanía arrastrada por la pantalla.** Muerto.

Volvé a los valores originales (`2.5`, `6`, `0.07`, `true`) y fijate la diferencia.
Cuatro numeritos son toda la diferencia entre "una figurita" y "un personaje".

### Cómo funciona por dentro

Todo sale de **un solo número**, que en `js/jugador.js` se llama `paso`.
Sube mientras caminás y vuelve a 0 cuando parás.

```js
rebote      = -Math.abs(Math.sin(paso))   // siempre para arriba
inclinacion =  Math.sin(paso)             // para un lado y para el otro
```

Fijate lo lindo de esto: es **la misma función** `sin()`, con el **mismo número**.
La única diferencia es el `Math.abs()`, que le saca el signo.

- `sin()` va de **-1 a 1** → sirve para cosas que van y vienen (inclinarse)
- `abs(sin())` va de **0 a 1** y toca el cero **dos veces** por vuelta →
  una por cada pie. Perfecto para rebotar al caminar.

Y por eso los dos movimientos quedan sincronizados solos: el momento en que
más se inclina es exactamente cuando el pie está en el aire.

> **El seno y el coseno** los vas a ver en la escuela dentro de unos años,
> con triángulos. Acá los estás usando para otra cosa: **cualquier cosa que
> vaya y vuelva**. Olas, latidos, un péndulo, una moneda girando, un personaje
> caminando. Si algo se repite, ahí hay un seno escondido.

### El detalle más importante: la sombra no se mueve

La sombra se dibuja **antes** que el robot, y se queda **pegada al piso**
mientras el robot rebota para arriba.

Si la sombra subiera con él, el robot parecería que flota.
Como se queda abajo, parece que **da pasos**.

Es el detalle más chiquito de todos y el que más se nota. En `js/jugador.js`
está comentado exactamente dónde pasa.

---

# Forma 2 — Dibujar los cuadros vos 🎨

Esta es la animación de verdad, y queda mejor todavía. Y ya está lista:
solo faltan los dibujos.

### Qué hay que hacer

Dibujá **el mismo robot dos veces**, cambiando solo las piernas:

```
   heroe-1.png              heroe-2.png
   pie izquierdo            pie derecho
     adelante                 adelante

       ___                      ___
      |o o|                    |o o|
       |||                      |||
      / | \                    / | \
     /  |  \                  /  |  \
    /   |   \                /   |   \
   ⌐    |    ¬              ¬    |    ⌐
```

Guardalos en `imagenes/personajes/` con **esos nombres exactos**.
F5 y ya camina. **No hay que tocar ni una línea de código.**

El juego los busca solo: si los encuentra, los alterna mientras caminás;
si no, usa `heroe.png` de siempre. (Está en `js/sprites.js`, función `cuadros`.)

### Dos consejos de oro

**1. Copiá y modificá, no dibujes de nuevo.**
Abrí tu dibujo original, duplicalo, y cambiale SOLO las piernas.
Si redibujás todo de cero, el robot va a "temblar" porque la cabeza
te va a quedar un pixel corrida en cada cuadro.

Si lo hacés con IA, pedile:
> *Exactamente el mismo robot amarillo, misma pose y mismo tamaño,
> pero con la pierna izquierda adelante y la derecha atrás.*

**2. Con 2 cuadros alcanza.** En serio.
Muchos juegos clásicos de Nintendo usaban 2 o 3 nada más.
Podés hacer hasta 4 (`heroe-3.png`, `heroe-4.png`) si querés.

### Y también por dirección

Si algún día hacés los dibujos mirando para cada lado, también podés animarlos:

```
heroe-abajo-1.png    heroe-abajo-2.png
heroe-arriba-1.png   heroe-arriba-2.png
heroe-izq-1.png      heroe-izq-2.png
heroe-der-1.png      heroe-der-2.png
```

El juego busca primero los de la dirección, y si no están, usa los generales.

> Estos cuadros **no cuentan** en el marcador de la portada (`3 de 22`).
> Son un extra: el juego anda perfecto sin ellos.

---

## Las dos formas juntas

No hay que elegir. **Se suman.**

Aunque dibujes los 2 cuadros, el rebote y el balanceo se siguen aplicando
encima. Eso es lo que hacen los juegos buenos: dibujos + matemática.

---

## Para pensar

Cuando termines de dibujar los cuadros, poné `MOSTRAR_CAJAS: true` y caminá.

Vas a ver que **la caja verde no rebota ni se inclina**. Se queda derechita
y va a velocidad constante.

Eso es porque toda esta animación es **puro maquillaje**: el juego, por dentro,
sigue moviendo un rectángulo aburrido. Al jugador le importa lo que ve;
a la computadora le importa el rectángulo.

Entender esa separación es, posiblemente, la idea más importante de todo
este proyecto.
