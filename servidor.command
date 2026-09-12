#!/bin/bash
# ============================================================
# ARRANCAR EL JUEGO CON UN SERVIDOR LOCAL
# ============================================================
# Normalmente alcanza con hacer doble clic en index.html.
#
# Este script es el plan B: levanta un servidor chiquito en tu
# propia compu y abre el juego desde ahi.
#
# Sirve si algun dibujo no carga, o si algun dia agregamos cosas
# que el navegador solo permite por "http://" y no por "archivo://".
#
# Doble clic en este archivo y listo. Para cortarlo: Ctrl+C.
# ============================================================

cd "$(dirname "$0")" || exit 1

PUERTO=8000
echo ""
echo "  Arrancando el servidor del juego..."
echo "  Abrí:  http://localhost:$PUERTO"
echo "  Taller: http://localhost:$PUERTO/taller/recortar.html"
echo ""
echo "  (para cortarlo, apretá Ctrl+C)"
echo ""

sleep 1
open "http://localhost:$PUERTO" 2>/dev/null

python3 -m http.server $PUERTO
