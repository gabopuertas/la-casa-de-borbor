# Dónde va cada dibujo

Los nombres tienen que ser **exactos**, todo en minúscula y sin acentos.
Para la computadora `heroe.png` y `Heroe.PNG` son archivos distintos.

```
imagenes/
│
├── personajes/
│     heroe.png          ✅ ¡YA ESTÁ! el robot amarillo
│     heroe-1.png        ← opcional: paso 1 de la caminata
│     heroe-2.png        ← opcional: paso 2 de la caminata
│     amigo.png          ✅ ¡YA ESTÁ! Chispa, el robot volador
│     heroe-abajo.png    ← opcional: de frente
│     heroe-arriba.png   ← opcional: de espaldas
│     heroe-izq.png      ← opcional: mirando a la izquierda
│     heroe-der.png      ← opcional: mirando a la derecha
│
├── enemigos/
│     baboso.png         el lento, va y viene
│     sombra.png         el que te persigue
│
├── objetos/
│     moneda.png
│     llave.png
│     cofre.png
│     corazon.png
│     garrote.png       ✅ ¡YA ESTÁ! lo hizo BorBor
│
└── suelo/
      pasto.png          ⚠️ tiene que ser TILEABLE (se repite 400 veces)
      flores.png
      camino.png
      piedra.png         las paredes
      arbol.png
      agua.png
      puerta.png         la que se abre con llave
      portal.png         lleva al mapa siguiente
      meta.png           el final del juego
```

**Siempre PNG** (el JPG no sabe guardar transparencia).
Tamaño recomendado: **64 × 64**.

Para hacerlos: abrí `taller/recortar.html`.
