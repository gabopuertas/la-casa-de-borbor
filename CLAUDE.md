# CLAUDE.md — cómo trabajar en este proyecto

> Léeme antes de tocar nada. Este proyecto tiene reglas que **no son negociables**
> porque son el punto del proyecto, no detalles de estilo.

## Qué es

**La Casa de BorBor**: un juego de aventura 2D visto desde arriba, hecho por
**un chico de 10 años (BorBor) y su papá (Gabriel)**.

El objetivo es doble y el segundo pesa igual que el primero:

1. Que el juego funcione y sea divertido.
2. Que **BorBor entienda cómo está hecho**. Lo didáctico no es un extra: es
   la mitad del entregable.

Publicado en https://gabopuertas.github.io/la-casa-de-borbor/

---

## Las 6 reglas que no se rompen

### 1. Doble clic en `index.html` y anda

Sin build, sin npm, sin servidor, sin terminal, **sin dependencias**.
HTML + CSS + JavaScript plano. Funciona offline y desde `file://`.

> Por eso **no hay módulos ES6**: no funcionan con doble clic (CORS).
> Todo son `<script>` clásicos con objetos globales. Menos elegante para un
> profesional, infinitamente más fácil para un chico. **No “modernizar” esto.**

### 2. El juego funciona sin ninguna imagen

Cada sprite tiene un **dibujo de reserva hecho con código** en `js/reservas.js`.
Si falta el PNG, el juego dibuja el de reserva y sigue andando.

**Todo sprite nuevo necesita su reserva.** Si agregás uno sin reserva, el juego
se rompe justo para quien todavía no dibujó nada — o sea, para el usuario nuevo.

La portada lleva el marcador `Tus dibujos en el juego: X de 22`. Es el motor de
motivación del proyecto entero.

### 3. Todo en español, y explicado para 10 años

- Nombres de variables, funciones y archivos **en español** (`Jugador`, `Mundo`,
  `chocaCaja`, `movimientoDeCaminata`).
- **Sin acentos ni ñ en identificadores ni en comentarios de código** (los `.js`
  usan “anio”, “tamanio”, “maniana”). En los `.md` sí van los acentos.
- Los comentarios explican **por qué**, no qué. Con analogías. Cuando hay un
  concepto real detrás (delta time, AABB, i-frames, flood fill, utility AI,
  patrón adaptador), **nombralo** — que aprenda la palabra de verdad.
- Voseo rioplatense.

### 4. Los números que se tocan viven en `js/config.js`

Nada de números mágicos sueltos. Si BorBor puede querer cambiarlo
(velocidad, vidas, tamaños, cuánto flota Chispa), va a `CONFIG` con un comentario.

### 5. Una sola fuente de verdad

Ya nos mordió dos veces:
- El taller tenía su **propia copia** de la lista de sprites → Chispa no aparecía.
  Ahora `taller/recortar.html` **carga `js/sprites.js`** y arma el menú solo.
- El navegador falso de las pruebas estaba copiado en 4 archivos.
  Ahora está en `pruebas/navegador-falso.js`.

Si te encontrás copiando una lista, pará y buscá cómo leerla del original.

### 6. Nada que dependa de adivinar

La detección de pantalla táctil es una adivinanza y **falló**: “tocar para
empezar” estaba dentro del `if (es táctil)`, así que si la detección erraba el
juego era **imposible de empezar**.

Ahora: tocar **o hacer clic** funciona siempre, y además se detecta por
**comportamiento** (un `touchstart` prende los controles, una tecla del juego
los apaga). Mantené esa propiedad.

---

## Arquitectura

```
index.html          el esqueleto. El ORDEN de los <script> importa.
css/estilo.css      la ropa + el layout adaptable (celular/compu)
js/
  config.js         ← las perillas
  sonidos.js        WebAudio sintetizado, cero archivos de audio
  teclado.js        input: distingue "mantenida" de "recién apretada"
  tactil.js         ADAPTADOR: los dedos escriben en la lista del teclado
  sprites.js        carga los PNG; obligatorios (cuentan) vs cuadros (no cuentan)
  reservas.js       los dibujos de código; todo se dibuja en 32x32 y se escala
  dibujante.js      render + cámara + globo de diálogo + conMovimiento()
  mapas.js          los 3 mapas en ASCII + leyenda + validador
  mundo.js          parsea el ASCII, colisiones, culling
  jugador.js        movimiento por ejes separados, i-frames, animación
  enemigos.js       patrulla y persecución; AABB
  objetos.js        recolectables
  hud.js            corazones y contadores (se dibuja SIN cámara)
  amigo/            la IA de Chispa (ver abajo)
  main.js           game loop, delta time, máquina de estados, acomodarPantalla()
```

