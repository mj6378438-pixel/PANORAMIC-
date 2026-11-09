#!/usr/bin/env python3
"""Pequeña ayuda para pruebas en el emulador vía adb + uiautomator.

Uso:
  python3 scripts/ui.py tap "Texto"        # toca el elemento con ese texto exacto
  python3 scripts/ui.py tap "Texto" --contiene
  python3 scripts/ui.py existe "Texto"     # sale con 0 si el texto está en pantalla
"""
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET


def adb(*args: str) -> str:
    return subprocess.run(["adb", *args], capture_output=True, text=True).stdout


def nodos():
    adb("shell", "uiautomator", "dump", "/sdcard/ui.xml")
    xml = adb("shell", "cat", "/sdcard/ui.xml")
    inicio = xml.find("<?xml")
    if inicio < 0:
        return []
    try:
        raiz = ET.fromstring(xml[inicio:].strip())
    except ET.ParseError:
        return []
    return list(raiz.iter("node"))


def cerrar_avisos_sistema(lista) -> bool:
    """Cierra diálogos del sistema del emulador («X isn't responding»)."""
    if not any("isn't responding" in (n.get("text") or "") or "no responde" in (n.get("text") or "")
               for n in lista):
        return False
    for n in lista:
        if (n.get("text") or "") in ("Wait", "Esperar"):
            m = re.findall(r"\d+", n.get("bounds", ""))
            if len(m) == 4:
                x1, y1, x2, y2 = map(int, m)
                adb("shell", "input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
                print("ℹ️  Cerrado aviso del sistema del emulador", file=sys.stderr)
                time.sleep(1.5)
                return True
    return False


def buscar(texto: str, contiene: bool):
    lista = nodos()
    if cerrar_avisos_sistema(lista):
        lista = nodos()
    for n in lista:
        for attr in ("text", "content-desc"):
            v = (n.get(attr) or "").strip()
            if not v:
                continue
            if (contiene and texto in v) or (not contiene and v == texto):
                m = re.findall(r"\d+", n.get("bounds", ""))
                if len(m) == 4:
                    x1, y1, x2, y2 = map(int, m)
                    return (x1 + x2) // 2, (y1 + y2) // 2
    return None


def main():
    accion, texto = sys.argv[1], sys.argv[2]
    contiene = "--contiene" in sys.argv
    for _ in range(15):
        pos = buscar(texto, contiene)
        if pos:
            if accion == "tap":
                adb("shell", "input", "tap", str(pos[0]), str(pos[1]))
                time.sleep(1.2)
            print(f"OK {accion} '{texto}' en {pos}")
            return 0
        time.sleep(1)
    print(f"ERROR: no se encontró '{texto}' en pantalla", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
