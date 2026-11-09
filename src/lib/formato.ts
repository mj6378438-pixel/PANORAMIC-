const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function formatoDinero(valor: number): string {
  const signo = valor < 0 ? '-' : '';
  const [entero, dec] = Math.abs(valor).toFixed(2).split('.');
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${signo}$${conPuntos},${dec}`;
}

export function hoyISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Clave de mes "yyyy-mm" */
export function claveMes(fechaISO: string): string {
  return fechaISO.slice(0, 7);
}

export function nombreMes(clave: string): string {
  const [y, m] = clave.split('-').map(Number);
  return `${MESES[m - 1]} ${y}`;
}

export function moverMes(clave: string, delta: number): string {
  const [y, m] = clave.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatoFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split('-');
  return `${d}/${m}/${y}`;
}

/** Acepta "1.234,56", "1234.56", "1234,5" */
export function parsearMonto(texto: string): number {
  let t = texto.trim().replace(/\s/g, '').replace('$', '');
  if (t === '') return NaN;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

export function fechaValida(fechaISO: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return false;
  const [y, m, d] = fechaISO.split('-').map(Number);
  const f = new Date(y, m - 1, d);
  return f.getFullYear() === y && f.getMonth() === m - 1 && f.getDate() === d;
}
