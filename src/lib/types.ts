export type TipoMovimiento = 'ingreso' | 'gasto';

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
}
