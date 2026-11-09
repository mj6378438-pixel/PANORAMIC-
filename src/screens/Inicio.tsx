import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarraProgreso, colorUso } from '../components/BarraProgreso';
import { ItemMovimiento } from '../components/ItemMovimiento';
import { buscarCategoria } from '../lib/categorias';
import { claveMes, formatoDinero, hoyISO, nombreMes } from '../lib/formato';
import { gastoPorCategoria, ordenar, resumen, useFinanzas } from '../lib/store';
import { colores } from '../lib/tema';
import { Movimiento, TipoMovimiento } from '../lib/types';

interface Props {
  onNuevo: (tipo: TipoMovimiento) => void;
  onEditar: (m: Movimiento) => void;
  onVerTodo: () => void;
  onVerPresupuestos: () => void;
}

export function Inicio({ onNuevo, onEditar, onVerTodo, onVerPresupuestos }: Props) {
  const { movimientos, presupuestos, presupuestoTotal: presupuesto } = useFinanzas();
  const mesActual = claveMes(hoyISO());

  const total = useMemo(() => resumen(movimientos), [movimientos]);
  const delMes = useMemo(
    () => resumen(movimientos.filter((m) => claveMes(m.fecha) === mesActual)),
    [movimientos, mesActual],
  );
  const recientes = useMemo(() => ordenar(movimientos).slice(0, 5), [movimientos]);

  // Apartados que van por encima del 80 % de su límite este mes
  const alertas = useMemo(() => {
    const gastado = gastoPorCategoria(movimientos.filter((m) => claveMes(m.fecha) === mesActual));
    return Object.entries(presupuestos)
      .map(([nombre, limite]) => ({ nombre, limite, gastado: gastado[nombre] ?? 0 }))
      .filter((a) => a.limite > 0 && a.gastado / a.limite >= 0.8)
      .sort((a, b) => b.gastado / b.limite - a.gastado / a.limite);
  }, [movimientos, presupuestos, mesActual]);

  const usoPresupuesto = presupuesto > 0 ? delMes.gastos / presupuesto : 0;

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

      {presupuesto > 0 ? (
        <Pressable style={estilos.tarjeta} onPress={onVerPresupuestos}>
          <View style={estilos.filaEntre}>
            <Text style={estilos.tituloSeccion}>Presupuesto del mes</Text>
            <Text style={estilos.textoSuave}>{Math.round(usoPresupuesto * 100)}% ›</Text>
          </View>
          <View style={{ marginVertical: 10 }}>
            <BarraProgreso uso={usoPresupuesto} alto={10} />
          </View>
          <Text style={estilos.textoSuave}>
            {formatoDinero(delMes.gastos)} de {formatoDinero(presupuesto)} ·{' '}
            {presupuesto - delMes.gastos >= 0
              ? `quedan ${formatoDinero(presupuesto - delMes.gastos)}`
              : `te pasaste ${formatoDinero(delMes.gastos - presupuesto)}`}
          </Text>
          {alertas.map((a) => {
            const cat = buscarCategoria('gasto', a.nombre);
            const uso = a.gastado / a.limite;
            return (
              <View key={a.nombre} style={estilos.alerta}>
                <Text style={estilos.alertaTexto}>
                  {uso >= 1 ? '⚠️' : '🔔'} {cat.icono} {a.nombre}:{' '}
                  {a.gastado > a.limite
                    ? `te pasaste ${formatoDinero(a.gastado - a.limite)}`
                    : a.gastado === a.limite
                      ? 'límite alcanzado'
                      : `quedan ${formatoDinero(a.limite - a.gastado)}`}
                </Text>
                <Text style={[estilos.alertaPct, { color: colorUso(uso) }]}>
                  {Math.round(uso * 100)}%
                </Text>
              </View>
            );
          })}
        </Pressable>
      ) : (
        <Pressable style={[estilos.tarjeta, estilos.filaEntre]} onPress={onVerPresupuestos}>
          <Text style={[estilos.textoSuave, { flex: 1 }]}>
            💡 Divide tu dinero en apartados (vivienda, comida, ocio…) para controlar cuánto
            gastas en cada uno.
          </Text>
          <Text style={{ color: colores.primario, fontWeight: '700', marginLeft: 8 }}>Empezar ›</Text>
        </Pressable>
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
  alerta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colores.fondo,
  },
  alertaTexto: { flex: 1, fontSize: 13, color: colores.texto },
  alertaPct: { fontSize: 13, fontWeight: '700', marginLeft: 8 },
  vacio: { alignItems: 'center', paddingVertical: 32 },
  vacioEmoji: { fontSize: 40 },
  vacioTexto: { color: colores.textoSuave, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
