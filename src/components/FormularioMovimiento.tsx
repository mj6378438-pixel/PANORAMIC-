import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIAS } from '../lib/categorias';
import {
  claveMes,
  fechaValida,
  formatoDinero,
  formatoFecha,
  hoyISO,
  montoAEditable,
  moverDia,
  parsearMonto,
} from '../lib/formato';
import { useFinanzas } from '../lib/store';
import { colores } from '../lib/tema';
import { Movimiento, TipoMovimiento } from '../lib/types';

interface Props {
  visible: boolean;
  /** Si se pasa, el formulario edita ese movimiento */
  editando?: Movimiento | null;
  tipoInicial?: TipoMovimiento;
  onCerrar: () => void;
}

export function FormularioMovimiento({ visible, editando, tipoInicial = 'gasto', onCerrar }: Props) {
  const { agregar, actualizar, eliminar, movimientos, presupuestos } = useFinanzas();
  const [tipo, setTipo] = useState<TipoMovimiento>(tipoInicial);
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[tipoInicial][0].nombre);
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(hoyISO());

  useEffect(() => {
    if (!visible) return;
    if (editando) {
      setTipo(editando.tipo);
      setMonto(montoAEditable(editando.monto));
      setCategoria(editando.categoria);
      setDescripcion(editando.descripcion);
      setFecha(editando.fecha);
    } else {
      setTipo(tipoInicial);
      setMonto('');
      setCategoria(CATEGORIAS[tipoInicial][0].nombre);
      setDescripcion('');
      setFecha(hoyISO());
    }
  }, [visible, editando, tipoInicial]);

  const cambiarTipo = (t: TipoMovimiento) => {
    setTipo(t);
    if (!CATEGORIAS[t].some((c) => c.nombre === categoria)) setCategoria(CATEGORIAS[t][0].nombre);
  };

  const guardar = () => {
    const valor = parsearMonto(monto);
    if (!(valor > 0)) {
      Alert.alert('Monto inválido', 'Introduce un monto mayor que 0.');
      return;
    }
    if (!fechaValida(fecha)) {
      Alert.alert('Fecha inválida', 'Elige una fecha válida.');
      return;
    }
    const datos = {
      tipo,
      monto: Math.round(valor * 100) / 100,
      categoria,
      descripcion: descripcion.trim(),
      fecha,
    };
    if (editando) actualizar({ ...datos, id: editando.id });
    else agregar(datos);
    onCerrar();
  };

  const borrar = () => {
    if (!editando) return;
    Alert.alert('Eliminar movimiento', '¿Seguro que quieres eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          eliminar(editando.id);
          onCerrar();
        },
      },
    ]);
  };

  // Cuánto queda en el apartado elegido este mes (sin contar el movimiento que se edita)
  const limite = tipo === 'gasto' ? presupuestos[categoria] ?? 0 : 0;
  const mesFecha = fechaValida(fecha) ? claveMes(fecha) : claveMes(hoyISO());
  const gastadoCat = movimientos
    .filter(
      (m) =>
        m.tipo === 'gasto' &&
        m.categoria === categoria &&
        claveMes(m.fecha) === mesFecha &&
        m.id !== editando?.id,
    )
    .reduce((a, m) => a + m.monto, 0);
  const montoActual = parsearMonto(monto) > 0 ? parsearMonto(monto) : 0;
  const restante = limite - gastadoCat - montoActual;

  const colorTipo = tipo === 'ingreso' ? colores.ingreso : colores.gasto;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCerrar}>
      <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={estilos.cabecera}>
            <Pressable onPress={onCerrar} hitSlop={10}>
              <Text style={estilos.enlace}>Cancelar</Text>
            </Pressable>
            <Text style={estilos.tituloCabecera}>{editando ? 'Editar' : 'Nuevo'} movimiento</Text>
            <Pressable onPress={guardar} hitSlop={10}>
              <Text style={[estilos.enlace, { fontWeight: '700' }]}>Guardar</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={estilos.cuerpo} keyboardShouldPersistTaps="handled">
            <View style={estilos.segmento}>
              {(['gasto', 'ingreso'] as TipoMovimiento[]).map((t) => {
                const activo = t === tipo;
                const c = t === 'ingreso' ? colores.ingreso : colores.gasto;
                return (
                  <Pressable
                    key={t}
                    onPress={() => cambiarTipo(t)}
                    style={[estilos.segBoton, activo && { backgroundColor: c }]}
                  >
                    <Text style={[estilos.segTexto, activo && { color: '#fff' }]}>
                      {t === 'ingreso' ? 'Ingreso' : 'Gasto'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={estilos.etiqueta}>Monto</Text>
            <TextInput
              value={monto}
              onChangeText={setMonto}
              placeholder="0,00"
              keyboardType="decimal-pad"
              style={[estilos.input, estilos.inputMonto, { color: colorTipo }]}
              autoFocus={!editando}
            />

            <Text style={estilos.etiqueta}>Categoría</Text>
            <View style={estilos.chips}>
              {CATEGORIAS[tipo].map((c) => {
                const activo = c.nombre === categoria;
                return (
                  <Pressable
                    key={c.nombre}
                    onPress={() => setCategoria(c.nombre)}
                    style={[
                      estilos.chip,
                      activo && { backgroundColor: c.color, borderColor: c.color },
                    ]}
                  >
                    <Text style={[estilos.chipTexto, activo && { color: '#fff' }]}>
                      {c.icono} {c.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {limite > 0 && (
              <View style={[estilos.aviso, restante < 0 && { backgroundColor: '#FEE2E2' }]}>
                <Text style={[estilos.avisoTexto, restante < 0 && { color: colores.gasto }]}>
                  {restante >= 0
                    ? `Te quedarán ${formatoDinero(restante)} de ${formatoDinero(limite)} en ${categoria} este mes`
                    : `⚠️ Te pasarás ${formatoDinero(-restante)} del límite de ${categoria} (${formatoDinero(limite)})`}
                </Text>
              </View>
            )}

            <Text style={estilos.etiqueta}>Descripción (opcional)</Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Ej. Supermercado"
              style={estilos.input}
              maxLength={60}
            />

            <Text style={estilos.etiqueta}>Fecha</Text>
            <View style={estilos.filaFecha}>
              <Pressable
                style={estilos.flechaFecha}
                onPress={() => fechaValida(fecha) && setFecha(moverDia(fecha, -1))}
                hitSlop={6}
              >
                <Text style={estilos.flechaTexto}>‹</Text>
              </Pressable>
              <Text style={estilos.fechaTexto}>
                {fechaValida(fecha) ? formatoFecha(fecha) : fecha}
                {fecha === hoyISO() ? '  (hoy)' : fecha === moverDia(hoyISO(), -1) ? '  (ayer)' : ''}
              </Text>
              <Pressable
                style={estilos.flechaFecha}
                onPress={() => fechaValida(fecha) && setFecha(moverDia(fecha, 1))}
                hitSlop={6}
              >
                <Text style={estilos.flechaTexto}>›</Text>
              </Pressable>
            </View>
            <View style={[estilos.chips, { marginTop: 8 }]}>
              <Pressable style={estilos.chip} onPress={() => setFecha(hoyISO())}>
                <Text style={estilos.chipTexto}>Hoy</Text>
              </Pressable>
              <Pressable style={estilos.chip} onPress={() => setFecha(moverDia(hoyISO(), -1))}>
                <Text style={estilos.chipTexto}>Ayer</Text>
              </Pressable>
              <Pressable style={estilos.chip} onPress={() => setFecha(moverDia(hoyISO(), -7))}>
                <Text style={estilos.chipTexto}>Hace 1 semana</Text>
              </Pressable>
            </View>

            {editando && (
              <Pressable onPress={borrar} style={estilos.botonEliminar}>
                <Text style={estilos.textoEliminar}>Eliminar movimiento</Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  tituloCabecera: { fontSize: 16, fontWeight: '700', color: colores.texto },
  enlace: { fontSize: 16, color: colores.primario },
  cuerpo: { padding: 16, paddingBottom: 40 },
  segmento: {
    flexDirection: 'row',
    backgroundColor: colores.borde,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  segBoton: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  segTexto: { fontWeight: '600', color: colores.textoSuave },
  etiqueta: { fontSize: 13, color: colores.textoSuave, marginTop: 16, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colores.texto,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  inputMonto: { fontSize: 32, fontWeight: '700' },
  aviso: { marginTop: 12, backgroundColor: '#EEF2FF', borderRadius: 10, padding: 10 },
  avisoTexto: { color: colores.primario, fontSize: 13, fontWeight: '600' },
  filaFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingVertical: 4,
  },
  flechaFecha: { paddingHorizontal: 16, paddingVertical: 4 },
  flechaTexto: { fontSize: 26, color: colores.primario, fontWeight: '600' },
  fechaTexto: { fontSize: 16, color: colores.texto, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  chipTexto: { color: colores.texto, fontSize: 14 },
  botonEliminar: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  textoEliminar: { color: colores.gasto, fontWeight: '700', fontSize: 15 },
});
