import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SelectorMes } from '../components/SelectorMes';
import { buscarCategoria } from '../lib/categorias';
import { claveMes, formatoDinero, hoyISO, moverMes, nombreMes } from '../lib/formato';
import { resumen, useFinanzas } from '../lib/store';
import { colores } from '../lib/tema';
import { TipoMovimiento } from '../lib/types';

export function Estadisticas() {
  const { movimientos } = useFinanzas();
  const [mes, setMes] = useState(claveMes(hoyISO()));

  const delMes = useMemo(
    () => movimientos.filter((m) => claveMes(m.fecha) === mes),
    [movimientos, mes],
  );

  const porCategoria = (tipo: TipoMovimiento) => {
    const mapa = new Map<string, number>();
    for (const m of delMes) {
      if (m.tipo !== tipo) continue;
      mapa.set(m.categoria, (mapa.get(m.categoria) ?? 0) + m.monto);
    }
    const total = [...mapa.values()].reduce((a, b) => a + b, 0);
    return {
      total,
      filas: [...mapa.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([nombre, monto]) => ({
          cat: buscarCategoria(tipo, nombre),
          nombre,
          monto,
          pct: total > 0 ? monto / total : 0,
        })),
    };
  };

  const gastos = useMemo(() => porCategoria('gasto'), [delMes]);
  const ingresos = useMemo(() => porCategoria('ingreso'), [delMes]);

  // Últimos 6 meses hasta el mes seleccionado
  const historico = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => moverMes(mes, i - 5));
    const datos = meses.map((clave) => ({
      clave,
      ...resumen(movimientos.filter((m) => claveMes(m.fecha) === clave)),
    }));
    const max = Math.max(1, ...datos.map((d) => Math.max(d.ingresos, d.gastos)));
    return { datos, max };
  }, [movimientos, mes]);

  const ahorro = ingresos.total - gastos.total;
  const tasaAhorro = ingresos.total > 0 ? ahorro / ingresos.total : 0;

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <SelectorMes mes={mes} onCambiar={setMes} />

      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>Ahorro del mes</Text>
        <Text style={[estilos.grande, { color: ahorro >= 0 ? colores.ingreso : colores.gasto }]}>
          {formatoDinero(ahorro)}
        </Text>
        <Text style={estilos.suave}>
          {ingresos.total > 0
            ? `Tasa de ahorro: ${Math.round(tasaAhorro * 100)}% de tus ingresos`
            : 'Registra ingresos para calcular tu tasa de ahorro'}
        </Text>
      </View>

      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>Últimos 6 meses</Text>
        <View style={estilos.grafico}>
          {historico.datos.map((d) => (
            <View key={d.clave} style={estilos.columna}>
              <View style={estilos.barras}>
                <View
                  style={[
                    estilos.barraV,
                    { height: `${(d.ingresos / historico.max) * 100}%`, backgroundColor: colores.ingreso },
                  ]}
                />
                <View
                  style={[
                    estilos.barraV,
                    { height: `${(d.gastos / historico.max) * 100}%`, backgroundColor: colores.gasto },
                  ]}
                />
              </View>
              <Text style={[estilos.mesCorto, d.clave === mes && { color: colores.primario, fontWeight: '700' }]}>
                {nombreMes(d.clave).slice(0, 3)}
              </Text>
            </View>
          ))}
        </View>
        <View style={estilos.leyenda}>
          <View style={[estilos.punto, { backgroundColor: colores.ingreso }]} />
          <Text style={estilos.suave}>Ingresos   </Text>
          <View style={[estilos.punto, { backgroundColor: colores.gasto }]} />
          <Text style={estilos.suave}>Gastos</Text>
        </View>
      </View>

      <Desglose titulo="Gastos por categoría" datos={gastos} />
      <Desglose titulo="Ingresos por categoría" datos={ingresos} />
    </ScrollView>
  );
}

function Desglose({
  titulo,
  datos,
}: {
  titulo: string;
  datos: { total: number; filas: { cat: { icono: string; color: string }; nombre: string; monto: number; pct: number }[] };
}) {
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.filaEntre}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.suave}>{formatoDinero(datos.total)}</Text>
      </View>
      {datos.filas.length === 0 ? (
        <Text style={[estilos.suave, { marginTop: 8 }]}>Sin datos este mes.</Text>
      ) : (
        datos.filas.map((f) => (
          <View key={f.nombre} style={{ marginTop: 12 }}>
            <View style={estilos.filaEntre}>
              <Text style={estilos.catNombre}>
                {f.cat.icono} {f.nombre}
              </Text>
              <Text style={estilos.catMonto}>
                {formatoDinero(f.monto)} · {Math.round(f.pct * 100)}%
              </Text>
            </View>
            <View style={estilos.barraFondo}>
              <View style={[estilos.barra, { width: `${f.pct * 100}%`, backgroundColor: f.cat.color }]} />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, paddingBottom: 32 },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: 16, padding: 16, marginBottom: 12 },
  titulo: { fontSize: 16, fontWeight: '700', color: colores.texto },
  grande: { fontSize: 28, fontWeight: '800', marginVertical: 4 },
  suave: { color: colores.textoSuave, fontSize: 13 },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catNombre: { fontSize: 14, color: colores.texto, fontWeight: '600' },
  catMonto: { fontSize: 13, color: colores.textoSuave },
  barraFondo: { height: 8, borderRadius: 4, backgroundColor: colores.borde, overflow: 'hidden', marginTop: 6 },
  barra: { height: '100%', borderRadius: 4 },
  grafico: { flexDirection: 'row', height: 140, marginTop: 14, alignItems: 'flex-end' },
  columna: { flex: 1, alignItems: 'center', height: '100%' },
  barras: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  barraV: { width: 10, borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 2 },
  mesCorto: { fontSize: 11, color: colores.textoSuave, marginTop: 6 },
  leyenda: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  punto: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
});
