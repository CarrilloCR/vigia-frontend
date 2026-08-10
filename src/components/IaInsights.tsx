'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import api from '../lib/axios'
import GlowingCard from './reactbits/GlowingCard'

type Sat = {
  sede: string; capacidad_diaria: number; medicos_activos: number
  promedio_reciente: number; tendencia: string; saturacion_promedio_pct: number; riesgo: string
  dias: { fecha: string; citas_estimadas: number; saturacion_pct: number; riesgo: string }[]
}

const RIESGO_COLOR: Record<string, string> = { alto: '#E85D5D', medio: '#E8A064', bajo: '#00D6B2' }

const Ico = ({ d, c = 'var(--primary)' }: { d: string; c?: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d.split('|').map((p, i) => <path key={i} d={p} />)}</svg>
)
const IcoSaturacion = () => <Ico d="M3 3v18h18|M7 14l3-4 3 3 4-6" />
const IcoTendencias = () => <Ico c="#B06EF5" d="M12 2l2.4 6.9H21l-5.3 4 2 6.6L12 15.8 6.3 19.5l2-6.6L3 8.9h6.6z" />
const IcoResumen = () => <Ico d="M9 2h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z|M9 7h6|M9 11h6|M9 15h4" />
const IcoRiesgo = () => <Ico c="#E8A064" d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z|M12 9v4|M12 17h.01" />

type NoShow = { cita_id: number; fecha: string; paciente: string; medico: string; riesgo_pct: number; nivel: string; motivo: string }

