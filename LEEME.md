# La Casa de BorBor

Un juego de aventura visto desde arriba (estilo Zelda clásico), pensado para que
BorBor **lo termine él** — y que en el camino entienda cómo está hecho.

> **Para jugar ahora mismo:** doble clic en `index.html`.
> **Para empezar a aprender:** abrí `guia/00-empezar-aca.md`.
> **Para retomar después de un tiempo:** abrí **`ESTADO.md`** — dice dónde
> quedamos y por dónde seguir.
> **Para trabajar en el código (vos o una IA):** **`CLAUDE.md`** tiene las reglas
> del proyecto y las trampas que ya nos costaron tiempo.
> **En internet:** https://gabopuertas.github.io/la-casa-de-borbor/
> **Repo:** https://github.com/gabopuertas/la-casa-de-borbor

---

## Publicado

El proyecto está en GitHub y jugable en la web. Cosas que conviene saber:

- **Es público y con licencia MIT.** Cualquiera puede jugarlo, copiarlo y usarlo
  con sus hijos o alumnos.
- **El nombre de pila de tu hijo no aparece en ningún lado.** Todas las menciones
  se cambiaron por "BorBor". Tampoco aparece tu email: los commits usan
  `gabopuertas@users.noreply.github.com` en vez de tu correo real.
- **La identidad de git está configurada solo en este repo**, no en tu config global.
- **Para publicar cambios:** `git add -A && git commit -m "lo que hiciste" && git push`
  GitHub Pages se actualiza solo en un minuto o dos.

### ⚠️ Tenés dos cuentas de GitHub y git elegía la equivocada

Tu `git` usa el helper `osxkeychain`, que guarda **una sola** credencial para
github.com — y esa era la de `SaltaTeramot`. El primer push funcionó porque lo
hizo `gh` directamente, pero el `git push` común fallaba con:

```
remote: Permission to gabopuertas/la-casa-de-borbor.git denied to SaltaTeramot
```

Ya está arreglado **solo en este repo** (no toqué tu config global ni el llavero):

```bash
git config --local --replace-all "credential.https://github.com.helper" ""
git config --local --add "credential.https://github.com.helper" "!gh auth git-credential"
git config --local "credential.https://github.com.username" "gabopuertas"
```

Ahora git le pregunta a `gh` por la credencial, y `gh` usa la cuenta activa.
**Si algún día armás otro repo personal y te da 403, este es el motivo** —
copiá esas tres líneas. (Para arreglarlo de una vez para siempre en todas partes:
`gh auth setup-git`, pero eso sí cambia tu config global.)
- **`docs/captura.png`** es la imagen del README. Si el juego cambia mucho,
  conviene sacar una nueva.

> Un detalle: tu token de `gh` no tiene permiso `workflow`, así que no se pueden
> subir archivos en `.github/workflows/`. No hace falta: Pages publica directo
> desde la rama `main`.

---

## La idea del proyecto

El juego **ya funciona completo** de punta a punta: 3 mapas, enemigos con dos
comportamientos distintos, llaves, puertas, cofres, vidas, sonido, pantalla de
victoria y derrota.

Pero **no tiene ni un solo dibujo**. Todo lo que se ve está dibujado con código:
círculos, rectángulos y algo de trigonometría.

Esa es la pieza central del diseño pedagógico:

- El juego **nunca se rompe** por un archivo que falta. BorBor no puede quedar trabado.
- Cada PNG que agrega **reemplaza** una figura de relleno. El progreso es visible y
  gratificante desde el primer minuto.
- La portada lleva el marcador: `Tus dibujos en el juego: 3 de 22`.
- Y deja clarísima la lección más importante del proyecto: **el dibujo y la lógica
  son dos cosas separadas**. El juego no ve dibujos, ve rectángulos con números.

---

## Cómo está armado

