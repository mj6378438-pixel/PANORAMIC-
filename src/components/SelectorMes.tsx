import { Pressable, StyleSheet, Text, View } from 'react-native';
import { moverMes, nombreMes } from '../lib/formato';
import { colores } from '../lib/tema';

interface Props {
  mes: string;
  onCambiar: (mes: string) => void;
}

export function SelectorMes({ mes, onCambiar }: Props) {
  return (
    <View style={estilos.fila}>
      <Pressable onPress={() => onCambiar(moverMes(mes, -1))} hitSlop={12} style={estilos.flecha}>
        <Text style={estilos.flechaTexto}>‹</Text>
      </Pressable>
      <Text style={estilos.mes}>{nombreMes(mes)}</Text>
      <Pressable onPress={() => onCambiar(moverMes(mes, 1))} hitSlop={12} style={estilos.flecha}>
        <Text style={estilos.flechaTexto}>›</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 12,
  },
  flecha: { paddingHorizontal: 14, paddingVertical: 2 },
  flechaTexto: { fontSize: 28, color: colores.primario, fontWeight: '600' },
  mes: { fontSize: 16, fontWeight: '700', color: colores.texto },
});
