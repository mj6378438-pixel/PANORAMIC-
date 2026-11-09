import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ItemMovimiento } from '../components/ItemMovimiento';
import { claveMes, formatoDinero, hoyISO, nombreMes } from '../lib/formato';
import { ordenar, resumen, useFinanzas } from '../lib/store';
import { colores } from '../lib/tema';
import { Movimiento, TipoMovimiento } from '../lib/types';

interface Props {
  onNuevo: (tipo: TipoMovimiento) => void;
  onEditar: (m: Movimiento) => void;
  onVerTodo: () => void;
}

export function Inicio({ onNuevo, onEditar, onVerTodo }: Props) {
  const { movimientos, presupuesto } = useFinanzas();
  const mesActual = claveMes(hoyISO());

  const total = useMemo(() => resumen(movimientos), [movimientos]);
  const delMes = useMemo(
    () => resumen(movimientos.filter((m) => claveMes(m.fecha) === mesActual)),
    [movimientos, mesActual],
  );
  const recientes = useMemo(() => ordenar(movimientos).slice(0, 5), [movimientos]);

  const usoPresupuesto = presupuesto > 0 ? delMes.gastos / presupuesto : 0;
  const colorBarra =
    usoPresupuesto >= 1 ? colores.gasto : usoPresupuesto >= 0.8 ? '#F59E0B' : colores.ingreso;

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <View style={estilos.tarjetaBalance}>
        <Text style={estilos.balanceEtiqueta}>Balance total</Text>
        <Text style={estilos.balanceValor}>{formatoDinero(total.balance)}</Text>
        <Text style={estilos.balanceMes}>{nombreMes(mesActual)}</Text>
        <View style={estilos.filaResumen}>
          <View style={estilos.resumenCaja}>
            <Text style={estilos.resumenEtiqueta}>↑ Ingresos</Text>
            <Text style={estilos.resumenValor}>{formatoDinero(delMes.ingresos)}</Text>
          </View>
          <View style={estilos.resumenCaja}>
            <Text style={estilos.resumenEtiqueta}>↓ Gastos</Text>
            <Text style={estilos.resumenValor}>{formatoDinero(delMes.gastos)}</Text>
          </View>
        </View>
      </View>

      <View style={estilos.filaBotones}>
        <Pressable
          style={[estilos.boton, { backgroundColor: colores.ingreso }]}
          onPress={() => onNuevo('ingreso')}
        >
          <Text style={estilos.botonTexto}>+ Ingreso</Text>
        </Pressable>
        <Pressable
          style={[estilos.boton, { backgroundColor: colores.gasto }]}
          onPress={() => onNuevo('gasto')}
        >
          <Text style={estilos.botonTexto}>− Gasto</Text>
        </Pressable>
      </View>

      {presupuesto > 0 && (
        <View style={estilos.tarjeta}>
          <View style={estilos.filaEntre}>
            <Text style={estilos.tituloSeccion}>Presupuesto del mes</Text>
            <Text style={estilos.textoSuave}>{Math.round(usoPresupuesto * 100)}%</Text>
          </View>
          <View style={estilos.barraFondo}>
            <View
              style={[
                estilos.barra,
                { width: `${Math.min(usoPresupuesto, 1) * 100}%`, backgroundColor: colorBarra },
              ]}
            />
          </View>
          <Text style={estilos.textoSuave}>
            {formatoDinero(delMes.gastos)} de {formatoDinero(presupuesto)} ·{' '}
            {presupuesto - delMes.gastos >= 0
              ? `quedan ${formatoDinero(presupuesto - delMes.gastos)}`
              : `te pasaste ${formatoDinero(delMes.gastos - presupuesto)}`}
          </Text>
        </View>
      )}

      <View style={[estilos.filaEntre, { marginTop: 8, marginBottom: 10 }]}>
        <Text style={estilos.tituloSeccion}>Últimos movimientos</Text>
        {movimientos.length > 0 && (
          <Pressable onPress={onVerTodo} hitSlop={8}>
            <Text style={{ color: colores.primario, fontWeight: '600' }}>Ver todo</Text>
          </Pressable>
        )}
      </View>

      {recientes.length === 0 ? (
        <View style={estilos.vacio}>
          <Text style={estilos.vacioEmoji}>💸</Text>
          <Text style={estilos.vacioTexto}>
            Aún no hay movimientos.{'\n'}Registra tu primer ingreso o gasto.
          </Text>
        </View>
      ) : (
        recientes.map((m) => <ItemMovimiento key={m.id} movimiento={m} onPress={onEditar} />)
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, paddingBottom: 32 },
  tarjetaBalance: {
    backgroundColor: colores.primario,
    borderRadius: 20,
    padding: 20,
  },
  balanceEtiqueta: { color: '#C7D2FE', fontSize: 14 },
  balanceValor: { color: '#fff', fontSize: 34, fontWeight: '800', marginTop: 4 },
  balanceMes: { color: '#C7D2FE', fontSize: 13, marginTop: 14 },
  filaResumen: { flexDirection: 'row', gap: 10, marginTop: 8 },
  resumenCaja: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12 },
  resumenEtiqueta: { color: '#E0E7FF', fontSize: 12 },
  resumenValor: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 2 },
  filaBotones: { flexDirection: 'row', gap: 10, marginVertical: 14 },
  boton: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  botonTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: 16, padding: 16, marginBottom: 12 },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tituloSeccion: { fontSize: 16, fontWeight: '700', color: colores.texto },
  textoSuave: { color: colores.textoSuave, fontSize: 13 },
  barraFondo: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colores.borde,
    overflow: 'hidden',
    marginVertical: 10,
  },
  barra: { height: '100%', borderRadius: 5 },
  vacio: { alignItems: 'center', paddingVertical: 32 },
  vacioEmoji: { fontSize: 40 },
  vacioTexto: { color: colores.textoSuave, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
