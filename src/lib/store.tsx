import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { establecerMoneda } from './formato';
import { Movimiento, Presupuestos } from './types';

const CLAVE_MOVIMIENTOS = '@gestor/movimientos';
const CLAVE_PRESUPUESTOS = '@gestor/presupuestos';
const CLAVE_MONEDA = '@gestor/moneda';
const CLAVE_META_AHORRO = '@gestor/metaAhorro';

interface Estado {
  cargando: boolean;
  movimientos: Movimiento[];
  /** Presupuesto mensual por categoría de gasto */
  presupuestos: Presupuestos;
  /** Suma de todos los presupuestos por categoría */
  presupuestoTotal: number;
  /** Meta de ahorro mensual (0 = sin definir) */
  metaAhorro: number;
  moneda: string;
  agregar: (m: Omit<Movimiento, 'id'>) => void;
  actualizar: (m: Movimiento) => void;
  eliminar: (id: string) => void;
  definirPresupuesto: (categoria: string, valor: number) => void;
  definirPresupuestos: (p: Presupuestos) => void;
  definirMetaAhorro: (valor: number) => void;
  definirMoneda: (codigo: string) => void;
  borrarTodo: () => void;
}

const Contexto = createContext<Estado | null>(null);

function nuevoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function limpiar(p: Presupuestos): Presupuestos {
  const r: Presupuestos = {};
  for (const [k, v] of Object.entries(p)) if (v > 0) r[k] = v;
  return r;
}

export function ProveedorFinanzas({ children }: { children: React.ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuestos>({});
  const [metaAhorro, setMetaAhorro] = useState(0);
  const [moneda, setMoneda] = useState('EUR');

  useEffect(() => {
    (async () => {
      try {
        const [m, p, mon, meta] = await Promise.all([
          AsyncStorage.getItem(CLAVE_MOVIMIENTOS),
          AsyncStorage.getItem(CLAVE_PRESUPUESTOS),
          AsyncStorage.getItem(CLAVE_MONEDA),
          AsyncStorage.getItem(CLAVE_META_AHORRO),
        ]);
        if (m) setMovimientos(JSON.parse(m));
        if (p) setPresupuestos(JSON.parse(p));
        if (mon) {
          establecerMoneda(mon);
          setMoneda(mon);
        }
        if (meta) setMetaAhorro(Number(meta) || 0);
      } catch (e) {
        console.warn('No se pudieron cargar los datos', e);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const guardar = (clave: string, valor: string) => {
    AsyncStorage.setItem(clave, valor).catch(() => {});
  };

  useEffect(() => {
    if (!cargando) guardar(CLAVE_MOVIMIENTOS, JSON.stringify(movimientos));
  }, [movimientos, cargando]);
  useEffect(() => {
    if (!cargando) guardar(CLAVE_PRESUPUESTOS, JSON.stringify(presupuestos));
  }, [presupuestos, cargando]);
  useEffect(() => {
    if (!cargando) guardar(CLAVE_MONEDA, moneda);
  }, [moneda, cargando]);
  useEffect(() => {
    if (!cargando) guardar(CLAVE_META_AHORRO, String(metaAhorro));
  }, [metaAhorro, cargando]);

  const valor = useMemo<Estado>(
    () => ({
      cargando,
      movimientos,
      presupuestos,
      presupuestoTotal: Object.values(presupuestos).reduce((a, b) => a + b, 0),
      metaAhorro,
      moneda,
      agregar: (m) => setMovimientos((prev) => [{ ...m, id: nuevoId() }, ...prev]),
      actualizar: (m) => setMovimientos((prev) => prev.map((x) => (x.id === m.id ? m : x))),
      eliminar: (id) => setMovimientos((prev) => prev.filter((x) => x.id !== id)),
      definirPresupuesto: (categoria, v) =>
        setPresupuestos((prev) => limpiar({ ...prev, [categoria]: v })),
      definirPresupuestos: (p) => setPresupuestos(limpiar(p)),
      definirMetaAhorro: setMetaAhorro,
      definirMoneda: (codigo) => {
        establecerMoneda(codigo);
        setMoneda(codigo);
      },
      borrarTodo: () => {
        setMovimientos([]);
        setPresupuestos({});
        setMetaAhorro(0);
      },
    }),
    [cargando, movimientos, presupuestos, metaAhorro, moneda],
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

/** Gasto por categoría en una lista de movimientos */
export function gastoPorCategoria(movs: Movimiento[]): Record<string, number> {
  const r: Record<string, number> = {};
  for (const m of movs) if (m.tipo === 'gasto') r[m.categoria] = (r[m.categoria] ?? 0) + m.monto;
  return r;
}

/** Ordena por fecha descendente */
export function ordenar(movs: Movimiento[]): Movimiento[] {
  return [...movs].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
}

/** Convierte los movimientos a CSV (separador ;, apto para Excel en español) */
export function aCSV(movs: Movimiento[]): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const filas = ordenar(movs).map((m) =>
    [m.fecha, m.tipo, esc(m.categoria), esc(m.descripcion), m.monto.toFixed(2).replace('.', ',')].join(';'),
  );
  return ['Fecha;Tipo;Categoría;Descripción;Monto', ...filas].join('\n');
}
