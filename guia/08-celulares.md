# Jugar en el celular

El juego se hizo pensando en un teclado. Y de golpe hizo falta que anduviera
en un celular, donde no hay teclado.

Este es **el problema más común de toda la programación**: algo ya funciona,
y hay que agregarle algo nuevo sin romperlo.

---

## La tentación (y por qué está mal)

Lo primero que uno piensa es: *"voy a ir archivo por archivo agregando
el caso del celular"*.

```js
// en jugador.js
if (Teclado.derecha() || Tactil.derecha()) mx += 1;

// en main.js
if (Teclado.recienApretada("p") || Tactil.tocaronPausa()) pausa();
```

Eso funcionaría... y sería un desastre:

- Habría que tocar **5 o 6 archivos** que hoy andan perfecto.
- Cada uno de esos archivos pasaría a saber de celulares, cuando **no
  tiene por qué**. `jugador.js` tiene que saber de caminar, no de dedos.
- El día que agregues un joystick de verdad, o un control de PlayStation,
  **hay que volver a tocar todo**: `|| Joystick.derecha() || Control.derecha()`…

---

## La solución: un traductor

Mirá `js/tactil.js`. Hace una sola cosa, y es esta:

```js
fingirTecla(tecla, apretada) {
  if (apretada && !Teclado.activas[tecla]) Teclado.nuevas[tecla] = true;
  Teclado.activas[tecla] = apretada;
}
```

Cuando movés la palanca a la derecha, `tactil.js` **anota que está apretada la
flecha derecha**, en la misma listita donde lo anota el teclado de verdad.

Y entonces el resto del juego sigue preguntando exactamente lo mismo de siempre:

```js
Teclado.derecha()   →   true
```

**No se cambió ni una línea** de `jugador.js`, `enemigos.js`, `main.js` ni de
Chispa. Ninguno de ellos sabe que existe una pantalla táctil. Y no les hace falta.

> Esto se llama **patrón adaptador**: una pieza que traduce algo nuevo al idioma
> que el sistema ya hablaba.
>
> Es lo mismo que un adaptador de enchufe cuando viajás: no le cambiás la
> instalación eléctrica a la casa, ni le cambiás el cable al cargador.
> Ponés una piecita en el medio que traduce.

Y fijate que es **la misma idea** que `js/amigo/cerebro.js`, el enchufe de Chispa.
Cuando dos partes se hablan por un contrato claro, podés cambiar cualquiera de
las dos sin tocar la otra. Esa idea vale más que cualquier truco de programación.

---

## El juego cambia de forma

Hay otro problema, y es de forma.

El juego es de **640 × 480**: apaisado, como una tele.
Un celular agarrado normal es al revés: **alto y angosto**.

```
   celular parado          si metés una tele apaisada ahí:
   ┌──────────┐            ┌──────────┐
   │          │            │          │   ← vacío
   │          │            ├──────────┤
   │          │            │ el juego │   ← una franjita
   │          │            ├──────────┤
   │          │            │          │   ← vacío
   └──────────┘            └──────────┘
```

Se veía diminuto. Entonces el juego **se da vuelta**: en un celular parado
usa **480 × 640**.

Está en `js/main.js`, función `acomodarPantalla()`:

```js
const parado = window.innerHeight > window.innerWidth * 1.15;
if (parado) { CONFIG.ANCHO = 480; CONFIG.ALTO = 640; }
```

Y acá está lo importante que hay que entender:

> **El mundo no cambió. El mapa no cambió. Cambió la ventanita
> por la que lo mirás.**

La cámara muestra un pedazo más angosto y más alto del mapa. Es como mover
una cámara de cine: la escena filmada es la misma.

Si girás el teléfono, se reacomoda solo.

### Y por eso la portada usa fracciones

Antes el título estaba en `y = 120`. Con la pantalla dada vuelta,
**120 deja de estar en el mismo lugar**: en una pantalla de 640 de alto,
120 está muy arriba y queda todo amontonado.

Ahora dice:

```js
const alto = (fraccion) => CONFIG.ALTO * fraccion;
...
Dibujante.textoConSombra(arriba, cx, alto(0.25), 26, "#e8e8f0");
```

El **25%** sigue siendo el 25% mida lo que mida la pantalla.
Es la misma idea que usan las páginas web: por eso el CSS del juego
usa `%` y `vw` en vez de números fijos de píxeles.

---

## Las mañas del navegador

Un navegador en el celular quiere hacer cosas con tus dedos:

| Lo que quiere hacer | Por qué arruina el juego |
|---|---|
| Zoom con dos dedos | se te descuadra todo |
| Refrescar si arrastrás para abajo | perdés la partida |
| Seleccionar texto si mantenés | aparece el menú de copiar |
| Zoom con doble toque | ídem |

Se los pedimos que no lo haga, con CSS (`touch-action: none`,
`overscroll-behavior: none`) y con JavaScript (`preventDefault`).

Un detalle chiquito y muy importante en `tactil.js`:

```js
base.setPointerCapture(e.pointerId);
```

Eso quiere decir **"este dedo es mío hasta que lo levante"**.
Sin esa línea, si arrastrás el dedo fuera del círculo, el navegador deja de
avisarnos que se movió... y el héroe **se queda caminando solo para siempre**.
Es un bug clásico de los controles táctiles.

Lo mismo con girar el teléfono: si estabas caminando y girás, la palanca
queda en otro lugar de la pantalla y el dedo "se pierde". Por eso al girar
soltamos todas las flechas.

---

## 🎯 Probalo desde la compu

No hace falta un celular. Agregá `?tactil=1` al final de la dirección:

```
index.html?tactil=1
```

Aparecen la palanca y los botones, y podés usarlos con el mouse.

Eso también es una decisión de diseño: **hacer que lo difícil de probar
sea fácil de probar**. Si para probar el celular hubiera que agarrar un
celular cada vez, lo probarías mucho menos... y tendría muchos más bugs.

---

## 🎯 Tu misión

1. Abrí `index.html?tactil=1` y achicá la ventana del navegador hasta que
   quede angosta y alta. **El juego se da vuelta solo.**

2. En `css/estilo.css`, buscá `#joystick` y cambiá el `clamp(112px, 30vw, 168px)`
   por `clamp(200px, 50vw, 300px)`. Una palanca gigante.

3. En `js/tactil.js`, buscá la **zona muerta**:
   ```js
   const zonaMuerta = this.radio * 0.25;
   ```
   Poné `0.01` y probá: el héroe sale caminando con el mínimo temblor del dedo
   y se siente descontrolado. Poné `0.8`: casi no responde.
   **Ese número es la diferencia entre un control que se siente bien y uno
   que se siente roto.** Buscá el que más te guste.
