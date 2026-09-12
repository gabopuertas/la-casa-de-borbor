# 12 misiones

De la más fácil a la más difícil. **Hacelas en orden.**

Después de cada una: guardá el archivo (`Ctrl+S`) y apretá **F5** en el navegador.

> Si algo se rompe: apretá **F12** → pestaña **Console**. Ahí dice en rojo
> qué archivo y qué línea está mal. Eso no es un castigo, es el juego ayudándote.

---

## 🟢 Nivel 1 — Cambiar números

### Misión 1: el héroe cohete
**Archivo:** `js/config.js`

Cambiá `VELOCIDAD_JUGADOR` a `8`. Jugá. Después probá `0.5`. Dejalo en `3`.

*Aprendés:* que el código es algo vivo que responde a lo que tocás.

### Misión 2: hacelo justo
**Archivo:** `js/config.js`

El juego ahora es fácil. Hacelo difícil de verdad:
- `VIDAS_INICIALES: 1`
- `VELOCIDAD_SOMBRA: 2`
- `VISTA_SOMBRA: 12`

Jugalo. ¿Se puede ganar? ¿Es divertido o es injusto?
Ahora buscá **los números que hacen que sea difícil PERO se pueda ganar**.

*Aprendés:* esto se llama **balancear un juego**, y es un trabajo real —
hay gente que se dedica solo a esto. Lo difícil no es hacerlo difícil:
es que sea justo.

### Misión 3: ver la Matrix
**Archivo:** `js/config.js`

Poné `MOSTRAR_CAJAS: true`. Jugá un rato así.

Fijate que la caja del héroe es **más chica** que el dibujo. ¿Por qué te parece?

> **La respuesta:** para que sea más fácil pasar por los pasillos y para que
> los enemigos te "rocen" sin que cuente como golpe. Casi todos los juegos hacen
> trampa a favor tuyo, para que se sienta justo. Si la caja fuera igual de grande
> que el dibujo, el juego se sentiría injusto aunque técnicamente estuviera bien.

---

## 🟡 Nivel 2 — Cambiar texto y sonido

### Misión 4: ponete tu nombre
**Archivo:** `js/config.js` → `NOMBRE_JUEGO` y `NOMBRE_HEROE`
**Archivo:** `index.html` → el `<title>` y el `<h1>`

Probá poner `NOMBRE_JUEGO: "El Castillo de BorBor"` y mirá la portada:
se reacomoda sola, porque agranda la última palabra.

### Misión 5: inventá un sonido
**Archivo:** `js/sonidos.js`

Buscá `moneda()` y cambiale los números:

```js
moneda() { this.melodia([[988, 0.05], [1319, 0.10]]); },
```

El primer número de cada par es **qué tan agudo** (Hz), el segundo **cuánto dura** (segundos).

Probá agregar una tercera nota. Probá cambiar `"square"` por `"sine"`, `"sawtooth"` o `"triangle"`
en la función `tono()` y escuchá la diferencia.

*Dato:* 440 Hz es el LA con el que se afinan las guitarras. 880 Hz es el mismo LA,
una octava más arriba. **El doble de frecuencia = la misma nota más aguda.**
Así funciona toda la música.

### Misión 6: cambiá los colores del mundo
**Archivo:** `js/reservas.js`

Buscá `pasto()` y cambiá `"#4c9a3f"` por `"#d4a5c0"`. F5.
Un mundo rosa.

Esos códigos son **#RRGGBB** en hexadecimal: dos dígitos de rojo, dos de verde,
dos de azul. `#ff0000` es rojo puro, `#000000` negro, `#ffffff` blanco.

---

## 🟠 Nivel 3 — Meter tus dibujos

### Misión 7: tu héroe
Dibujalo, pasalo por `taller/recortar.html`, guardalo como
`imagenes/personajes/heroe.png`. F5.

**Ese es el momento.** El juego deja de ser mío y pasa a ser tuyo.

