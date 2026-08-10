'use client'
import { useEffect, useRef } from 'react'
import { usePrefsStore } from '../store/prefs'
import { EN } from '../lib/i18n'
import api from '../lib/axios'

/**
 * Traductor global ES→EN.
 * Capa 1: diccionario estático (EN) — instantáneo.
 * Capa 2: fallback con IA — lo que no está en el diccionario se manda a Claude
 *         (endpoint /ia/traducir), se cachea en localStorage y se aplica.
 * Recorre el DOM (textos + placeholders/title/aria-label). Datos dinámicos
 * (nombres, números) no se traducen. Al volver a español, restaura.
 */
const originals = new WeakMap<Text, string>()
const attrOriginals = new WeakMap<Element, Record<string, string>>()
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt']
const CACHE_KEY = 'vigia-i18n-en'

// Diccionario dinámico (IA), cacheado.
const dyn: Record<string, string> = (() => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} }
})()
const pendientes = new Set<string>()

function trad(key: string): string | null {
  const k = key.trim()
  if (!k) return null
  const en = EN[k] ?? dyn[k]
  return en && en !== k ? en : null
}
function candidato(raw: string): boolean {
  const k = raw.trim()
  if (k.length < 2 || k.length > 200) return false
  if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ¿¡]/.test(k)) return false   // debe tener letras
  if (/^\d/.test(k)) return false                       // empieza con número → dato
  if (EN[k] || dyn[k]) return false                     // ya traducido
  return true
}

function traducirTexto(tn: Text) {
  const raw = tn.nodeValue ?? ''
  const en = trad(raw)
  if (en) {
    if (!originals.has(tn)) originals.set(tn, raw)
    const nuevo = raw.replace(raw.trim(), en)
    if (tn.nodeValue !== nuevo) tn.nodeValue = nuevo
  } else if (candidato(raw)) {
    pendientes.add(raw.trim())
  }
}
function restaurarTexto(tn: Text) {
  const o = originals.get(tn)
  if (o != null && tn.nodeValue !== o) tn.nodeValue = o
}
function traducirAttrs(el: Element) {
  for (const a of ATTRS) {
    const v = el.getAttribute(a); if (!v) continue
    const en = trad(v)
    if (en) {
      const store = attrOriginals.get(el) || {}
      if (!(a in store)) { store[a] = v; attrOriginals.set(el, store) }
      el.setAttribute(a, en)
    } else if (candidato(v)) pendientes.add(v.trim())
  }
}
function restaurarAttrs(el: Element) {
  const store = attrOriginals.get(el)
  if (store) for (const a in store) el.setAttribute(a, store[a])
}
function recorrer(root: Node, textFn: (t: Text) => void, elFn: (e: Element) => void) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode(n) {
      const p = (n.nodeType === Node.TEXT_NODE ? n.parentElement : n as Element)
      const tag = p?.tagName
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  let node: Node | null = walker.currentNode
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) textFn(node as Text)
    else if (node.nodeType === Node.ELEMENT_NODE) elFn(node as Element)
    node = walker.nextNode()
  }
}

export default function AutoTranslate() {
  const idioma = usePrefsStore(s => s.idioma)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fetching = useRef(false)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const en = idioma === 'en'
    const root = document.body

    const aplicar = () => {
      if (en) recorrer(root, traducirTexto, traducirAttrs)
      else recorrer(root, restaurarTexto, restaurarAttrs)
    }

    // Manda a la IA lo pendiente, cachea y reaplica.
    const traducirPendientes = async () => {
      if (!en || fetching.current || pendientes.size === 0) return
      const lote = Array.from(pendientes).slice(0, 100)
      lote.forEach(t => pendientes.delete(t))
      fetching.current = true
      try {
        const { data } = await api.post('/ia/traducir/', { textos: lote })
        const tr = data?.traducciones || {}
        let cambio = false
        for (const k in tr) { if (typeof tr[k] === 'string' && tr[k] !== k) { dyn[k] = tr[k]; cambio = true } }
        if (cambio) {
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(dyn)) } catch {}
          recorrer(root, traducirTexto, traducirAttrs)  // reaplica con lo nuevo
        }
      } catch { /* silencioso */ }
      finally { fetching.current = false; if (pendientes.size) programar() }
    }
    const programar = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(traducirPendientes, 700)
    }

    aplicar()
    if (en) programar()

    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'characterData' && m.target.nodeType === Node.TEXT_NODE) {
          en ? traducirTexto(m.target as Text) : restaurarTexto(m.target as Text)
        } else if (m.type === 'attributes' && m.target.nodeType === Node.ELEMENT_NODE) {
          en ? traducirAttrs(m.target as Element) : restaurarAttrs(m.target as Element)
        } else if (m.type === 'childList') {
          m.addedNodes.forEach(n => {
            if (n.nodeType === Node.TEXT_NODE) { en ? traducirTexto(n as Text) : restaurarTexto(n as Text) }
            else if (n.nodeType === Node.ELEMENT_NODE) recorrer(n, en ? traducirTexto : restaurarTexto, en ? traducirAttrs : restaurarAttrs)
          })
        }
      }
      if (en && pendientes.size) programar()
    })
    obs.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS })
    return () => { obs.disconnect(); if (timer.current) clearTimeout(timer.current) }
  }, [idioma])

  return null
}
