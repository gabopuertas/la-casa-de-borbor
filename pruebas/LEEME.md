# Las pruebas

**Esto no hace falta para jugar ni para dibujar.** Es para cuando se toca el
código y se quiere estar seguro de no haber roto nada.

## Correr todo

```bash
node pruebas/correr-todo.js
```

o doble clic en **`probar.command`** (en la carpeta del juego).

Tarda unos 10 segundos y hace **126 chequeos**.

## Qué prueba cada una

| Archivo | Qué revisa |
|---|---|
| `validar-mapas.js` | Que las filas midan lo mismo, que no haya letras inventadas y —lo más importante— que con un recorrido tipo hormiga **se pueda llegar** a las llaves, cofres, monedas, portales y la meta. Un mapa puede estar perfecto y ser imposible de terminar. |
| `probar-juego.js` | El juego entero: caminar, chocar, 2000 cuadros sin meterse en una pared, juntar cosas, la llave que abre la puerta, el garrote, viajar entre mapas, ganar, perder, la pausa y toda la IA de Chispa. |
| `probar-dibujos.js` | Que el juego ande **sin ninguna imagen**, que cada PNG reemplace a su reserva, la cadena de reserva (`heroe-izq` → `heroe`) y la animación por cuadros. |
| `probar-tactil.js` | La palanca, la zona muerta, las diagonales, los botones, tocar la pantalla, girar el teléfono y el cambio de forma del juego. |
| `probar-en-navegador-real.js` | Abre Chrome de verdad (sin ventana) y prueba como una compu y como un iPhone. Es el único que prueba el CSS. |

## Cómo funcionan

Las cuatro primeras usan **`navegador-falso.js`**: un navegador de mentira que
contesta todo lo que el juego le pregunta. Así el juego corre adentro de Node,
sin dibujar nada, y se pueden jugar 2000 cuadros en medio segundo.

La quinta usa Chrome de verdad por el **protocolo DevTools**, porque el CSS y
los tamaños reales no se pueden probar con un navegador de mentira.

## Probar el sitio publicado

```bash
node pruebas/probar-en-navegador-real.js https://gabopuertas.github.io/la-casa-de-borbor/
```

Sin dirección usa los archivos locales, así se prueba **antes** de subir.
