'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../../../lib/axios'
import Aurora from '../../../../components/reactbits/Aurora'
import GlowingCard from '../../../../components/reactbits/GlowingCard'
import FadeContent from '../../../../components/reactbits/FadeContent'
import CountUp from '../../../../components/reactbits/CountUp'
import ThemeToggle from '../../../../components/ui/ThemeToggle'

const kpiConfig: Record<string, { label: string; color: string; unit: string }> = {
  tasa_cancelacion:  { label: 'Cancelación',  color: '#E8A0C4', unit: '%' },
  tasa_noshow:       { label: 'No-Show',       color: '#C4B5E8', unit: '%' },
  ingresos_dia:      { label: 'Ingresos',      color: '#A0C4B5', unit: '$' },
  ticket_promedio:   { label: 'Ticket Prom',   color: '#9B8EC4', unit: '$' },
  pacientes_nuevos:  { label: 'Pac. Nuevos',   color: '#7C6FBF', unit: '%' },
  retencion_90:      { label: 'Retención',     color: '#BBA8E8', unit: '%' },
  nps:               { label: 'NPS',           color: '#A8C4A0', unit: ''  },
  citas_reagendadas: { label: 'Reagendadas',   color: '#E8C4A0', unit: '%' },
}

const sevConfig: Record<string, { label: string; color: string }> = {
  baja:    { label: 'Baja',    color: '#A0C4B5' },
  media:   { label: 'Media',   color: '#C4B5E8' },
  alta:    { label: 'Alta',    color: '#9B8EC4' },
  critica: { label: 'Crítica', color: '#E8A0C4' },
}

const ArrowLeftIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(28,24,48,0.97)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(155,142,196,0.3)', borderRadius: 12,
        padding: '10px 14px', fontSize: 13,
      }}>
        <p style={{ color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function MedicoPage() {
  const [medico, setMedico] = useState<any>(null)
  const [alertas, setAlertas] = useState<any[]>([])
  const [kpis, setKpis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [kpiSeleccionado, setKpiSeleccionado] = useState('ingresos_dia')
  const [tab, setTab] = useState<'kpis' | 'alertas'>('kpis')
  const router = useRouter()
  const params = useParams()
  const id = params.id

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    try {
      const [medicoRes, alertasRes, kpisRes] = await Promise.all([
        api.get(`/medicos/${id}/`),
        api.get(`/alertas/?medico=${id}`),
        api.get(`/kpis/?medico=${id}&horas=24`),
      ])
      setMedico(medicoRes.data)
      setAlertas(alertasRes.data.results || alertasRes.data)
      setKpis(kpisRes.data.results || kpisRes.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const calcularPromedio = (tipo: string) => {
    const registros = kpis.filter(k => k.tipo === tipo)
    if (registros.length === 0) return 0
    return registros.reduce((acc, k) => acc + k.valor, 0) / registros.length
  }

  const datosGrafica = kpis
    .filter(k => k.tipo === kpiSeleccionado)
    .slice(-20)
    .map(k => ({
      fecha: new Date(k.fecha_hora).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
      valor: Math.round(k.valor * 100) / 100,
    }))

  const cfgKpi = kpiConfig[kpiSeleccionado]

  if (loading) return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
    </div>
  )

  if (!medico) return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--danger)', fontSize: 16 }}>Médico no encontrado</p>
    </div>
  )

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora colorStops={['#9B8EC4', '#7C6FBF', '#C4B5E8']} amplitude={0.4} speed={0.1} />
      </div>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '32px 48px', maxWidth: 1400, margin: '0 auto' }}>

        {/* HEADER */}
        <FadeContent direction="down" duration={0.5}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <motion.button
                onClick={() => router.push('/dashboard/medicos')}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}
              >
                <ArrowLeftIcon />
              </motion.button>

              {/* Avatar grande */}
              <motion.div
                style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 700, flexShrink: 0 }}
                animate={{ boxShadow: ['0 0 16px rgba(155,142,196,0.3)', '0 0 36px rgba(155,142,196,0.6)', '0 0 16px rgba(155,142,196,0.3)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {medico.nombre[0]}{medico.apellido[0]}
              </motion.div>

              <div>
                <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                  Dr. {medico.nombre} {medico.apellido}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, padding: '3px 12px', borderRadius: 20, background: 'rgba(155,142,196,0.15)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)' }}>
                    {medico.especialidad}
                  </span>
                  {medico.email && (
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>{medico.email}</span>
                  )}
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </FadeContent>

        {/* STATS CARDS */}
        <FadeContent direction="up" delay={0.1} duration={0.5}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 }}>
            {[
              { label: 'Alertas totales', value: alertas.length, color: '#9B8EC4' },
              { label: 'Alertas críticas', value: alertas.filter(a => a.severidad === 'critica').length, color: '#E8A0C4' },
              { label: 'Alertas activas', value: alertas.filter(a => a.estado === 'activa').length, color: '#C4B5E8' },
              { label: 'Registros KPI', value: kpis.length, color: '#A0C4B5' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ padding: '24px 24px', borderRadius: 24, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)' }}>
                <p className="font-display" style={{ fontSize: 40, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 8 }}>
                  <CountUp to={s.value} duration={1} />
                </p>
                <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </FadeContent>

        {/* TABS */}
        <FadeContent direction="up" delay={0.2} duration={0.4}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 16, padding: 4, width: 'fit-content' }}>
            {(['kpis', 'alertas'] as const).map(t => (
              <motion.button
                key={t}
                onClick={() => setTab(t)}
                whileTap={{ scale: 0.97 }}
                style={{ padding: '11px 28px', borderRadius: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden', background: 'transparent', color: tab === t ? 'white' : 'var(--muted)' }}
              >
                {tab === t && (
                  <motion.div layoutId="medicoTab"
                    style={{ position: 'absolute', inset: 0, borderRadius: 13, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {t === 'kpis' ? `KPIs (${Object.keys(kpiConfig).length})` : `Alertas (${alertas.length})`}
                </span>
              </motion.button>
            ))}
          </div>
        </FadeContent>

        {tab === 'kpis' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

            {/* GRÁFICA */}
            <FadeContent direction="up" delay={0.25} duration={0.4}>
              <GlowingCard className="p-8">
                {/* Selector KPI */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                  {Object.entries(kpiConfig).map(([tipo, cfg]) => {
                    const isSelected = kpiSeleccionado === tipo
                    const promedio = calcularPromedio(tipo)
                    return (
                      <motion.button
                        key={tipo}
                        onClick={() => setKpiSeleccionado(tipo)}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        style={{
                          padding: '8px 14px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                          cursor: 'pointer', border: 'none', position: 'relative', overflow: 'hidden',
                          background: isSelected ? 'transparent' : 'rgba(255,255,255,0.04)',
                          borderWidth: 1, borderStyle: 'solid',
                          borderColor: isSelected ? cfg.color : 'var(--border)',
                          color: isSelected ? 'white' : 'var(--muted)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isSelected && (
                          <motion.div layoutId="kpiMedico"
                            style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${cfg.color}CC, ${cfg.color}88)` }}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <span style={{ position: 'relative', zIndex: 1 }}>{cfg.label}</span>
                      </motion.button>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{cfgKpi?.label}</h2>
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{datosGrafica.length} registros · últimas 24h</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="font-display" style={{ fontSize: 32, fontWeight: 800, color: cfgKpi?.color, lineHeight: 1 }}>
                      {cfgKpi?.unit}<CountUp to={calcularPromedio(kpiSeleccionado)} decimals={1} duration={0.8} />
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>promedio</p>
                  </div>
                </div>

                {datosGrafica.length === 0 ? (
                  <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sin datos para este KPI</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={datosGrafica} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMedico" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={cfgKpi?.color} stopOpacity={0.35}/>
                          <stop offset="95%" stopColor={cfgKpi?.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(155,142,196,0.08)" />
                      <XAxis dataKey="fecha" stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="var(--muted)" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="valor" name={cfgKpi?.label}
                        stroke={cfgKpi?.color} strokeWidth={2.5}
                        fill="url(#colorMedico)" dot={false}
                        activeDot={{ r: 5, fill: cfgKpi?.color, stroke: 'var(--void)', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </GlowingCard>
            </FadeContent>

            {/* SIDEBAR PROMEDIOS */}
            <FadeContent direction="right" delay={0.3} duration={0.4}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  Promedios históricos
                </p>
                {Object.entries(kpiConfig).map(([tipo, cfg], i) => {
                  const promedio = calcularPromedio(tipo)
                  const isSelected = kpiSeleccionado === tipo
                  return (
                    <motion.div
                      key={tipo}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      onClick={() => setKpiSeleccionado(tipo)}
                      whileHover={{ scale: 1.02 }}
                      style={{
                        padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                        background: isSelected ? `${cfg.color}15` : 'var(--glass)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${isSelected ? cfg.color + '40' : 'var(--border)'}`,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{cfg.label}</p>
                        <p className="font-display" style={{ fontSize: 18, fontWeight: 700, color: cfg.color }}>
                          {cfg.unit}<CountUp to={promedio} decimals={1} duration={0.8} />
                        </p>
                      </div>
                      <div style={{ marginTop: 8, height: 2, borderRadius: 2, background: `${cfg.color}20` }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (promedio / (cfg.unit === '$' ? 800 : 100)) * 100)}%` }}
                          transition={{ duration: 1, delay: i * 0.05 }}
                          style={{ height: '100%', borderRadius: 2, background: cfg.color }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </FadeContent>
          </div>
        ) : (
          /* TAB ALERTAS */
          <FadeContent direction="up" delay={0.25} duration={0.4}>
            <GlowingCard className="p-8">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                  Historial de alertas
                </h2>
                <span style={{ fontSize: 14, fontWeight: 500, padding: '6px 16px', borderRadius: 20, background: 'rgba(155,142,196,0.12)', color: 'var(--primary)', border: '1px solid rgba(155,142,196,0.2)' }}>
                  {alertas.length} registros
                </span>
              </div>

              {alertas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                    style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <CheckCircleIcon />
                  </motion.div>
                  <p className="font-display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Sin alertas registradas</p>
                  <p style={{ fontSize: 14, color: 'var(--muted)' }}>Este médico no tiene alertas en el historial</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
                  {alertas.map((a, i) => {
                    const sev = sevConfig[a.severidad] || sevConfig.baja
                    const kpi = kpiConfig[a.tipo_kpi]
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{ padding: '18px 20px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: `1px solid ${sev.color}28` }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: sev.color, boxShadow: `0 0 6px ${sev.color}`, marginTop: 6, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${sev.color}18`, color: sev.color, border: `1px solid ${sev.color}30` }}>
                                {sev.label}
                              </span>
                              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                                {kpi?.label || a.tipo_kpi}
                              </span>
                              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border)', marginLeft: 'auto' }}>
                                {a.estado}
                              </span>
                            </div>
                            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', opacity: 0.85, marginBottom: 8 }}>{a.mensaje}</p>
                            {a.recomendacion && a.recomendacion !== 'Ejecuta el análisis manual para obtener recomendaciones con IA.' && (
                              <div style={{ padding: '10px 14px', borderRadius: 12, marginBottom: 8, background: 'rgba(155,142,196,0.07)', border: '1px solid rgba(155,142,196,0.15)', fontSize: 13, lineHeight: 1.6, color: 'var(--glow)' }}>
                                {a.recomendacion}
                              </div>
                            )}
                            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {new Date(a.creada_en).toLocaleString('es-CR')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </GlowingCard>
          </FadeContent>
        )}
      </div>
    </div>
  )
}