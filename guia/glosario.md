# Glosario

Las palabras raras, en orden de aparición.

---

**Sprite** — Un dibujito que se mueve por la pantalla: el héroe, una moneda, un enemigo.
El nombre viene de "duende", porque en las consolas viejas los sprites eran fantasmitas
que flotaban por encima de la imagen sin ser parte de ella.

**Tile (baldosa)** — Cada casilla cuadrada de 32×32 con la que se arma el mapa.
Repetir baldosas en vez de dibujar el mapa entero ahorra muchísima memoria.
Por eso los juegos viejos eran así.

**Tileable / sin costuras** — Un dibujo hecho para repetirse sin que se note el borde,
como las baldosas del baño. Fundamental para el pasto y el agua.

**Canvas** — El rectángulo del HTML donde se dibuja el juego. Es literalmente
un lienzo en blanco: el navegador te da el lienzo, vos ponés todo lo demás.

**Contexto (`ctx`)** — El "lápiz" del canvas. Todas las órdenes de dibujo
(`ctx.fillRect`, `ctx.arc`) se le dan a él.

**Cuadro / frame** — Una de las fotos del juego. Van 60 por segundo.

**FPS** — *Frames per second*, cuadros por segundo. 60 es fluido, 30 se nota, 15 va a los saltos.

**Game loop (bucle del juego)** — LEER → PENSAR → DIBUJAR → REPETIR.
El corazón de todos los videojuegos que existieron.

**Delta time (`dt`)** — Cuánto tiempo pasó desde el cuadro anterior.
Multiplicar las velocidades por `dt` hace que el juego ande igual en una
computadora rápida y en una lenta.

**Colisión** — Cuando dos cosas se tocan.

**AABB** — *Axis-Aligned Bounding Box*: "caja derechita sin rotar".
La forma más rápida de detectar choques en 2D, y la que usa este juego.

**Hitbox (caja de golpe)** — El rectángulo invisible que el juego usa para los choques.
Casi nunca es igual al dibujo: suele ser un poco más chico, para que el juego se sienta justo.

**i-frames (cuadros de invencibilidad)** — El ratito después de recibir un golpe
en el que no te pueden volver a pegar. Sin eso, tocar un enemigo te sacaría
60 vidas por segundo.

**Cámara** — Lo que traduce "dónde está la cosa en el mapa" a "dónde se ve en la pantalla".

**Coordenadas del mundo vs. de la pantalla** — Dos sistemas de números distintos.
El cofre está en `x=800` en el mapa, pero la pantalla llega hasta 640.
La cámara hace la traducción.

**Culling** — No dibujar lo que no se ve. Nuestro mapa tiene 600 casillas
pero solo dibujamos las ~350 que entran en pantalla. La compu lo agradece.

**HUD** — *Heads-Up Display*: los corazones, las monedas, el nombre del mapa.
Todo lo que se ve pero **no** es parte del mundo. El nombre viene de los aviones
de caza, que proyectan los datos en el vidrio para que el piloto no baje la cabeza.

**Máquina de estados** — La idea de que el juego está siempre en UN estado
(`portada`, `jugando`, `pausa`, `ganaste`) y hay reglas claras para pasar de uno a otro.
Sin esto el código se llena de "si esto y no aquello" y se vuelve ilegible.

**Parsear** — Traducir un texto a algo que el programa pueda usar.
Nuestro `mundo.js` parsea las letras del mapa y arma la grilla.

**Flood fill (relleno por difusión)** — El algoritmo de la varita mágica y del balde
de pintura: empieza en un punto y se desparrama a los vecinos parecidos hasta
chocar contra un borde. El mismo que usa el Buscaminas cuando se abre media pantalla.

**Alfa** — El cuarto número de cada píxel: cuánto se ve. 0 = invisible, 255 = opaco.
Es lo que hace posible la transparencia. **El JPG no lo tiene; el PNG sí.**

**Placeholder** — Algo provisorio que ocupa el lugar de lo definitivo.
Los dibujos de `reservas.js` son placeholders esperando tus PNG.

**Asíncrono** — Pedir algo ahora y que te contesten más tarde, mientras el
programa sigue vivo. Cargar imágenes es asíncrono: por eso hay un `onload`.

**Consola** — La pantalla que se abre con `F12`. El juego te habla por ahí
y te avisa los errores. Los programadores la tienen abierta todo el día.

**Bug** — Un error en el programa. Literalmente "bicho": en 1947 una polilla
se metió en una computadora Mark II y la rompió. La pegaron con cinta en el
cuaderno de registro y escribieron "primer caso real de un bug encontrado".

**Debuggear** — Sacar los bugs. Es el 80% del trabajo de programar.
Nadie escribe código que ande a la primera. Nadie.
