# Chispa: cómo funciona una IA de verdad

Chispa es el robot chiquito que te sigue. Te avisa cosas, se asusta con los
enemigos y te felicita cuando juntás una llave.

Apretá **E** para preguntarle algo.

Chispa **vuela**: tiene un propulsor en vez de patas. Por eso flota siempre,
aunque esté quieta. Fijate que es **al revés que BorBor**: él rebota porque
*da pasos*, así que quieto no rebota nada. Ella no da pasos, así que nunca para.

Un detalle así de chiquito es lo que hace que un personaje se sienta vivo
y otro parezca una calcomanía. Está en `js/amigo/amigo.js`, función `dibujar()`.

Y ahora lo importante: **Chispa no es magia, y vas a entender exactamente
cómo piensa.** Su cerebro son unas 200 líneas que podés leer.

---

## El ciclo que usan TODAS las IA

Chispa piensa **6 veces por segundo**. Cada vez hace estos 4 pasos, en este orden:

```
  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
  │  PERCIBIR  │ → │  RECORDAR  │ → │   DECIDIR  │ → │   ACTUAR   │
  └────────────┘   └────────────┘   └────────────┘   └────────────┘
   ¿cómo está      ¿qué cambió      ¿qué es lo       moverse
   el mundo?       desde antes?     más urgente?     y hablar

  percepcion.js     memoria.js       decision.js      amigo.js
```

Este ciclo es **el mismo** en un fantasma del Pac-Man, en un auto que se maneja
solo y en un robot de la NASA. Lo que cambia es qué tan complicado es cada paso,
no el orden.

> **¿Por qué 6 veces por segundo y no 60?** Porque el mundo no cambia tanto en
> 16 milésimas de segundo. Pensar 60 veces por segundo sería tirar trabajo a la
> basura. Los juegos de verdad hacen exactamente esto: dibujan mucho más seguido
> de lo que piensan.

---

## Paso 1 — Percibir 👀

`js/amigo/percepcion.js` mira el juego y arma **un resumen**:

```js
{
  vida: 2,
  llaves: 0,
  enemigoCerca: { tipo: "sombra", distancia: 3, persiguiendo: true },
  objetoCerca:  { tipo: "llave",  distancia: 5 },
  puertaCerca: 2,
}
```

Eso es todo lo que Chispa "ve". No ve los dibujos, no ve la pantalla: ve **números**.

Fijate un detalle: las distancias están en **casillas**, no en píxeles.
"está a 96 píxeles" no le dice nada a nadie. "está a 3 casillas" se entiende solo.
**Traducir los números a algo que se entienda es parte del trabajo.**

---

## Paso 2 — Recordar 🧠

`js/amigo/memoria.js` guarda la foto anterior y la compara con la de ahora.

```
   antes: 3 corazones  │  ahora: 2 corazones
                       ▼
              ¡TE LASTIMARON!
```

Y acá pasa algo **muy** interesante, prestá atención:

> **En el juego no existe ninguna variable que diga "te lastimaron".**
> Esa información no estaba en ningún lado. Chispa la **dedujo** comparando
> dos fotos.

Eso ya es un poquito de inteligencia: sacar información nueva de información
que ya tenías. Con una sola foto es imposible. Con dos, aparece el cambio.

La memoria también sirve para algo mucho menos glamoroso y muy importante:
**no repetirse**. Un personaje que dice la misma frase 40 veces deja de parecer
vivo en 10 segundos.

---

## Paso 3 — Decidir 🎯 (la parte más linda)

Acá está el corazón de todo, en `js/amigo/decision.js`.

### La forma obvia (y mala)

```js
si hay un enemigo cerca      → avisar
si no, si hay una llave      → avisar
si no, si estás sin vida     → avisar
si no, si ...                → ...
```

Funciona con 3 reglas. Con 20 es un desastre: no sabés cuál gana, agregar una
en el medio rompe las de abajo, y no podés decir "esto es **más** urgente que aquello".

### La forma que usan los juegos de verdad

Se llama **IA por utilidad** (*utility AI*):

> **1.** Cada idea se pone una nota sola: *"¿qué tan urgente soy ahora?"*
> **2.** Gana la nota más alta.

Eso es todo. Mirá las notas de Chispa:

| Idea | Nota | Cuándo aplica |
|---|---:|---|
| `peligro` | **100** | un enemigo te persigue a menos de 4 casillas |
| `casi-sin-vida` | 95 | te queda 1 corazón |
| `te-lastimaron` | 90 | acabás de recibir un golpe |
| `garrote-a-mano` | 80 | tenés garrote y hay un enemigo cerca |
| `puerta-sin-llave` | 75 | hay una puerta y no tenés llave |
| `objeto-cerca` | 35-65 | según **qué** objeto (un corazón vale más que una moneda) |
| `estas-perdido` | 45 | hace 7 segundos que no te movés |
| `charla` | **5** | siempre |

