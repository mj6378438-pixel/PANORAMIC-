import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { FormularioMovimiento } from './src/components/FormularioMovimiento';
import { ProveedorFinanzas, useFinanzas } from './src/lib/store';
import { colores } from './src/lib/tema';
import { Movimiento, TipoMovimiento } from './src/lib/types';
import { Ajustes } from './src/screens/Ajustes';
import { Estadisticas } from './src/screens/Estadisticas';
import { Inicio } from './src/screens/Inicio';
import { Movimientos } from './src/screens/Movimientos';

type Pestana = 'inicio' | 'movimientos' | 'estadisticas' | 'ajustes';

const PESTANAS: { id: Pestana; titulo: string; icono: string }[] = [
  { id: 'inicio', titulo: 'Inicio', icono: '🏠' },
  { id: 'movimientos', titulo: 'Movimientos', icono: '📋' },
  { id: 'estadisticas', titulo: 'Estadísticas', icono: '📊' },
  { id: 'ajustes', titulo: 'Ajustes', icono: '⚙️' },
];

function Contenido() {
  const { cargando } = useFinanzas();
  const [pestana, setPestana] = useState<Pestana>('inicio');
  const [formVisible, setFormVisible] = useState(false);
  const [editando, setEditando] = useState<Movimiento | null>(null);
  const [tipoNuevo, setTipoNuevo] = useState<TipoMovimiento>('gasto');

  const abrirNuevo = (tipo: TipoMovimiento) => {
    setEditando(null);
    setTipoNuevo(tipo);
    setFormVisible(true);
  };
  const abrirEdicion = (m: Movimiento) => {
    setEditando(m);
    setFormVisible(true);
  };

  if (cargando) {
    return (
      <View style={[estilos.raiz, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const titulo = PESTANAS.find((p) => p.id === pestana)!.titulo;

  return (
    <SafeAreaView style={estilos.raiz} edges={['top']}>
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo}>{pestana === 'inicio' ? 'Gestor Económico' : titulo}</Text>
        {pestana !== 'ajustes' && (
          <Pressable style={estilos.fab} onPress={() => abrirNuevo('gasto')} accessibilityLabel="Nuevo movimiento">
            <Text style={estilos.fabTexto}>+</Text>
          </Pressable>
        )}
      </View>

      <View style={{ flex: 1 }}>
        {pestana === 'inicio' && (
          <Inicio onNuevo={abrirNuevo} onEditar={abrirEdicion} onVerTodo={() => setPestana('movimientos')} />
        )}
        {pestana === 'movimientos' && <Movimientos onEditar={abrirEdicion} />}
        {pestana === 'estadisticas' && <Estadisticas />}
        {pestana === 'ajustes' && <Ajustes />}
      </View>

      <SafeAreaView edges={['bottom']} style={estilos.barraPestanas}>
        {PESTANAS.map((p) => {
          const activa = p.id === pestana;
          return (
            <Pressable
              key={p.id}
              style={estilos.pestana}
              onPress={() => setPestana(p.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
            >
              <Text style={[estilos.pestanaIcono, !activa && { opacity: 0.45 }]}>{p.icono}</Text>
              <Text style={[estilos.pestanaTexto, activa && { color: colores.primario, fontWeight: '700' }]}>
                {p.titulo}
              </Text>
            </Pressable>
          );
        })}
      </SafeAreaView>

      <FormularioMovimiento
        visible={formVisible}
        editando={editando}
        tipoInicial={tipoNuevo}
        onCerrar={() => setFormVisible(false)}
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ProveedorFinanzas>
        <Contenido />
      </ProveedorFinanzas>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colores.fondo },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  titulo: { fontSize: 26, fontWeight: '800', color: colores.texto },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabTexto: { color: '#fff', fontSize: 26, fontWeight: '600', marginTop: -2 },
  barraPestanas: {
    flexDirection: 'row',
    backgroundColor: colores.tarjeta,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  pestana: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  pestanaIcono: { fontSize: 20 },
  pestanaTexto: { fontSize: 11, color: colores.textoSuave, marginTop: 2 },
});
