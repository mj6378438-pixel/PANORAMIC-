import { Categoria, TipoMovimiento } from './types';

export const CATEGORIAS: Record<TipoMovimiento, Categoria[]> = {
  gasto: [
    { nombre: 'Comida', icono: '🍔', color: '#F97316' },
    { nombre: 'Transporte', icono: '🚌', color: '#3B82F6' },
    { nombre: 'Vivienda', icono: '🏠', color: '#8B5CF6' },
    { nombre: 'Servicios', icono: '💡', color: '#EAB308' },
    { nombre: 'Salud', icono: '💊', color: '#EF4444' },
    { nombre: 'Ocio', icono: '🎬', color: '#EC4899' },
    { nombre: 'Compras', icono: '🛍️', color: '#14B8A6' },
    { nombre: 'Educación', icono: '📚', color: '#6366F1' },
    { nombre: 'Otros', icono: '📦', color: '#64748B' },
  ],
  ingreso: [
    { nombre: 'Salario', icono: '💼', color: '#16A34A' },
    { nombre: 'Negocio', icono: '🏪', color: '#059669' },
    { nombre: 'Inversiones', icono: '📈', color: '#0D9488' },
    { nombre: 'Regalo', icono: '🎁', color: '#22C55E' },
    { nombre: 'Otros', icono: '💰', color: '#65A30D' },
  ],
};

export function buscarCategoria(tipo: TipoMovimiento, nombre: string): Categoria {
  const lista = CATEGORIAS[tipo];
  return lista.find((c) => c.nombre === nombre) ?? lista[lista.length - 1];
}
