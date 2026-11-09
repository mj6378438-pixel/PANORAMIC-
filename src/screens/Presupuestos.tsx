import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarraProgreso, colorUso } from '../components/BarraProgreso';
import { DialogoMonto } from '../components/DialogoMonto';
import { SelectorMes } from '../components/SelectorMes';
import { CATEGORIAS, GRUPOS, PCT_AHORRO, repartir503020 } from '../lib/categorias';
import { claveMes, formatoDinero, hoyISO, moverMes } from '../lib/formato';
import { gastoPorCategoria, resumen, useFinanzas } from '../lib/store';
import { colores } from '../lib/tema';
import { Categoria, GrupoGasto } from '../lib/types';

type Dialogo = { tipo: 'categoria'; categoria: Categoria } | { tipo: 'repartir' } | null;

export function Presupuestos() {
  const {
    movimientos,
    presupuestos,
    presupuestoTotal,
    metaAhorro,
    definirPresupuesto,
    definirPresupuestos,
    definirMetaAhorro,
  } = useFinanzas();
  const [mes, setMes] = useState(claveMes(hoyISO()));
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  const delMes = useMemo(
    () => movimientos.filter((m) => claveMes(m.fecha) === mes),
    [movimientos, mes],
  );
  const gastado = useMemo(() => gastoPorCategoria(delMes), [delMes]);
  const totales = useMemo(() => resumen(delMes), [delMes]);

  // Ingreso de referencia para el reparto: el del mes, o el del mes anterior
  const ingresoReferencia = useMemo(() => {
    if (totales.ingresos > 0) return totales.ingresos;
    const anterior = moverMes(mes, -1);
    return resumen(movimientos.filter((m) => claveMes(m.fecha) === anterior)).ingresos;
  }, [totales.ingresos, movimientos, mes]);

  const grupos = (['necesidad', 'deseo'] as GrupoGasto[]).map((g) => {
    const cats = CATEGORIAS.gasto.filter((c) => c.grupo === g);
    return {
      id: g,
      info: GRUPOS[g],
      cats,
      presupuesto: cats.reduce((a, c) => a + (presupuestos[c.nombre] ?? 0), 0),
      gastado: cats.reduce((a, c) => a + (gastado[c.nombre] ?? 0), 0),
    };
  });

  const usoTotal = presupuestoTotal > 0 ? totales.gastos / presupuestoTotal : 0;
  const ahorrado = totales.balance;

  const repartir = (ingreso: number) => {
    setDialogo(null);
    if (!(ingreso > 0)) return;
    definirPresupuestos(repartir503020(ingreso));
    definirMetaAhorro(Math.round(ingreso * PCT_AHORRO));
  };

  const pedirReparto = () => {
    if (presupuestoTotal > 0) {
      Alert.alert(
        'Repartir de nuevo',
        'Se reemplazarán los presupuestos actuales de todas las categorías.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => setDialogo({ tipo: 'repartir' }) },
        ],
      );
    } else setDialogo({ tipo: 'repartir' });
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <SelectorMes mes={mes} onCambiar={setMes} />

      {/* Resumen total */}
      <View style={estilos.tarjeta}>
        <View style={estilos.filaEntre}>
          <Text style={estilos.titulo}>Total presupuestado</Text>
          <Text style={estilos.suave}>
            {presupuestoTotal > 0 ? `${Math.round(usoTotal * 100)}%` : ''}
          </Text>
        </View>
        {presupuestoTotal > 0 ? (
          <>
            <Text style={estilos.grande}>
              {formatoDinero(totales.gastos)}
              <Text style={estilos.suave}> de {formatoDinero(presupuestoTotal)}</Text>
            </Text>
            <BarraProgreso uso={usoTotal} alto={10} />
            <Text style={[estilos.suave, { marginTop: 8 }]}>
              {presupuestoTotal - totales.gastos >= 0
                ? `Te quedan ${formatoDinero(presupuestoTotal - totales.gastos)} para este mes`
                : `Te has pasado ${formatoDinero(totales.gastos - presupuestoTotal)}`}
            </Text>
          </>
        ) : (
          <Text style={[estilos.suave, { marginTop: 6 }]}>
            Aún no has dividido tu dinero. Usa el reparto automático o toca cada apartado para
            ponerle un límite.
          </Text>
        )}
        <Pressable style={estilos.boton} onPress={pedirReparto}>
          <Text style={estilos.botonTexto}>✨ Repartir automáticamente (50/30/20)</Text>
        </Pressable>
      </View>

      {/* Grupos 50/30/20 */}
      <View style={estilos.filaGrupos}>
        {grupos.map((g) => (
          <ResumenGrupo
            key={g.id}
            titulo={g.info.titulo}
            pct={g.info.pct}
            gastado={g.gastado}
            presupuesto={g.presupuesto}
          />
        ))}
        <ResumenGrupo
          titulo="Ahorro"
          pct={PCT_AHORRO}
          gastado={Math.max(ahorrado, 0)}
          presupuesto={metaAhorro}
          esAhorro
        />
      </View>

      {/* Apartados por categoría */}
      {grupos.map((g) => (
        <View key={g.id} style={estilos.tarjeta}>
          <Text style={estilos.titulo}>{g.info.titulo}</Text>
          <Text style={estilos.suave}>{g.info.descripcion}</Text>
          {g.cats.map((c) => {
            const p = presupuestos[c.nombre] ?? 0;
            const gs = gastado[c.nombre] ?? 0;
            const uso = p > 0 ? gs / p : 0;
            return (
              <Pressable
                key={c.nombre}
                onPress={() => setDialogo({ tipo: 'categoria', categoria: c })}
                style={({ pressed }) => [estilos.cat, pressed && { opacity: 0.6 }]}
              >
                <View style={estilos.filaEntre}>
                  <Text style={estilos.catNombre}>
                    {c.icono} {c.nombre}
                  </Text>
                  {p > 0 ? (
                    <Text style={[estilos.catMonto, { color: colorUso(uso, colores.texto) }]}>
                      {formatoDinero(gs)} / {formatoDinero(p)}
                    </Text>
                  ) : (
                    <Text style={estilos.enlace}>
                      {gs > 0 ? `${formatoDinero(gs)} · ` : ''}Fijar límite
                    </Text>
                  )}
                </View>
                {p > 0 && (
                  <>
                    <View style={{ marginTop: 6 }}>
                      <BarraProgreso uso={uso} color={uso >= 0.8 ? undefined : c.color} />
                    </View>
                    <Text style={[estilos.restante, uso >= 1 && { color: colores.gasto }]}>
                      {p - gs >= 0
                        ? `Quedan ${formatoDinero(p - gs)}`
                        : `Excedido en ${formatoDinero(gs - p)}`}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      <Text style={[estilos.suave, { textAlign: 'center' }]}>
        Toca cualquier apartado para cambiar su límite.
      </Text>

      <DialogoMonto
        visible={dialogo?.tipo === 'categoria'}
        titulo={
          dialogo?.tipo === 'categoria'
            ? `Límite mensual · ${dialogo.categoria.icono} ${dialogo.categoria.nombre}`
            : ''
        }
        mensaje="Déjalo vacío para quitar el límite."
        valorInicial={dialogo?.tipo === 'categoria' ? presupuestos[dialogo.categoria.nombre] ?? 0 : 0}
        onAceptar={(v) => {
          if (dialogo?.tipo === 'categoria') definirPresupuesto(dialogo.categoria.nombre, v);
          setDialogo(null);
        }}
        onCancelar={() => setDialogo(null)}
      />
      <DialogoMonto
        visible={dialogo?.tipo === 'repartir'}
        titulo="¿Cuánto ingresas al mes?"
        mensaje={
          '50% para necesidades, 30% para ocio y deseos, 20% para ahorro. ' +
          'Después puedes ajustar cada apartado.'
        }
        valorInicial={ingresoReferencia}
        textoAceptar="Repartir"
        permitirVacio={false}
        onAceptar={repartir}
        onCancelar={() => setDialogo(null)}
      />
    </ScrollView>
  );
}

function ResumenGrupo({
  titulo,
  pct,
  gastado,
  presupuesto,
  esAhorro,
}: {
  titulo: string;
  pct: number;
  gastado: number;
  presupuesto: number;
  esAhorro?: boolean;
}) {
  const uso = presupuesto > 0 ? gastado / presupuesto : 0;
  const color = esAhorro ? colores.primario : colorUso(uso);
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.grupoPct}>{Math.round(pct * 100)}%</Text>
      <Text style={estilos.grupoTitulo} numberOfLines={1}>
        {titulo}
      </Text>
      <Text style={estilos.grupoValor} numberOfLines={1} adjustsFontSizeToFit>
        {formatoDinero(gastado)}
      </Text>
      <Text style={estilos.grupoSub} numberOfLines={1} adjustsFontSizeToFit>
        {presupuesto > 0 ? `${esAhorro ? 'meta' : 'de'} ${formatoDinero(presupuesto)}` : 'sin límite'}
      </Text>
      <View style={{ marginTop: 6 }}>
        <BarraProgreso uso={uso} color={color} alto={6} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 16, paddingBottom: 32 },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: 16, padding: 16, marginBottom: 12 },
  titulo: { fontSize: 16, fontWeight: '700', color: colores.texto },
  grande: { fontSize: 22, fontWeight: '800', color: colores.texto, marginVertical: 8 },
  suave: { color: colores.textoSuave, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boton: {
    marginTop: 14,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonTexto: { color: colores.primario, fontWeight: '700', fontSize: 14 },
  filaGrupos: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  grupo: { flex: 1, backgroundColor: colores.tarjeta, borderRadius: 14, padding: 10 },
  grupoPct: { fontSize: 11, color: colores.primario, fontWeight: '800' },
  grupoTitulo: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  grupoValor: { fontSize: 15, fontWeight: '800', color: colores.texto, marginTop: 4 },
  grupoSub: { fontSize: 11, color: colores.textoSuave },
  cat: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colores.fondo },
  catNombre: { fontSize: 15, color: colores.texto, fontWeight: '600' },
  catMonto: { fontSize: 13, fontWeight: '600' },
  enlace: { fontSize: 13, color: colores.primario, fontWeight: '600' },
  restante: { fontSize: 12, color: colores.textoSuave, marginTop: 4 },
});