```
index.html            el esqueleto — doble clic para jugar
css/estilo.css        la ropa
js/                   13 archivos, uno por responsabilidad
imagenes/             ← acá van los dibujos de BorBor
taller/recortar.html  foto → sprite PNG transparente
guia/                 6 documentos didácticos, en orden
servidor.command      plan B: levanta un server local (doble clic)
```

**Sin dependencias, sin instalación, sin build, sin terminal.**
HTML + CSS + JavaScript plano. Se abre con doble clic y anda.

Elegí navegador y no Python/Pygame precisamente por el pedido de BorBor:
para meter un dibujo solo hay que arrastrar un PNG a una carpeta y apretar F5.
Con Pygame habría que instalar cosas y correr comandos, y eso mata el impulso
de "hice un dibujo, quiero verlo YA".

Tampoco usé módulos ES6 ni frameworks, a propósito: los módulos no funcionan
abriendo un archivo con doble clic (hacen falta un servidor y CORS). Todo son
`<script>` clásicos con objetos globales — menos elegante para un profesional,
infinitamente más fácil para un chico de 10.

### Los archivos del cerebro

| Archivo | Su único trabajo |
|---|---|
| `config.js` | Los números que se tocan (velocidades, vidas, modo debug) |
| `sonidos.js` | Sintetiza los efectos con WebAudio — cero archivos de audio |
| `teclado.js` | Input, distinguiendo "mantenida" de "recién apretada" |
| `sprites.js` | Carga los PNG y registra cuáles faltan |
| `reservas.js` | Los dibujos de relleno hechos con Canvas |
| `dibujante.js` | Render + cámara |
| `mapas.js` | Los 3 mapas en ASCII + la leyenda + un validador |
| `mundo.js` | Parsea el ASCII, resuelve colisiones, dibuja con culling |
| `jugador.js` | Movimiento por ejes, i-frames, knockback |
| `enemigos.js` | Patrulla y persecución |
| `objetos.js` | Recolectables |
| `hud.js` | Corazones, contadores, avisos |
| `main.js` | Game loop, delta time, máquina de estados |

---

## Las guías (en orden)

| Documento | Qué enseña |
|---|---|
| `guia/00-empezar-aca.md` | Primera sesión. **Termina programando de verdad en 10 minutos.** |
| `guia/01-como-funciona-un-videojuego.md` | El game loop, delta time, la Y invertida |
| `guia/02-las-partes-del-juego.md` | Por qué se separa en archivos, el orden de dibujado, la cámara |
| `guia/03-tus-dibujos.md` | El pipeline completo dibujo → juego, y por qué PNG y no JPG |
| `guia/04-hacer-mapas.md` | Editar mapas ASCII + **diseño de niveles** |
| `guia/06-animacion.md` | Animación por cuadros y animación procedural |
| `guia/07-el-amigo.md` | IA por utilidad: percibir → recordar → decidir → actuar |
| `guia/08-celulares.md` | El patrón adaptador y el diseño adaptable |
| `guia/05-misiones.md` | 12 desafíos progresivos |
| `guia/glosario.md` | Las palabras raras |
| `taller/prompts-ia.md` | Cómo pedirle sprites a una IA que sirvan de verdad |

---

## El taller de sprites

`taller/recortar.html` es una herramienta completa, hecha a medida:

- Trae la imagen arrastrándola, con `Ctrl+V` (ideal para imágenes de IA) o con el botón
- **Varita mágica** (flood fill con tolerancia regulable) para sacar el fondo
- Botón **"sacar el fondo solo"**: toca las esquinas automáticamente
- **Goma** para los restos, y **deshacer**
- **Ajuste de bordes** automático (recorta el aire sobrante)
- Exporta a 32/48/64/96 px, con o sin suavizado, centrado y sin deformar
- **Menú con los 22 nombres exactos** que el juego espera, y te dice en qué carpeta va
- Opción **"Otro…"** para inventar un nombre nuevo: sanitiza el texto y te muestra
  la línea exacta que hay que agregar a `js/sprites.js`

