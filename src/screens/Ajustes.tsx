import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatoDinero, parsearMonto } from '../lib/formato';
import { useFinanzas } from '../lib/store';
import { colores } from '../lib/tema';

export function Ajustes() {
  const { presupuesto, definirPresupuesto, borrarTodo, movimientos } = useFinanzas();
  const [texto, setTexto] = useState(presupuesto > 0 ? String(presupuesto).replace('.', ',') : '');

  useEffect(() => {
    setTexto(presupuesto > 0 ? String(presupuesto).replace('.', ',') : '');
  }, [presupuesto]);

  const guardarPresupuesto = () => {
    if (texto.trim() === '') {
      definirPresupuesto(0);
      Alert.alert('Presupuesto eliminado');
      return;
    }
    const valor = parsearMonto(texto);
    if (!(valor > 0)) {
      Alert.alert('Valor inválido', 'Introduce un número mayor que 0, o déjalo vacío para quitarlo.');
      return;
    }
    definirPresupuesto(Math.round(valor * 100) / 100);
    Alert.alert('Guardado', `Presupuesto mensual: ${formatoDinero(valor)}`);
  };

  const confirmarBorrado = () => {
    Alert.alert(
      'Borrar todos los datos',
      'Se eliminarán todos los movimientos y el presupuesto. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar todo', style: 'destructive', onPress: borrarTodo },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>Presupuesto mensual de gastos</Text>
        <Text style={estilos.suave}>
          Te avisaremos en Inicio cuando te acerques o superes este límite.
        </Text>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Ej. 1500"
          keyboardType="decimal-pad"
          style={estilos.input}
        />
        <Pressable style={estilos.boton} onPress={guardarPresupuesto}>
          <Text style={estilos.botonTexto}>Guardar presupuesto</Text>
        </Pressable>
      </View>

      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>Datos</Text>
        <Text style={estilos.suave}>
          {movimientos.length} movimiento(s) guardados en este dispositivo.
        </Text>
        <Pressable style={[estilos.boton, estilos.peligro]} onPress={confirmarBorrado}>
          <Text style={[estilos.botonTexto, { color: colores.gasto }]}>Borrar todos los datos</Text>
        </Pressable>
      </View>

      <Text style={estilos.version}>Gestor Económico · v1.0.0</Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, paddingBottom: 32 },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: 16, padding: 16, marginBottom: 12 },
  titulo: { fontSize: 16, fontWeight: '700', color: colores.texto, marginBottom: 4 },
  suave: { color: colores.textoSuave, fontSize: 13, lineHeight: 18 },
  input: {
    marginTop: 12,
    backgroundColor: colores.fondo,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    color: colores.texto,
  },
  boton: {
    marginTop: 12,
    backgroundColor: colores.primario,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  botonTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  peligro: { backgroundColor: '#FEE2E2' },
  version: { textAlign: 'center', color: colores.textoSuave, fontSize: 12, marginTop: 12 },
});
