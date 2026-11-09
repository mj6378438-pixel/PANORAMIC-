import { StyleSheet, View } from 'react-native';
import { colores } from '../lib/tema';

/** Color según el % usado de un presupuesto */
export function colorUso(uso: number, base: string = colores.ingreso): string {
  if (uso >= 1) return colores.gasto;
  if (uso >= 0.8) return '#F59E0B';
  return base;
}

export function BarraProgreso({ uso, color, alto = 8 }: { uso: number; color?: string; alto?: number }) {
  return (
    <View style={[estilos.fondo, { height: alto, borderRadius: alto / 2 }]}>
      <View
        style={{
          width: `${Math.max(0, Math.min(uso, 1)) * 100}%`,
          height: '100%',
          borderRadius: alto / 2,
          backgroundColor: color ?? colorUso(uso),
        }}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { backgroundColor: colores.borde, overflow: 'hidden' },
});
