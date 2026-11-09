#!/usr/bin/env bash
# Prueba de humo del APK en un emulador Android (se ejecuta en GitHub Actions).
# Instala la app, recorre el flujo principal, hace capturas y comprueba que no se cierre.
set -uo pipefail

APK="$1"
PKG=com.gestoreconomico.app
OUT=capturas
mkdir -p "$OUT"
FALLOS=0

ui() { python3 scripts/ui.py "$@" || FALLOS=$((FALLOS + 1)); }
foto() { adb exec-out screencap -p > "$OUT/$1.png"; echo "📸 $1"; }
escribir() { adb shell input text "$1"; sleep 0.8; }
ocultar_teclado() { adb shell input keyevent 4; sleep 0.8; }

adb logcat -c
echo "== Instalando $APK"
adb install -r "$APK" || { echo "ERROR: no se pudo instalar"; exit 1; }

echo "== Abriendo la app"
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null
sleep 15
foto 01-inicio-vacio
ui existe "Gestor Económico"

echo "== Añadir ingreso de 2000 (Salario)"
ui tap "+ Ingreso"
escribir 2000
ocultar_teclado
ui tap "Salario" --contiene
foto 02-formulario-ingreso
ui tap "Guardar"

echo "== Repartir automáticamente 50/30/20"
ui tap "Apartados"
ui tap "Repartir automáticamente" --contiene
sleep 1
foto 03-dialogo-reparto
ui tap "Repartir"
sleep 1
foto 04-apartados

echo "== Añadir gastos"
ui tap "Inicio"
ui tap "− Gasto"
escribir 800
ocultar_teclado
ui tap "Vivienda" --contiene
foto 05-formulario-gasto-aviso
ui tap "Guardar"

ui tap "− Gasto"
escribir 200
ocultar_teclado
ui tap "Ocio" --contiene
ui tap "Guardar"
foto 06-inicio-con-datos
ui existe "Vivienda: te pasaste" --contiene

echo "== Otras pantallas"
ui tap "Movimientos"
foto 07-movimientos
ui tap "Estadísticas"
foto 08-estadisticas
ui tap "Ajustes"
foto 09-ajustes

echo "== Comprobar que los datos se guardan al cerrar y reabrir"
adb shell am force-stop "$PKG"
sleep 2
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null
sleep 12
foto 10-reabierta
ui existe "1.000,00 €" --contiene

echo "== Revisar errores"
adb logcat -d > "$OUT/logcat.txt"
if grep -E "FATAL EXCEPTION|ReactNativeJS.*(Error|TypeError)" "$OUT/logcat.txt" | grep -v "^--" ; then
  echo "ERROR: se detectaron errores en el log"
  FALLOS=$((FALLOS + 1))
fi
if [ -z "$(adb shell pidof $PKG)" ]; then
  echo "ERROR: la app no está en ejecución (posible cierre)"
  FALLOS=$((FALLOS + 1))
fi

echo "== Resultado: $FALLOS fallo(s)"
exit $FALLOS
