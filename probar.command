#!/bin/bash
# ============================================================
# CORRER LAS PRUEBAS DEL JUEGO
# ============================================================
# Doble clic en este archivo y se prueba todo solo.
#
# Esto NO hace falta para jugar ni para dibujar. Es para cuando
# tocas el codigo y queres estar seguro de que no rompiste nada.
# ============================================================

cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "  Falta Node.js para correr las pruebas."
  echo "  Se baja de https://nodejs.org (el juego anda igual sin esto)."
  echo ""
  read -r -p "  Enter para cerrar..."
  exit 1
fi

node pruebas/correr-todo.js
codigo=$?

echo ""
read -r -p "  Enter para cerrar..."
exit $codigo
