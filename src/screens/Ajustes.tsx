import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { DialogoMonto } from '../components/DialogoMonto';
import { formatoDinero, MONEDAS } from '../lib/formato';
import { aCSV, useFinanzas } from '../lib/store';
import { colores } from '../lib/tema';

interface Props {
  onVerPresupuestos: () => void;
}

export function Ajustes({ onVerPresupuestos }: Props) {
  const {
    movimientos,
    presupuestoTotal,
    metaAhorro,
    moneda,
    definirMetaAhorro,
    definirMoneda,
    borrarTodo,
  } = useFinanzas();
  const [dialogoMeta, setDialogoMeta] = useState(false);

  const exportar = async () => {
    if (movimientos.length === 0) {
      Alert.alert('Sin datos', 'Todavía no hay movimientos para exportar.');
      return;
    }
    const csv = aCSV(movimientos);
    if (Platform.OS === 'web') {
      // En la web se descarga como archivo
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gestor-economico.csv';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    try {
      await Share.share({ title: 'Movimientos (CSV)', message: csv });
    } catch {
      Alert.alert('Error', 'No se pudo compartir el archivo.');
    }
  };

  const confirmarBorrado = () => {
    const ejecutar = () => borrarTodo();
    if (Platform.OS === 'web') {
      if (window.confirm('¿Borrar todos los movimientos y presupuestos?')) ejecutar();
      return;
    }
    Alert.alert(
      'Borrar todos los datos',
      'Se eliminarán todos los movimientos, presupuestos y la meta de ahorro. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar todo', style: 'destructive', onPress: ejecutar },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>Moneda</Text>
        <View style={estilos.chips}>
          {MONEDAS.map((m) => {
            const activa = m.codigo === moneda;
            return (
              <Pressable
                key={m.codigo}
                onPress={() => definirMoneda(m.codigo)}
                style={[estilos.chip, activa && estilos.chipActivo]}
              >
                <Text style={[estilos.chipTexto, activa && { color: '#fff' }]}>
                  {m.simbolo} {m.codigo}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable style={estilos.tarjeta} onPress={onVerPresupuestos}>
        <View style={estilos.filaEntre}>
          <Text style={estilos.titulo}>Presupuestos por apartado</Text>
          <Text style={estilos.enlace}>Editar ›</Text>
        </View>
        <Text style={estilos.suave}>
          {presupuestoTotal > 0
            ? `Total mensual: ${formatoDinero(presupuestoTotal)}`
            : 'Aún no has dividido tu dinero en apartados.'}
        </Text>
      </Pressable>

      <Pressable style={estilos.tarjeta} onPress={() => setDialogoMeta(true)}>
        <View style={estilos.filaEntre}>
          <Text style={estilos.titulo}>Meta de ahorro mensual</Text>
          <Text style={estilos.enlace}>Editar ›</Text>
        </View>
        <Text style={estilos.suave}>
          {metaAhorro > 0 ? formatoDinero(metaAhorro) : 'Sin meta definida'}
        </Text>
      </Pressable>

      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>Datos</Text>
        <Text style={estilos.suave}>
          {movimientos.length} movimiento(s) guardados solo en este dispositivo.
        </Text>
        <Pressable style={estilos.boton} onPress={exportar}>
          <Text style={estilos.botonTexto}>📤 Exportar a Excel (CSV)</Text>
        </Pressable>
        <Pressable style={[estilos.boton, estilos.peligro]} onPress={confirmarBorrado}>
          <Text style={[estilos.botonTexto, { color: colores.gasto }]}>Borrar todos los datos</Text>
        </Pressable>
      </View>

      <Text style={estilos.version}>Gestor Económico · v1.1.0</Text>

      <DialogoMonto
        visible={dialogoMeta}
        titulo="Meta de ahorro mensual"
        mensaje="Cuánto quieres ahorrar cada mes. Déjalo vacío para quitarla."
        valorInicial={metaAhorro}
        onAceptar={(v) => {
          definirMetaAhorro(v);
          setDialogoMeta(false);
        }}
        onCancelar={() => setDialogoMeta(false)}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, paddingBottom: 32 },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: 16, padding: 16, marginBottom: 12 },
  titulo: { fontSize: 16, fontWeight: '700', color: colores.texto, marginBottom: 4 },
  suave: { color: colores.textoSuave, fontSize: 13, lineHeight: 18 },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  enlace: { color: colores.primario, fontWeight: '600', fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  chipTexto: { color: colores.texto, fontWeight: '600', fontSize: 13 },
  boton: {
    marginTop: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  botonTexto: { color: colores.primario, fontWeight: '700', fontSize: 15 },
  peligro: { backgroundColor: '#FEE2E2' },
  version: { textAlign: 'center', color: colores.textoSuave, fontSize: 12, marginTop: 12 },
});