### Misión 8: el héroe mira para donde camina
Hacé los 4: `heroe-abajo`, `heroe-arriba`, `heroe-izq`, `heroe-der`.

Fijate que **no tocaste ni una línea de código** y el juego mejoró muchísimo.
Eso es porque `js/sprites.js` ya estaba preparado para buscarlos.
Dejar el código listo para cosas que todavía no existen es una habilidad enorme.

### Misión 9: completá los 21
Hasta que la portada diga `22 de 22`. Ya tenés 3: el héroe, el garrote y Chispa. La IA te puede ayudar con los pisos
(mirá `taller/prompts-ia.md`), pero **los personajes hacelos vos**.

---

## 🔴 Nivel 4 — Programar de verdad

### Misión 10: tu propio mapa
Leé `guia/04-hacer-mapas.md` y agregá un mapa nuevo a `js/mapas.js`.

Mínimo: una llave, una puerta, un cofre detrás, dos enemigos y un portal.
Que se tarde como un minuto en terminarlo.

### Misión 11: un objeto nuevo — la poción de velocidad 🧪

Este es el primero que toca varios archivos. Seguí el orden.

> **El garrote ya está hecho así.** Antes de empezar, buscá la palabra
> `garrote` en los archivos del juego (en VS Code es `Ctrl+Shift+F`).
> Vas a encontrarla en **6 lugares**. Mirá cada uno antes de hacer la poción:
> es exactamente el mismo camino.

**1.** `js/mapas.js` → agregá a `ENTIDADES`:
```js
"W": "pocion",
```

**2.** `js/sprites.js` → agregá a la lista:
```js
"pocion": "imagenes/objetos/pocion.png",
```

**3.** `js/reservas.js` → agregá un dibujo de emergencia:
```js
pocion(ctx, x, y, w, h) {
  this.caja(ctx, x + 11, y + 8, 10, 6, "#aaa");        // el corcho
  this.circulo(ctx, x + w / 2, y + h / 2 + 4, 9, "#b06bd8");  // la botella
},
```

**4.** `js/objetos.js` → en `agarrar()`, justo después del bloque `case "corazon":`:
```js
case "pocion":
  CONFIG.VELOCIDAD_JUGADOR += 1;
  Sonidos.curar();
  HUD.avisar("Mas rapido!");
  break;
```

**5.** `js/objetos.js` → en `dibujar()`, agregá una línea más a la lista de reservas:
```js
pocion: (c,x,y,w,h) => Reservas.pocion(c,x,y,w,h),
```

**6.** Poné una `W` en algún mapa. F5.

*Aprendés:* que agregar UNA cosa nueva toca VARIOS archivos, y que hay que
saber en cuáles. Esa es la diferencia entre "cambiar un número" y "programar".
Si lo lográs, ya podés inventar los objetos que se te ocurran.

### Misión 12: el enemigo que dispara 💀

El más difícil. No hay pasos: tenés que pensarlo vos.

Pistas:
- Un disparo es un objeto con `x`, `y` y una **velocidad** (`vx`, `vy`).
  En cada cuadro le sumás la velocidad a la posición.
- Cuando choca contra una pared (`Mundo.chocaCaja`) o se va del mapa, `vivo = false`.
- Cuando toca al jugador (`Enemigos.seTocan`), `Jugador.recibirDanio(...)`.
- El enemigo necesita un reloj propio: `e.proximoTiro`, para no disparar
  60 balas por segundo.

Si te trabás, pedile ayuda a papá o a la IA — pero **primero intentalo solo
20 minutos**. Trabarse y destrabarse es literalmente el trabajo de un programador.

---

## Misiones bonus 🌟

- Que las monedas hagan un sonido **más agudo** cuanto más tenés juntadas.
- Que el juego guarde tu récord de monedas (buscá `localStorage`).
- Un enemigo **jefe**, que necesite 3 golpes.
- Un mapa nocturno: una capa negra con un círculo transparente alrededor del héroe.
- Que el héroe pueda **empujar** cajas para tapar agujeros.
