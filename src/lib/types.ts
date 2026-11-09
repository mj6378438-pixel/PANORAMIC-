export type TipoMovimiento = 'ingreso' | 'gasto';

/** Grupo de la regla 50/30/20 al que pertenece una categoría de gasto */
export type GrupoGasto = 'necesidad' | 'deseo';

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  monto: number;
  categoria: string;
  descripcion: string;
  fecha: string; // ISO yyyy-mm-dd
}

export interface Categoria {
  nombre: string;
  icono: string;
  color: string;
  grupo?: GrupoGasto;
}

/** Presupuesto mensual por categoría de gasto (nombre -> monto) */
export type Presupuestos = Record<string, number>;
