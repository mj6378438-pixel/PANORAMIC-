import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { montoAEditable, parsearMonto } from '../lib/formato';
import { colores } from '../lib/tema';

interface Props {
  visible: boolean;
  titulo: string;
  mensaje?: string;
  valorInicial: number;
  textoAceptar?: string;
  /** Si se permite dejarlo vacío (devuelve 0) */
  permitirVacio?: boolean;
  onAceptar: (valor: number) => void;
  onCancelar: () => void;
}

/** Diálogo pequeño para introducir un monto (funciona igual en iOS, Android y web). */
export function DialogoMonto({
  visible,
  titulo,
  mensaje,
  valorInicial,
  textoAceptar = 'Guardar',
  permitirVacio = true,
  onAceptar,
  onCancelar,
}: Props) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setTexto(montoAEditable(valorInicial));
      setError('');
    }
  }, [visible, valorInicial]);

  const aceptar = () => {
    if (texto.trim() === '') {
      if (permitirVacio) return onAceptar(0);
      return setError('Introduce un monto.');
    }
    const v = parsearMonto(texto);
    if (!(v >= 0)) return setError('Número no válido.');
    onAceptar(Math.round(v * 100) / 100);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView
        style={estilos.fondo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={estilos.caja}>
          <Text style={estilos.titulo}>{titulo}</Text>
          {!!mensaje && <Text style={estilos.mensaje}>{mensaje}</Text>}
          <TextInput
            value={texto}
            onChangeText={(t) => {
              setTexto(t);
              setError('');
            }}
            placeholder="0,00"
            keyboardType="decimal-pad"
            style={estilos.input}
            autoFocus
            onSubmitEditing={aceptar}
          />
          {!!error && <Text style={estilos.error}>{error}</Text>}
          <View style={estilos.botones}>
            <Pressable onPress={onCancelar} style={[estilos.boton, estilos.secundario]}>
              <Text style={[estilos.botonTexto, { color: colores.texto }]}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={aceptar} style={estilos.boton}>
              <Text style={estilos.botonTexto}>{textoAceptar}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  caja: { backgroundColor: colores.tarjeta, borderRadius: 18, padding: 20 },
  titulo: { fontSize: 17, fontWeight: '700', color: colores.texto },
  mensaje: { fontSize: 13, color: colores.textoSuave, marginTop: 6, lineHeight: 18 },
  input: {
    marginTop: 14,
    backgroundColor: colores.fondo,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 22,
    fontWeight: '700',
    color: colores.texto,
  },
  error: { color: colores.gasto, marginTop: 6, fontSize: 13 },
  botones: { flexDirection: 'row', gap: 10, marginTop: 16 },
  boton: {
    flex: 1,
    backgroundColor: colores.primario,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secundario: { backgroundColor: colores.borde },
  botonTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
