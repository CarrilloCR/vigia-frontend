import { useEffect, useMemo, useState } from 'react'

export interface SortOption<T> {
  key: string
  label: string
  get: (x: T) => number | string
}

/**
 * Ordena + pagina un arreglo del lado del cliente. Los listados ya traen los
 * datos filtrados; esto agrega orden (asc/desc) y paginación real (páginas +
 * tamaño de página), no solo "cargar más".
 */
export function useSortPaginate<T>(
  items: T[],
  opts: {
    sortOptions: SortOption<T>[]
    pageSize?: number
    initialSort?: string
    initialDir?: 'asc' | 'desc'
  },
) {
  const [sortKey, setSortKey] = useState(opts.initialSort ?? opts.sortOptions[0]?.key)
  const [dir, setDir] = useState<'asc' | 'desc'>(opts.initialDir ?? 'asc')
  const [pageSize, setPageSize] = useState(opts.pageSize ?? 10)
  const [page, setPage] = useState(1)

  // Al cambiar orden/tamaño o encoger la lista, vuelve a la primera página.
  useEffect(() => { setPage(1) }, [sortKey, dir, pageSize, items.length])

  const sorted = useMemo(() => {
    const opt = opts.sortOptions.find(o => o.key === sortKey)
    if (!opt) return items
    const arr = [...items].sort((a, b) => {
      const va = opt.get(a), vb = opt.get(b)
      if (typeof va === 'string' || typeof vb === 'string') {
        return String(va).localeCompare(String(vb), 'es', { numeric: true })
      }
      return (va as number) - (vb as number)
    })
    if (dir === 'desc') arr.reverse()
    return arr
  }, [items, sortKey, dir]) // eslint-disable-line react-hooks/exhaustive-deps

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const curPage = Math.min(page, totalPages)
  const start = (curPage - 1) * pageSize
  const paged = sorted.slice(start, start + pageSize)

  return {
    paged,
    sortKey, setSortKey,
    dir, setDir, toggleDir: () => setDir(d => (d === 'asc' ? 'desc' : 'asc')),
    page: curPage, setPage,
    pageSize, setPageSize,
    total, totalPages,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
    sortOptions: opts.sortOptions,
  }
}
