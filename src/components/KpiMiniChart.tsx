'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useKpiPipStore } from '../store/kpiPip'

const CloseIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const ExpandIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
)
const ChevronLeft = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const ChevronRight = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const sizeConfig = {
  mini:   { width: 280, chartH: 60,  showAxis: false, showTooltip: false },
  normal: { width: 420, chartH: 140, showAxis: false, showTooltip: true },
  grande: { width: 560, chartH: 220, showAxis: true,  showTooltip: true },
}

export default function KpiMiniChart() {
  const { visible, size, allKpis, currentIndex, hide, next, prev, setSize, currentKpi } = useKpiPipStore()
  const router = useRouter()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const data = currentKpi()

  const cfg = sizeConfig[size]

  return (
    <AnimatePresence>
      {visible && data && (
        <motion.div
          key="pip"
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          drag
          dragMomentum={false}
          onDragEnd={(_, info) => setPosition(prev => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }))}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            x: position.x,
            y: position.y,
            zIndex: 9999,
            width: cfg.width,
            borderRadius: 20,
            background: 'rgba(20,17,36,0.96)',
            backdropFilter: 'blur(24px)',
            border: `1px solid ${data.color}40`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${data.color}15`,
            overflow: 'hidden',
            cursor: 'grab',
          }}
          whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px 6px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {/* Prev/Next */}
              <motion.button onClick={prev} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ChevronLeft />
              </motion.button>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: data.color, boxShadow: `0 0 8px ${data.color}`, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{data.label}</span>
              <span style={{ fontSize: 13, color: data.color, fontWeight: 700 }}>
                {data.unit}{data.ultimoValor.toFixed(1)}
              </span>
              <motion.button onClick={next} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ChevronRight />
              </motion.button>
              <span style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>
                {currentIndex + 1}/{allKpis.length}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
              {/* Size toggle */}
              {(['mini', 'normal', 'grande'] as const).map(s => (
                <motion.button key={s} onClick={() => setSize(s)} whileTap={{ scale: 0.9 }}
                  style={{
                    width: 20, height: 20, borderRadius: 6, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600,
                    background: size === s ? 'rgba(155,142,196,0.25)' : 'rgba(255,255,255,0.05)',
                    color: size === s ? 'var(--primary)' : 'var(--muted)',
                  }}>
                  {s === 'mini' ? 'S' : s === 'normal' ? 'M' : 'L'}
                </motion.button>
              ))}
              {/* Expand */}
              <motion.button
                onClick={() => { hide(); router.push('/dashboard/kpis') }}
                whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                style={{ width: 20, height: 20, borderRadius: 6, border: 'none', background: 'rgba(155,142,196,0.15)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ExpandIcon />
              </motion.button>
              {/* Close */}
              <motion.button onClick={hide} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                style={{ width: 20, height: 20, borderRadius: 6, border: 'none', background: 'rgba(232,160,196,0.15)', color: '#E8A0C4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloseIcon />
              </motion.button>
            </div>
          </div>

          {/* Chart */}
          <div style={{ padding: '0 8px 8px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={data.tipo}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ResponsiveContainer width="100%" height={cfg.chartH}>
                  <AreaChart data={data.datos} margin={{ top: 4, right: 4, left: cfg.showAxis ? 0 : 4, bottom: 4 }}>
                    <defs>
                      <linearGradient id={`pipGrad-${data.tipo}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={data.color} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={data.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    {cfg.showAxis && (
                      <>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,142,196,0.06)" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={35} />
                      </>
                    )}
                    {cfg.showTooltip && (
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(28,24,48,0.97)', border: `1px solid ${data.color}30`,
                          borderRadius: 10, fontSize: 11, padding: '6px 10px',
                        }}
                        labelStyle={{ color: 'var(--muted)', fontSize: 10 }}
                      />
                    )}
                    <Area
                      type="monotone" dataKey="valor" name={data.label}
                      stroke={data.color} strokeWidth={2}
                      fill={`url(#pipGrad-${data.tipo})`} dot={false}
                      animationDuration={300}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
