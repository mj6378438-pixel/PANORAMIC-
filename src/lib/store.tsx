import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Movimiento } from './types';

const CLAVE_MOVIMIENTOS = '@gestor/movimientos';
const CLAVE_PRESUPUESTO = '@gestor/presupuesto';

interface Estado {
  cargando: boolean;
  movimientos: Movimiento[];
  /** Presupuesto mensual de gastos (0 = sin definir) */
  presupuesto: number;
  agregar: (m: Omit<Movimiento, 'id'>) => void;
  actualizar: (m: Movimiento) => void;
  eliminar: (id: string) => void;
  definirPresupuesto: (valor: number) => void;
  borrarTodo: () => void;
}

const Contexto = createContext<Estado | null>(null);

function nuevoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ProveedorFinanzas({ children }: { children: React.ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [presupuesto, setPresupuesto] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [m, p] = await Promise.all([
          AsyncStorage.getItem(CLAVE_MOVIMIENTOS),
          AsyncStorage.getItem(CLAVE_PRESUPUESTO),
        ]);
        if (m) setMovimientos(JSON.parse(m));
        if (p) setPresupuesto(Number(p) || 0);
      } catch (e) {
        console.warn('No se pudieron cargar los datos', e);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (cargando) return;
    AsyncStorage.setItem(CLAVE_MOVIMIENTOS, JSON.stringify(movimientos)).catch(() => {});
  }, [movimientos, cargando]);

  useEffect(() => {
    if (cargando) return;
    AsyncStorage.setItem(CLAVE_PRESUPUESTO, String(presupuesto)).catch(() => {});
  }, [presupuesto, cargando]);

  const valor = useMemo<Estado>(
    () => ({
      cargando,
      movimientos,
      presupuesto,
      agregar: (m) => setMovimientos((prev) => [{ ...m, id: nuevoId() }, ...prev]),
      actualizar: (m) => setMovimientos((prev) => prev.map((x) => (x.id === m.id ? m : x))),
      eliminar: (id) => setMovimientos((prev) => prev.filter((x) => x.id !== id)),
      definirPresupuesto: setPresupuesto,
      borrarTodo: () => {
        setMovimientos([]);
        setPresupuesto(0);
      },
    }),
    [cargando, movimientos, presupuesto],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFinanzas(): Estado {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useFinanzas debe usarse dentro de ProveedorFinanzas');
  return ctx;
}

export function resumen(movs: Movimiento[]) {
  let ingresos = 0;
  let gastos = 0;
  for (const m of movs) {
    if (m.tipo === 'ingreso') ingresos += m.monto;
    else gastos += m.monto;
  }
  return { ingresos, gastos, balance: ingresos - gastos };
}

/** Ordena por fecha descendente */
export function ordenar(movs: Movimiento[]): Movimiento[] {
  return [...movs].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
}