`charla` tiene nota 5 y **siempre** aplica. Por eso gana **solo cuando no pasa
nada más**. Es la charla de ascensor de Chispa. No hizo falta escribir
"si no pasa nada, charlá": sale solo del sistema de notas.

### Por qué esto es mucho mejor

- **Agregar una idea nueva no toca ninguna de las otras.**
- **El orden en la lista no importa.**
- **Afinás el comportamiento cambiando números**, no reescribiendo lógica.

Los Sims funcionan así. Un montón de juegos también.
No tiene nada de mágico: **son numeritos compitiendo.**

### Probalo ahora

En `js/amigo/decision.js`, buscá la idea `charla` y cambiale la nota de `5` a `200`.

F5. Chispa se vuelve un charlatán insoportable que te habla de cualquier cosa
mientras una sombra te está comiendo. 😅

Volvelo a `5`. Acabás de entender para qué sirven las prioridades.

---

## Paso 4 — Actuar 🦿

`js/amigo/amigo.js` es **solo el cuerpo**. No decide nada.

Hace tres cosas según lo que le dijo el cerebro:

- **seguir** → camina hacia vos, pero frena a 42 píxeles para no pegarse
- **huir** → se pone del otro lado tuyo, lejos del enemigo (mitad "me alejo",
  mitad "no te pierdo")
- **señalar** → se queda quieto mirando lo que encontró

Y un detalle honesto: si te alejás más de 9 casillas (cambiaste de mapa, o quedó
atrapado atrás de un árbol), **Chispa aparece al lado tuyo de la nada**.

Es trampa, sí. Y está bien. Un amigo que se pierde para siempre y te arruina
la partida es peor que un amigo que hace un poco de trampa.
**Los juegos hacen trampa a favor tuyo todo el tiempo.**

---

## El enchufe 🔌

`js/amigo/cerebro.js` es el archivo más chiquito y el más importante.

El cuerpo nunca le pregunta a `decision.js` directamente. Le pregunta **al cerebro**:

```js
Cerebro.pensar(percepcion, memoria)  →  { accion: "huir", frase: "¡Corré!" }
```

Esa pregunta se llama **contrato** o **interfaz**. Es una promesa:
*"vos dame un resumen del mundo, yo te devuelvo qué hacer."*

**Mientras se cumpla el contrato, adentro puede haber cualquier cosa.**

Hoy adentro hay una lista de ideas con notas. Mañana podría haber un modelo
de inteligencia artificial de verdad, de esos que escriben textos. Y el cuerpo
del amigo **ni se enteraría**: sigue haciendo la misma pregunta.

En `cerebro.js` está la plantilla de cómo sería, apagada. No está prendida por
dos razones honestas:

1. **Haría falta un servidor con una clave secreta.** Una clave nunca puede ir
   adentro de una página web: cualquiera que abra el código la puede leer y
   gastar tu plata. Hace falta un intermediario.
2. **Este juego tiene que andar con doble clic y sin internet.** Eso es una
   decisión de diseño, no una limitación.

Poder cambiar una pieza sin romper las otras es, básicamente, de qué se trata
programar bien.

---

## Las perillas de Chispa

En `js/config.js`:

```js
AMIGO_ACTIVADO: true,              // false = se va
NOMBRE_AMIGO: "Chispa",
AMIGO_VELOCIDAD: 2.6,              // más rápido que vos, para alcanzarte
AMIGO_DISTANCIA: 42,               // 5 = se te pega encima, 200 = te abandona
AMIGO_PENSAMIENTOS_POR_SEGUNDO: 6, // probá 1: se vuelve lento de reflejos
AMIGO_PAUSA_ENTRE_FRASES: 2800,
AMIGO_NO_REPETIR: 15000,
```

Poné `AMIGO_PENSAMIENTOS_POR_SEGUNDO: 1` y jugá. Chispa se va a dar cuenta
del peligro **un segundo tarde**. Vas a sentir en el cuerpo qué significa
"tiempo de reacción" en una IA.

---

## 🎯 Tu misión: inventale una idea nueva

Agregá esto a la lista de `ideas` en `js/amigo/decision.js`:

```js
{
  nombre: "agua",
  puntaje: (p, m) => (p.mapa === "bosque" ? 50 : 0),
  accion: "seguir",
  frases: [
    "No sé nadar, eh",
    "El agua es sólida acá. Cosas de videojuegos",
  ],
},
```

F5, andá al bosque. **No tocaste ninguna otra idea y el comportamiento cambió.**

Eso es lo que hace que este sistema sea bueno.

Ahora inventá tres ideas tuyas. Algunas para pensar:
- que te avise cuando tenés muchas monedas
- que diga algo distinto si te lastimaron 3 veces en el mismo mapa
- que te chicanee si estás quieto mucho rato
- que se ponga contento cuando rompés un enemigo con el garrote
