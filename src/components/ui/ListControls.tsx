'use client'
import { motion } from 'framer-motion'

interface SortOpt { key: string; label: string }

/** Barra de orden: selector de criterio + botón asc/desc. Va arriba del listado. */
export function SortControl({
  sortOptions, sortKey, setSortKey, dir, toggleDir,
}: {
  sortOptions: SortOpt[]
  sortKey: string
  setSortKey: (k: string) => void
  dir: 'asc' | 'desc'
  toggleDir: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Ordenar</span>
      <select value={sortKey} onChange={e => setSortKey(e.target.value)}
        style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>
        {sortOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
      <motion.button onClick={toggleDir} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        title={dir === 'asc' ? 'Ascendente' : 'Descendente'}
        style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
        {dir === 'asc' ? '↑' : '↓'}
      </motion.button>
    </div>
  )
}

/** Paginación: rango + tamaño de página + prev/next con números. Va abajo del listado. */
export function Paginacion({
  from, to, total, page, totalPages, setPage, pageSize, setPageSize,
}: {
  from: number; to: number; total: number
  page: number; totalPages: number; setPage: (p: number) => void
  pageSize: number; setPageSize: (n: number) => void
}) {
  if (total === 0) return null
  // Ventana de páginas alrededor de la actual.
  const nums: number[] = []
  const win = 2
  for (let i = Math.max(1, page - win); i <= Math.min(totalPages, page + win); i++) nums.push(i)

  const btn = (active: boolean): React.CSSProperties => ({
    minWidth: 34, height: 34, padding: '0 8px', borderRadius: 9,
    background: active ? 'rgba(0,214,178,0.15)' : 'var(--sunken)',
    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
    color: active ? 'var(--primary)' : 'var(--text)',
    cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500,
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>{from}–{to}</strong> de {total}
        </span>
        <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
          style={{ padding: '6px 10px', borderRadius: 9, background: 'var(--sunken)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12.5, cursor: 'pointer' }}>
          {[...new Set([pageSize, 10, 20, 50, 100])].sort((a, b) => a - b).map(n => <option key={n} value={n}>{n} / pág</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
          style={{ ...btn(false), opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>←</button>
        {nums[0] > 1 && <>
          <button onClick={() => setPage(1)} style={btn(false)}>1</button>
          {nums[0] > 2 && <span style={{ color: 'var(--muted)', fontSize: 13 }}>…</span>}
        </>}
        {nums.map(n => (
          <button key={n} onClick={() => setPage(n)} style={btn(n === page)}>{n}</button>
        ))}
        {nums[nums.length - 1] < totalPages && <>
          {nums[nums.length - 1] < totalPages - 1 && <span style={{ color: 'var(--muted)', fontSize: 13 }}>…</span>}
          <button onClick={() => setPage(totalPages)} style={btn(false)}>{totalPages}</button>
        </>}
        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
          style={{ ...btn(false), opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>→</button>
      </div>
    </div>
  )
}
