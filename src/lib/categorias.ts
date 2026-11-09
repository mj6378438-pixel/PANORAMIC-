import { Categoria, GrupoGasto, TipoMovimiento } from './types';

export const CATEGORIAS: Record<TipoMovimiento, Categoria[]> = {
  gasto: [
    { nombre: 'Vivienda', icono: '🏠', color: '#8B5CF6', grupo: 'necesidad' },
    { nombre: 'Comida', icono: '🍔', color: '#F97316', grupo: 'necesidad' },
    { nombre: 'Servicios', icono: '💡', color: '#EAB308', grupo: 'necesidad' },
    { nombre: 'Transporte', icono: '🚌', color: '#3B82F6', grupo: 'necesidad' },
    { nombre: 'Salud', icono: '💊', color: '#EF4444', grupo: 'necesidad' },
    { nombre: 'Educación', icono: '📚', color: '#6366F1', grupo: 'necesidad' },
    { nombre: 'Ocio', icono: '🎬', color: '#EC4899', grupo: 'deseo' },
    { nombre: 'Compras', icono: '🛍️', color: '#14B8A6', grupo: 'deseo' },
    { nombre: 'Restaurantes', icono: '🍽️', color: '#F43F5E', grupo: 'deseo' },
    { nombre: 'Suscripciones', icono: '📺', color: '#0EA5E9', grupo: 'deseo' },
    { nombre: 'Otros', icono: '📦', color: '#64748B', grupo: 'deseo' },
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

export const GRUPOS: Record<GrupoGasto, { titulo: string; pct: number; descripcion: string }> = {
  necesidad: { titulo: 'Necesidades', pct: 0.5, descripcion: 'Vivienda, comida, servicios, transporte…' },
  deseo: { titulo: 'Ocio y deseos', pct: 0.3, descripcion: 'Ocio, compras, restaurantes, suscripciones…' },
};
export const PCT_AHORRO = 0.2;

/**
 * Peso relativo de cada categoría dentro de su grupo al repartir
 * automáticamente (regla 50/30/20). Suman 1 dentro de cada grupo.
 */
const PESOS: Record<string, number> = {
  Vivienda: 0.45,
  Comida: 0.25,
  Servicios: 0.1,
  Transporte: 0.1,
  Salud: 0.05,
  Educación: 0.05,
  Ocio: 0.3,
  Compras: 0.25,
  Restaurantes: 0.2,
  Suscripciones: 0.1,
  Otros: 0.15,
};

/** Reparte unos ingresos mensuales entre las categorías de gasto (50/30/20). */
export function repartir503020(ingresoMensual: number): Record<string, number> {
  const res: Record<string, number> = {};
  for (const c of CATEGORIAS.gasto) {
    const grupo = GRUPOS[c.grupo ?? 'deseo'];
    const valor = ingresoMensual * grupo.pct * (PESOS[c.nombre] ?? 0);
    res[c.nombre] = Math.round(valor);
  }
  return res;
}
