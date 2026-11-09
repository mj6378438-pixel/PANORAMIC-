import { Pressable, StyleSheet, Text, View } from 'react-native';
import { buscarCategoria } from '../lib/categorias';
import { formatoDinero, formatoFecha } from '../lib/formato';
import { colores } from '../lib/tema';
import { Movimiento } from '../lib/types';

interface Props {
  movimiento: Movimiento;
  onPress?: (m: Movimiento) => void;
}

export function ItemMovimiento({ movimiento, onPress }: Props) {
  const cat = buscarCategoria(movimiento.tipo, movimiento.categoria);
  const esIngreso = movimiento.tipo === 'ingreso';
  return (
    <Pressable
      onPress={() => onPress?.(movimiento)}
      style={({ pressed }) => [estilos.fila, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
      accessibilityLabel={`${movimiento.categoria} ${formatoDinero(movimiento.monto)}`}
    >
      <View style={[estilos.icono, { backgroundColor: cat.color + '22' }]}>
        <Text style={estilos.emoji}>{cat.icono}</Text>
      </View>
      <View style={estilos.centro}>
        <Text style={estilos.titulo} numberOfLines={1}>
          {movimiento.descripcion || movimiento.categoria}
        </Text>
        <Text style={estilos.sub}>
          {movimiento.categoria} · {formatoFecha(movimiento.fecha)}
        </Text>
      </View>
      <Text style={[estilos.monto, { color: esIngreso ? colores.ingreso : colores.gasto }]}>
        {esIngreso ? '+' : '-'}
        {formatoDinero(movimiento.monto)}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    marginBottom: 8,
  },
  icono: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: { fontSize: 20 },
  centro: { flex: 1, marginRight: 8 },
  titulo: { fontSize: 15, fontWeight: '600', color: colores.texto },
  sub: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  monto: { fontSize: 15, fontWeight: '700' },
});