### La IA de Chispa (`js/amigo/`)

El ciclo **percibir → recordar → decidir → actuar**, un archivo por paso:

- `percepcion.js` — resume el mundo en números (distancias **en casillas**)
- `memoria.js` — compara con la foto anterior y **deduce** eventos
  (“te lastimaron” no existe como variable en ningún lado)
- `decision.js` — **IA por utilidad**: cada idea se puntúa, gana la más alta.
  `peligro` = 100, `charla` = 5. **Agregar una idea no toca ninguna otra.**
- `cerebro.js` — la **interfaz**: `Cerebro.pensar(percepción, memoria) → {accion, frase}`.
  Adentro hay reglas; podría haber un LLM. La plantilla remota está incluida y apagada.
- `amigo.js` — el cuerpo. Piensa **6 veces por segundo**, no 60.

**No conectes un LLM sin hablarlo**: rompería las reglas 1 y 6 (haría falta
servidor + API key, y no se puede poner una clave en una página pública).

### Invariantes técnicos

- `CONFIG.ANCHO`/`ALTO` **cambian en runtime** (640x480 ↔ 480x640 en celular parado).
  No hardcodees posiciones en pantalla: usá fracciones de `CONFIG.ALTO`.
- El HUD se dibuja **después** de `conCamara()`.
- Orden de dibujado = capas: piso → objetos → Chispa → enemigos → héroe → globo → HUD.
- Movimiento **por ejes separados** (X primero, Y después) para poder deslizarse
  en las esquinas.
- La hitbox del héroe (20x24) es **más chica** que el dibujo, a propósito.

---

## Cómo verificar

```bash
node pruebas/correr-todo.js      # 126 chequeos en 5 suites, ~10 segundos
```

o doble clic en `probar.command`.

**Corré esto antes de dar algo por terminado.** Ya atrapó varios errores reales:
un `addEventListener` faltante al mover código de lugar, un contador desactualizado,
y la IA de persecución probando el eje equivocado.

Además, para cambios visuales, **sacá capturas con Chrome headless y miralas**.
Así se encontraron: proporciones rotas al escalar, el balanceo que se inclinaba
siempre para el mismo lado, y el layout del celular.

---

## Trampas conocidas (nos costaron tiempo)

| Trampa | Qué pasa |
|---|---|
| **Headless Chrome no baja de 500px** | `--window-size=390` se ignora; la captura sale recortada y parece un bug de layout. Usá `Emulation.setDeviceMetricsOverride` (ver `pruebas/probar-en-navegador-real.js`). |
| **Dos cuentas de GitHub** | `osxkeychain` devuelve la de `SaltaTeramot` y el push da 403. Ya está arreglado repo-local con `!gh auth git-credential`. |
| **El token de `gh` no tiene scope `workflow`** | No se pueden pushear archivos en `.github/workflows/`. Pages publica desde la rama `main`, no hace falta. |
| **Buscar y reemplazar contadores** | Cambiar `"2 de 22"` por `"3 de 22"` también pisa `"22 de 22"` y lo deja en `"23 de 22"`. Revisá el resultado. |
| **`const` en scripts `vm`** | No quedan como propiedades del contexto. Usá `n.tomar("Juego", ...)`. |
| **Caracteres invisibles** | Una vez se coló un zero-width space en un nombre de función. Si un `node --check` falla sin motivo aparente, mirá eso. |

---

## Privacidad

**El nombre de pila real del hijo NO va al repo.** En todo el código y las guías
se usa **“BorBor”**. Decisión de Gabriel, 12 de septiembre de 2026.

Los commits usan `gabopuertas@users.noreply.github.com` (configurado **solo en
este repo**, no global) para que el email real no quede en el historial público.

---

## Publicar

```bash
git add -A && git commit -m "..." && git push
```

GitHub Pages se actualiza solo en 1–2 minutos. Verificá que subió de verdad:

```bash
node pruebas/probar-en-navegador-real.js https://gabopuertas.github.io/la-casa-de-borbor/
```

---

## Estado y próximos pasos

Ver **`ESTADO.md`**.
