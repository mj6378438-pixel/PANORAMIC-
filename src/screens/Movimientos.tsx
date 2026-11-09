import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ItemMovimiento } from '../components/ItemMovimiento';
import { SelectorMes } from '../components/SelectorMes';
import { claveMes, formatoDinero, hoyISO } from '../lib/formato';
import { ordenar, resumen, useFinanzas } from '../lib/store';
import { colores } from '../lib/tema';
import { Movimiento } from '../lib/types';

type Filtro = 'todos' | 'ingreso' | 'gasto';

interface Props {
  onEditar: (m: Movimiento) => void;
}

export function Movimientos({ onEditar }: Props) {
  const { movimientos } = useFinanzas();
  const [mes, setMes] = useState(claveMes(hoyISO()));
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busqueda, setBusqueda] = useState('');

  const delMes = useMemo(
    () => ordenar(movimientos.filter((m) => claveMes(m.fecha) === mes)),
    [movimientos, mes],
  );
  const totales = useMemo(() => resumen(delMes), [delMes]);

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return delMes.filter(
      (m) =>
        (filtro === 'todos' || m.tipo === filtro) &&
        (q === '' ||
          m.descripcion.toLowerCase().includes(q) ||
          m.categoria.toLowerCase().includes(q)),
    );
  }, [delMes, filtro, busqueda]);

  return (
    <FlatList
      data={lista}
      keyExtractor={(m) => m.id}
      renderItem={({ item }) => <ItemMovimiento movimiento={item} onPress={onEditar} />}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          <SelectorMes mes={mes} onCambiar={setMes} />
          <View style={estilos.totales}>
            <Text style={[estilos.total, { color: colores.ingreso }]}>
              +{formatoDinero(totales.ingresos)}
            </Text>
            <Text style={[estilos.total, { color: colores.gasto }]}>
              -{formatoDinero(totales.gastos)}
            </Text>
            <Text style={[estilos.total, { color: colores.texto }]}>
              = {formatoDinero(totales.balance)}
            </Text>
          </View>
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por descripción o categoría"
            style={estilos.buscador}
            clearButtonMode="while-editing"
          />
          <View style={estilos.filtros}>
            {(
              [
                ['todos', 'Todos'],
                ['ingreso', 'Ingresos'],
                ['gasto', 'Gastos'],
              ] as [Filtro, string][]
            ).map(([valor, texto]) => (
              <Pressable
                key={valor}
                onPress={() => setFiltro(valor)}
                style={[estilos.filtro, filtro === valor && estilos.filtroActivo]}
              >
                <Text style={[estilos.filtroTexto, filtro === valor && { color: '#fff' }]}>
                  {texto}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={
        <Text style={estilos.vacio}>No hay movimientos para mostrar en este mes.</Text>
      }
    />
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, paddingBottom: 32 },
  totales: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  total: { fontWeight: '700', fontSize: 14 },
  buscador: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colores.borde,
    color: colores.texto,
  },
  filtros: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  filtro: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  filtroActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  filtroTexto: { color: colores.texto, fontWeight: '600', fontSize: 13 },
  vacio: { textAlign: 'center', color: colores.textoSuave, marginTop: 32 },
});
