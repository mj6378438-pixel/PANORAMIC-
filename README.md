# Gestor Económico 💰

App móvil (iOS / Android) para gestionar tus finanzas personales, hecha con **Expo + React Native + TypeScript**.

## Funcionalidades

- **Inicio**: balance total, ingresos y gastos del mes, accesos rápidos para registrar ingresos/gastos y últimos movimientos.
- **Movimientos**: lista por mes, con buscador y filtro (todos / ingresos / gastos). Toca un movimiento para editarlo o eliminarlo.
- **Estadísticas**: ahorro y tasa de ahorro del mes, gráfico de los últimos 6 meses y desglose por categoría.
- **Ajustes**: presupuesto mensual de gastos (con barra de progreso y aviso en Inicio) y borrado de datos.
- Los datos se guardan **en el dispositivo** (AsyncStorage), sin necesidad de cuenta ni internet.

## Cómo ejecutarla

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
src/screens/                 # Inicio, Movimientos, Estadisticas, Ajustes
```
