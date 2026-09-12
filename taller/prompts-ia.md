# Cómo pedirle dibujos a la IA (y que entren bien en el juego)

BorBor: acá hay dos caminos, y los dos son válidos.

- **Camino A: dibujás vos en papel** y lo pasás por el taller. Sale con tu estilo.
- **Camino B: se lo pedís a una IA** y lo pasás por el taller igual.

Lo más divertido es mezclarlos: vos hacés al héroe, la IA hace los pastos y las piedras
(que son aburridos de dibujar 20 veces).

---

## La receta de un buen pedido

Una IA de imágenes no adivina. Le tenés que decir 5 cosas, siempre las mismas:

| Qué le decís | Por qué |
|---|---|
| **Qué es** | "una moneda de oro", "un slime verde" |
| **Desde dónde se ve** | `vista desde arriba` — clave en este juego |
| **El estilo** | `pixel art`, `estilo caricatura`, `dibujo infantil` |
| **El fondo** | `fondo transparente` o `fondo blanco liso` |
| **El tamaño** | `sprite de 64x64` |

### Un pedido que funciona

```
Un sprite de videojuego de una moneda de oro brillante,
vista desde arriba, estilo pixel art de 64x64,
colores vivos, contorno negro grueso, fondo blanco liso,
el objeto centrado y solo (sin sombra, sin escenario).
```

### Un pedido que NO funciona

```
una moneda
```

Sale una foto realista de una moneda arriba de una mesa de madera,
con sombra, reflejos y media mano de alguien. Imposible de recortar.

---

## Las 4 reglas de oro

**1. Vista desde arriba.** Nuestro juego mira el mundo desde un dron.
Si pedís un personaje "de frente parado", va a parecer que está acostado en el piso.
Pedí siempre `top-down view` o `vista cenital desde arriba`.

**2. Contorno negro grueso.** Hace que la figura se despegue del fondo.
La varita del taller recorta muchísimo mejor, y además se ve bien cuando es chiquito.

**3. Un objeto solo, centrado.** Si pedís "un cofre en una cueva", la IA te da
la cueva entera. Vos querés **solo el cofre**.

**4. Sin sombra en el piso.** La sombra es gris, y la varita no sabe si es
fondo o parte del dibujo. Agregá siempre: `sin sombra`.

---

## Pedidos listos para copiar

Cambiá solo la primera línea:

```
[QUÉ ES] — sprite de videojuego, vista desde arriba,
estilo pixel art 64x64, contorno negro grueso, colores vivos,
fondo blanco liso, objeto único y centrado, sin sombra, sin texto.
```

- `Una llave dorada antigua`
- `Un cofre de madera con refuerzos de metal, cerrado`
- `Un corazón rojo brillante`
- `Un slime verde con ojitos`
- `Una sombra morada fantasmal con ojos rojos`
- `Una puerta de madera con cerradura`
- `Un portal mágico violeta`

### Para el piso (esto es distinto)

El piso se repite miles de veces, uno al lado del otro. Necesita ser **tileable**
(que el borde derecho pegue perfecto con el borde izquierdo). Pedilo así:

```
Textura de pasto verde vista desde arriba, tileable / sin costuras,
estilo pixel art 64x64, sin objetos, sin sombras, patrón parejo.
```

La palabra mágica es **tileable** (o "sin costuras" / "seamless").
Si no la decís, se va a ver una grilla horrible de cuadraditos en el juego.

---

## Después de que la IA te da la imagen

1. Click derecho → **Copiar imagen**
2. Abrí `taller/recortar.html`
3. **Ctrl+V** — se pega sola
4. Botón **"Sacar el fondo solo"**
5. Elegí para qué es, y **Guardar el PNG**
6. Mové el archivo a su carpeta y apretá **F5** en el juego

---

## Un consejo que no es técnico

Los dibujos hechos por vos van a ser "peores" que los de la IA.
Van a estar chuecos, el héroe va a tener un brazo más largo.

Y el juego va a ser **mucho mejor**.

Los juegos que la gente recuerda no son los mejor dibujados: son los que
tienen algo que nadie más tiene. La IA dibuja mejor que vos. Pero solo vos
podés dibujar *tu* héroe. Usá la IA para lo aburrido (pastos, piedras)
y guardate los personajes para tu mano.
