# Estado del proyecto

**Última actualización: 15 de septiembre de 2026**

- 🎮 Jugar: https://gabopuertas.github.io/la-casa-de-borbor/
- 📦 Repo: https://github.com/gabopuertas/la-casa-de-borbor
- 💻 Carpeta local: `~/Claude/Projects/video games Benicio` *(el nombre de la
  carpeta todavía dice "Benicio"; adentro todo dice "BorBor")*

---

## Dónde estamos

El juego **está terminado y publicado**. Funciona en la compu y en el celular.
Lo que falta es **arte**: 19 de los 22 dibujos siguen siendo figuras hechas con código.

### 🎨 Dibujos: 3 de 22

| Listo | Archivo | Qué es |
|:---:|---|---|
| ✅ | `imagenes/personajes/heroe.png` | el robot amarillo (BorBor) |
| ✅ | `imagenes/personajes/amigo.png` | Chispa, el robot volador |
| ✅ | `imagenes/objetos/garrote.png` | el arma |

**Faltan 19.** Están todos listados en `imagenes/donde-va-cada-dibujo.md` y
aparecen solos en el menú de `taller/recortar.html`.

---

## Qué hay hecho

### El juego
- 3 mapas encadenados (El Pueblo → El Bosque Oscuro → El Castillo), escritos en ASCII
- Dos enemigos con comportamiento distinto: el **baboso** patrulla, la **sombra** persigue
- Llaves, puertas, cofres, corazones, monedas y el **garrote** (rompe 3 enemigos)
- Colisiones por ejes separados, invulnerabilidad tras el golpe, empujón, cámara con culling
- Sonido sintetizado con WebAudio — **cero archivos de audio**
- Animación de caminata: **por cuadros** (si existen `heroe-1.png` y `heroe-2.png`)
  **y procedural** (rebote, balanceo, aplaste y sombra) — las dos se suman

### Chispa, el amigo con IA
- Ciclo **percibir → recordar → decidir → actuar**, un archivo por paso en `js/amigo/`
- Decisión por **utilidad**: cada idea se puntúa y gana la más urgente
- Deduce cosas que no existen en el juego (“te lastimaron”) comparando estados
- `cerebro.js` es un **enchufe**: se le puede conectar un LLM sin tocar el resto
- Apretá **E** (o el botón E) para preguntarle

### Celulares y tablets
- Palanca y botones que aparecen solos
- El juego **cambia de forma** en celular parado (640×480 → 480×640)
- Tocar **o hacer clic** siempre sirve para empezar
- Se prueba desde la compu con `?tactil=1`

### Herramientas
- `taller/recortar.html` — foto o imagen de IA → sprite PNG transparente
- `taller/prompts-ia.md` — cómo pedirle sprites a una IA que sirvan
- `servidor.command` — plan B si algo no carga con doble clic
- `probar.command` — corre las 126 pruebas automáticas

### Documentación
9 guías en `guia/`, escritas para leerlas a los 10 años:
`00` empezar · `01` cómo funciona un videojuego · `02` las partes ·
`03` tus dibujos · `04` hacer mapas · `05` 12 misiones · `06` animación ·
`07` la IA de Chispa · `08` celulares · `glosario`

---

## Por dónde seguir

### 🥇 Lo que más cambia el juego, en orden

1. **`pasto.png`** — se dibuja ~400 veces por mapa, es lo que más se ve.
   Tiene que ser **tileable** (sin costuras). `taller/prompts-ia.md` explica cómo pedirlo.
2. **`baboso.png`** y **`sombra.png`** — los enemigos.
3. **`arbol.png`** y **`piedra.png`** — la forma del mundo.
4. **`heroe-1.png` y `heroe-2.png`** — duplicar el robot y cambiarle solo las
   piernas. BorBor pasa a caminar cuadro por cuadro **sin tocar una línea de código**.

### 🥈 Para programar (las misiones de `guia/05-misiones.md`)

- **Misión 10** — su propio mapa (`guia/04-hacer-mapas.md`)
- **Misión 11** — la poción de velocidad: el primer cambio que toca 5 archivos.
  Pista que ya está puesta: buscar `garrote` en el proyecto, aparece en 6 lugares.
- **Misión 12** — un enemigo que dispara. A propósito sin pasos.
- **`guia/07`** — inventarle ideas nuevas a Chispa (agregar una no toca las otras)
- **`guia/08`** — buscar la zona muerta de la palanca que mejor se sienta

### 🥉 Ideas más grandes, si quieren

- Un **jefe** que necesite 3 golpes
- Guardar el récord de monedas (`localStorage`)
- Un mapa **nocturno**: capa negra con un círculo transparente alrededor del héroe
- Que Chispa tenga sus propios cuadros de animación
- Más mapas: la cadena `siguiente:` acepta todos los que quieran

---

## Cosas para tener a mano

**Probar que no rompimos nada:**
```bash
node pruebas/correr-todo.js     # o doble clic en probar.command
```

**Publicar cambios:**
```bash
git add -A && git commit -m "lo que hiciste" && git push
```
GitHub Pages se actualiza solo en 1–2 minutos.

**Si `git push` da 403** → es el lío de las dos cuentas de GitHub.
Está explicado y resuelto en `LEEME.md`.

**Detalles técnicos y reglas del proyecto** → `CLAUDE.md`

---

## Decisiones que conviene no revertir

| Decisión | Por qué |
|---|---|
| Navegador y no Pygame | meter un dibujo es arrastrar un PNG y apretar F5 |
| Sin módulos ES6 | no funcionan con doble clic en `index.html` |
| El juego anda **sin ninguna imagen** | nadie queda trabado, y el progreso se ve |
| Los números tocables en `config.js` | es la puerta de entrada a programar |
| IA local y no un LLM | offline, gratis, y **se puede leer entera** |
| Los controles táctiles fingen ser teclas | no se tocó la lógica del juego |
| “BorBor” en vez del nombre real | el repo es público |