Ese último punto es el que más problemas evita: el 90% de los "no me anda"
son un nombre mal escrito.

Usa `readAsDataURL` en vez de object URLs a propósito, para que el canvas
no quede *tainted* y se puedan leer los píxeles aun abriendo por `file://`.

---

## Un plan de sesiones que funciona

**Sesión 1 (40 min) — "yo puedo tocar esto"**
Jugar hasta ganar. Después `guia/00`: cambiar `VELOCIDAD_JUGADOR`, poner
`MOSTRAR_CAJAS: true`. El objetivo no es que entienda el código: es que
entienda que **el código responde**.

**Sesión 2 (1 h) — el primer dibujo**
Dibuja el héroe en papel, foto, taller, `heroe.png`, F5.
Ese momento suele ser el que engancha para siempre.

**Sesión 3 (1 h) — completar el arte**
Repartirse: él los personajes, la IA los pisos (`taller/prompts-ia.md`).
Meta: llegar a 20/20.

**Sesión 4 (1 h) — su propio mapa**
`guia/04`. La parte de **diseño de nivel** es la más valiosa: que pruebe su
mapa, que se aburra con él, y que entienda *por qué* se aburrió.

**Sesión 5 en adelante — misión 11 y 12**
La 11 (la poción) es la primera que toca 5 archivos: es el salto de
"cambiar un número" a "programar".
La 12 (enemigo que dispara) es a propósito difícil y sin pasos.

---

## Sugerencias para acompañarlo

- **Dejalo romper cosas.** No hay forma de hacer daño. Que ponga
  `VELOCIDAD_SOMBRA: 50` y se muera de risa.
- **Enseñale F12 el primer día.** Que el error rojo sea un amigo que te dice
  dónde mirar, no un reto.
- **No le arregles el bug.** Preguntale "¿qué línea dice el error?" y esperá.
  La habilidad que se está formando ahí no es escribir código: es no
  entrar en pánico cuando algo no anda.
- **Aguantá las ganas de refactorizar.** Si su código es feo pero funciona, funciona.
- **Que lo muestre.** Que un amigo o un abuelo lo juegue delante de él.
  Mirar a otro jugar tu juego es la mejor clase de diseño que existe.

---

## Pruebas automáticas

```bash
node pruebas/correr-todo.js      # o doble clic en probar.command
```

**126 chequeos en 5 suites, unos 10 segundos.** Corrélas antes de dar un cambio
por terminado: ya atraparon varios errores reales (un `addEventListener` que
quedó faltando al mover código, la IA de persecución probando el eje equivocado,
y un contador desactualizado).

| Suite | Qué revisa |
|---|---|
| `validar-mapas.js` | Filas parejas, letras válidas y —con un BFS— que se pueda **llegar** a llaves, cofres, portales y meta |
| `probar-juego.js` | El juego entero, incluida la IA de Chispa |
| `probar-dibujos.js` | Que ande sin imágenes, la cadena de reserva y la animación |
| `probar-tactil.js` | Palanca, botones, giro del teléfono, cambio de forma |
| `probar-en-navegador-real.js` | Chrome de verdad, como compu y como iPhone (lo único que prueba el CSS) |

Detalle en `pruebas/LEEME.md`.

---

## Detalles técnicos, por si hacen falta

- **Sin build, sin npm, sin dependencias.** Nada que se pudra en 6 meses.
- **Audio**: se activa con la primera tecla (política de autoplay de los navegadores).
- **Delta time acotado a 3** para que cambiar de pestaña no teletransporte al héroe.
- **Culling**: solo se dibujan las casillas visibles (~350 de 600).
- **Colisión por ejes separados**, para poder deslizarse por las esquinas.
- **i-frames de 1,2 s** con parpadeo y empujón.
- **Hitbox del héroe de 20×24** dentro de una casilla de 32×32: hace trampa
  a favor del jugador, como todos los juegos buenos.
