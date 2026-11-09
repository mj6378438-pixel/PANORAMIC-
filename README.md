# Gestor Económico 💰

App móvil (iOS / Android) para gestionar tus finanzas personales, hecha con **Expo + React Native + TypeScript**.

## Funcionalidades

- **Inicio**: balance total, ingresos y gastos del mes, accesos rápidos para registrar ingresos/gastos y últimos movimientos.
- **Movimientos**: lista por mes, con buscador y filtro (todos / ingresos / gastos). Toca un movimiento para editarlo o eliminarlo.
- **Estadísticas**: ahorro y tasa de ahorro del mes, gráfico de los últimos 6 meses y desglose por categoría.
- **Apartados** 🎯: divide tu dinero por categorías (Vivienda, Comida, Ocio, Restaurantes, Suscripciones…) con un límite mensual para cada una. Incluye **reparto automático 50/30/20** (50 % necesidades, 30 % ocio y deseos, 20 % ahorro) y avisos cuando un apartado llega al 80 % o se excede.
- **Formulario rápido**: botones Hoy / Ayer / Hace 1 semana y aviso en tiempo real de cuánto te queda en el apartado elegido.
- **Ajustes**: moneda (€, $, S/, £…), meta de ahorro mensual, exportación a Excel (CSV) y borrado de datos.
- Los datos se guardan **en el dispositivo** (AsyncStorage), sin necesidad de cuenta ni internet.

## Descargar la app (Android)

Cada vez que se sube código a GitHub se compila automáticamente un **APK**.
Ve a la pestaña **Releases** del repositorio, descarga el archivo `GestorEconomico-….apk` y ábrelo en tu móvil
(si te lo pide, permite «Instalar apps desconocidas»).

En iPhone: instala **Expo Go** y ejecuta la app con `npm start` (ver abajo).

## Cómo ejecutarla (desarrollo)

```bash
npm install
npm start          # abre Expo; escanea el QR con la app Expo Go en tu móvil
npm run android    # emulador Android
npm run ios        # simulador iOS (macOS)
npm run web        # versión web para probar en el navegador
```

## Estructura

```
App.tsx                      # navegación por pestañas y modal de formulario
src/lib/store.tsx            # estado global + persistencia
src/lib/categorias.ts        # categorías de ingresos y gastos
src/lib/formato.ts           # formato de dinero, fechas y meses
src/components/              # ItemMovimiento, FormularioMovimiento, SelectorMes
src/screens/                 # Inicio, Movimientos, Presupuestos, Estadisticas, Ajustes
.github/workflows/           # compilación automática del APK
```
