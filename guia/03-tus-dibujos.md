# Meter tus dibujos en el juego

Esta es la parte que pediste. Vamos.

---

## La idea en una frase

El juego tiene una **lista de 22 dibujos** que anda buscando.
Si encuentra el archivo, usa el tuyo. Si no lo encuentra, dibuja uno feito con código.

O sea: **el juego nunca se rompe por un dibujo que falta.**
Vos vas completando de a uno, y de a uno el juego se va volviendo tuyo.

---

## Los 22 dibujos que el juego está esperando

Los nombres tienen que ser **exactos**. Para la computadora, `heroe.png`,
`Heroe.png` y `heroe.PNG` son tres archivos distintos. Todo en minúscula, sin acentos.

### 🧍 Personajes → `imagenes/personajes/`

| Archivo | Qué es |
|---|---|
| `heroe.png` | ✅ **Ya está** — el robot amarillo. |
| `heroe-abajo.png` | de frente (mirando a la cámara) |
| `heroe-arriba.png` | de espaldas |
| `heroe-izq.png` | mirando a la izquierda |
| `heroe-der.png` | mirando a la derecha |

> Los 4 últimos son opcionales. Si los hacés, el héroe **gira la cabeza**
> según para dónde camina, y el juego pega un salto de calidad enorme.
> Si no están, usa `heroe.png` para todo y no pasa nada.

### 👾 Enemigos → `imagenes/enemigos/`

| Archivo | Qué es |
|---|---|
| `baboso.png` | el lento, que camina de un lado al otro |
| `sombra.png` | el que te persigue |

### 💰 Objetos → `imagenes/objetos/`

`moneda.png` · `llave.png` · `cofre.png` · `corazon.png` · `garrote.png` ✅

Y en `imagenes/personajes/`: `amigo.png` — Chispa, el robot que te acompaña.

### 🧱 Piso y paredes → `imagenes/suelo/`

`pasto.png` · `flores.png` · `camino.png` · `piedra.png` · `arbol.png` · `agua.png` · `puerta.png` · `portal.png` · `meta.png`

---

## Cómo hacer uno (5 minutos)

### Si lo dibujás en papel 📝

1. **Hoja blanca**, marcador negro grueso para el contorno.
2. Pintalo con colores **fuertes**. Los colores flojos desaparecen cuando la imagen es chiquita.
3. Sacale una foto **con buena luz** y **de frente** (no en diagonal).
4. Que **no haya sombra** de tu mano ni del celular encima del papel.
5. Dibujalo **vista desde arriba**, como si lo miraras desde un dron.

> **El error más común:** dibujar al héroe parado de frente, como en un retrato.
> En un juego visto desde arriba eso queda como si estuviera acostado en el piso.
> Pensá "lo estoy viendo desde el techo".

### Si lo hacés con IA 🤖

Está todo explicado en `taller/prompts-ia.md`.
Resumen: pedí siempre **vista desde arriba**, **fondo blanco liso**,
**contorno negro grueso**, **un solo objeto**, **sin sombra**.

---

## El taller: sacarle el fondo

Abrí **`taller/recortar.html`** (doble clic).

1. **Traé la imagen**: arrastrala, o pegala con `Ctrl+V`, o usá el botón.
2. Apretá **"Sacar el fondo solo"**. El taller toca las 4 esquinas
   con la varita y casi siempre acierta.
3. ¿Quedaron restos? Pasá la **goma**.
   ¿Borró de más (le comió la cara al héroe)? **Deshacer**, bajá la **tolerancia**, probá otra vez.
4. **"Ajustar bordes"**: recorta el aire vacío que sobra alrededor.
5. Elegí **para qué es** en el menú (te dice en qué carpeta va).
6. **Guardar el PNG**.
7. Mové el archivo a su carpeta.
8. **F5** en el juego. 🎉

---

## Por qué PNG y no JPG

Esto es importante y mucha gente grande tampoco lo sabe.

Cada píxel de una imagen guarda **4 números**:

```
   R = 255   ← cuánto rojo    (0 a 255)
   G =  80   ← cuánto verde
   B =  80   ← cuánto azul
   A = 255   ← ALFA: cuánto se VE  (0 = invisible, 255 = opaco)
```

Los tres primeros arman el color. El cuarto, el **alfa**, es la transparencia.

Cuando "sacás el fondo", el taller **no borra nada**: le pone `A = 0` a esos píxeles.
Siguen ahí, pero invisibles.

**El JPG no tiene el cuarto número.** No sabe guardar transparencia.
Si guardás tu héroe en JPG, va a caminar con un cuadrado blanco alrededor,
como una estampilla.

👉 **PNG siempre.**

---

## ¿Qué tamaño conviene?

El juego muestra todo en casillas de **32 × 32** píxeles.

Pero conviene dibujar en **64 × 64** y dejar que el juego lo achique:

- Si lo hacés en 32 y algún día querés una pantalla más grande → se ve borroso y no hay vuelta atrás.
- Si lo hacés en 64 y lo mostrás en 32 → se ve perfecto, y te queda margen para el futuro.

**Es más fácil achicar que agrandar.** Vale para las imágenes y para casi todo.

---

## Un detalle lindo: el pasto tiene que ser "tileable"

El pasto se dibuja unas **400 veces por mapa**, uno pegado al lado del otro.

Si tu `pasto.png` tiene una manchita en el medio, vas a ver 400 manchitas
formando una grilla perfecta. Queda espantoso y se nota muchísimo.

Un dibujo que se puede repetir sin que se note el borde se llama **tileable**
(de *tile*, "baldosa"). Igual que las baldosas del baño: están diseñadas para
que no se note dónde termina una y empieza la otra.

Consejo: para el piso, colores parejos y detalles chiquitos y repartidos.
Nada grande ni muy centrado.

---

## Truco: probar rápido sin hacer todo

¿Querés ver cómo queda TU héroe ya mismo, sin dibujar los otros 19?

Hacé **solo `heroe.png`**. Es el que más se ve y el que más cambia el juego.

Después, cuando quieras seguir, la pantalla de inicio te va llevando el marcador:

```
Tus dibujos en el juego: 2 de 22
```