export default function IaInsights({ clinicaId }: { clinicaId: number }) {
  const router = useRouter()
  const [sat, setSat] = useState<Sat[] | null>(null)
  const [analisis, setAnalisis] = useState<string | null>(null)
  const [loadingT, setLoadingT] = useState(false)
  const [errT, setErrT] = useState<string | null>(null)
  const [noshow, setNoshow] = useState<NoShow[] | null>(null)
  const [resumen, setResumen] = useState<string | null>(null)
  const [loadingR, setLoadingR] = useState(false)
  const [errR, setErrR] = useState<string | null>(null)

  // Persistencia: resumen y análisis quedan guardados en el navegador (por
  // clínica) para que no se pierdan al recargar. "Limpiar" los borra.
  const kR = `vigia-ia-resumen-${clinicaId}`
  const kT = `vigia-ia-tendencias-${clinicaId}`

  // Plan: las funciones de IA (KPIs IA + reportes IA) requieren Básico o superior.
  const [plan, setPlan] = useState<string | null>(null)
  const tieneIA = plan !== null && plan !== 'gratis'

  useEffect(() => {
    api.get(`/clinicas/${clinicaId}/`).then(r => setPlan(r.data.plan)).catch(() => setPlan('gratis'))
  }, [clinicaId])

  useEffect(() => {
    if (!tieneIA) return
    api.get(`/ia/saturacion/?clinica=${clinicaId}`).then(r => setSat(r.data.sedes)).catch(() => {})
    api.get(`/ia/noshow-riesgo/?clinica=${clinicaId}`).then(r => setNoshow(r.data.citas)).catch(() => {})
    try {
      setResumen(localStorage.getItem(kR))
      setAnalisis(localStorage.getItem(kT))
    } catch { /* ignore */ }
  }, [clinicaId, tieneIA])

  const [enviandoR, setEnviandoR] = useState(false)
  const [enviadoMsg, setEnviadoMsg] = useState<string | null>(null)
  const pedirResumen = async () => {
    setLoadingR(true); setErrR(null)
    try {
      const r = await api.get(`/ia/resumen-ejecutivo/?clinica=${clinicaId}`)
      setResumen(r.data.resumen); try { localStorage.setItem(kR, r.data.resumen) } catch {}
    }
    catch (e: any) { setErrR(e.response?.data?.error || 'No se pudo generar') }
    finally { setLoadingR(false) }
  }
  const limpiarResumen = () => { setResumen(null); setEnviadoMsg(null); try { localStorage.removeItem(kR) } catch {} }
  const enviarResumenCorreo = async () => {
    setEnviandoR(true); setEnviadoMsg(null)
    try {
      const r = await api.get(`/ia/resumen-ejecutivo/?clinica=${clinicaId}&enviar=1`)
      setResumen(r.data.resumen); try { localStorage.setItem(kR, r.data.resumen) } catch {}
      setEnviadoMsg(`Enviado: ${r.data.enviado || 'ok'}`)
    } catch (e: any) { setEnviadoMsg(e.response?.data?.error || 'No se pudo enviar') }
    finally { setEnviandoR(false) }
  }

  const pedirAnalisis = async () => {
    setLoadingT(true); setErrT(null)
    try {
      const r = await api.get(`/ia/tendencias/?clinica=${clinicaId}`)
      setAnalisis(r.data.analisis); try { localStorage.setItem(kT, r.data.analisis) } catch {}
    } catch (e: any) {
      setErrT(e.response?.data?.error || 'No se pudo generar el análisis')
    } finally { setLoadingT(false) }
  }
  const limpiarAnalisis = () => { setAnalisis(null); try { localStorage.removeItem(kT) } catch {} }

  // Renderiza el análisis con secciones MEJORAS/RIESGOS/ACCIONES resaltadas
  const renderAnalisis = (txt: string) => txt.split('\n').map((linea, i) => {
    const m = /^(MEJORAS|RIESGOS|ACCIONES):/.exec(linea.trim())
    if (m) {
      const col = m[1] === 'MEJORAS' ? '#00D6B2' : m[1] === 'RIESGOS' ? '#E85D5D' : '#B06EF5'
      return <p key={i} style={{ fontSize: 13, fontWeight: 800, color: col, margin: '14px 0 4px', letterSpacing: '0.03em' }}>{m[1]}</p>
    }
    return linea.trim() ? <p key={i} style={{ fontSize: 13, color: 'var(--muted)', margin: '3px 0', lineHeight: 1.55 }}>{linea}</p> : null
  })

  // Plan Gratis: sin funciones de IA → invita a comprar suscripción.
  if (plan !== null && !tieneIA) {
    return (
      <GlowingCard className="p-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <IcoTendencias />
          <h3 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Funciones de IA</h3>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(232,196,144,0.15)', color: '#E8C490', border: '1px solid rgba(232,196,144,0.35)' }}>Plan Básico o superior</span>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 560, margin: '0 0 18px' }}>
          Predicción de saturación, análisis de tendencias, resumen ejecutivo y riesgo de no-show usan IA (Claude) y no están incluidos en el plan Gratis. Mejora tu plan para desbloquearlos.
        </p>
        <motion.button onClick={() => router.push('/dashboard/configuracion')}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ fontSize: 13.5, fontWeight: 700, padding: '11px 22px', borderRadius: 12, border: 'none', color: 'white', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--accent))', boxShadow: '0 4px 18px rgba(0,214,178,0.35)' }}>
          Comprar suscripción
        </motion.button>
      </GlowingCard>
    )
  }

  return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      {/* Predicción de saturación */}
      <GlowingCard className="p-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <IcoSaturacion />
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Predicción de saturación</h3>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '0 0 16px' }}>Demanda proyectada de citas vs capacidad, próximos 7 días.</p>
        {!sat ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Calculando…</p> : sat.map((s, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{s.sede}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: RIESGO_COLOR[s.riesgo], background: `${RIESGO_COLOR[s.riesgo]}22`, border: `1px solid ${RIESGO_COLOR[s.riesgo]}44` }}>
                {s.saturacion_promedio_pct}% · riesgo {s.riesgo}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 44 }}>
              {s.dias.map((d, j) => (
                <div key={j} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.min(d.saturacion_pct, 100) * 0.34}px` }} transition={{ delay: j * 0.04 }}
                    style={{ width: '100%', borderRadius: 3, background: RIESGO_COLOR[d.riesgo], minHeight: 3 }} title={`${d.fecha}: ${d.saturacion_pct}%`} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
              {s.medicos_activos} médicos · cap. {s.capacidad_diaria}/día · tendencia {s.tendencia}
            </p>
          </div>
        ))}
      </GlowingCard>

      {/* Análisis de tendencias con IA */}
      <GlowingCard className="p-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IcoTendencias />
            <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Análisis de tendencias (IA)</h3>
          </div>
          {!analisis ? (
            <motion.button onClick={pedirAnalisis} disabled={loadingT} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 10, border: 'none', color: 'white', cursor: loadingT ? 'wait' : 'pointer', background: 'linear-gradient(135deg, #B06EF5, var(--accent))' }}>
              {loadingT ? 'Analizando…' : 'Analizar con IA'}
            </motion.button>
          ) : (
            <motion.button onClick={limpiarAnalisis} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 10, border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', background: 'var(--sunken)' }}>
              Limpiar
            </motion.button>
          )}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '0 0 12px' }}>Claude analiza el histórico de KPIs y recomienda acciones.</p>
        {errT && <p style={{ fontSize: 13, color: 'var(--danger)' }}>{errT}</p>}
        {analisis ? <div>{renderAnalisis(analisis)}</div>
          : !errT && <p style={{ fontSize: 13, color: 'var(--muted)', opacity: 0.7 }}>Pulsa «Analizar con IA» para generar el análisis.</p>}
      </GlowingCard>
    </div>

    {/* Segunda fila: resumen ejecutivo + riesgo de no-show */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <GlowingCard className="p-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IcoResumen />
            <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Resumen ejecutivo (IA)</h3>
          </div>
          {!resumen && (
            <motion.button onClick={pedirResumen} disabled={loadingR} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 10, border: 'none', color: 'white', cursor: loadingR ? 'wait' : 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              {loadingR ? 'Generando…' : 'Generar'}
            </motion.button>
          )}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '0 0 12px' }}>Estado del día y prioridades, redactado por IA.</p>
        {errR && <p style={{ fontSize: 13, color: 'var(--danger)' }}>{errR}</p>}
        {resumen ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{resumen}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <motion.button onClick={enviarResumenCorreo} disabled={enviandoR} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ fontSize: 12.5, fontWeight: 600, padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--sunken)', color: 'var(--text)', cursor: enviandoR ? 'wait' : 'pointer' }}>
                {enviandoR ? 'Enviando…' : '✉ Enviar al correo'}
              </motion.button>
              <motion.button onClick={limpiarResumen} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ fontSize: 12, fontWeight: 600, padding: '7px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}>
                Limpiar
              </motion.button>
              {enviadoMsg && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{enviadoMsg}</span>}
            </div>
          </>
        ) : !errR && <p style={{ fontSize: 13, color: 'var(--muted)', opacity: 0.7 }}>Pulsa «Generar» para el resumen del día.</p>}
      </GlowingCard>

      <GlowingCard className="p-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <IcoRiesgo />
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Riesgo de no-show</h3>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '0 0 12px' }}>Próximas citas con mayor probabilidad de ausencia — prioriza recordatorios.</p>
        {!noshow ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Calculando…</p>
          : noshow.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin citas de riesgo próximas.</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
              {noshow.slice(0, 8).map(n => (
                <div key={n.cita_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--sunken)', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.paciente}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{n.fecha} · {n.medico} · {n.motivo}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                    color: RIESGO_COLOR[n.nivel], background: `${RIESGO_COLOR[n.nivel]}22`, border: `1px solid ${RIESGO_COLOR[n.nivel]}44` }}>
                    {n.riesgo_pct}%
                  </span>
                </div>
              ))}
            </div>
          )}
      </GlowingCard>
    </div>
   </div>
  )
}
