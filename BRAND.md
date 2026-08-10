# Vigía — Sistema de Identidad de Marca

> Dirección: **Editorial moderno** · Dark-first (ambos temas pulidos) · Motion moderado con propósito.
> Este documento es la fuente de verdad para la estética. El design system (`globals.css` + primitivas) implementa lo que aquí se define.

---

## 1. Esencia

**Vigía** = quien vigila. Sistema de alertas inteligentes para clínicas médicas: observa los datos, detecta la anomalía, avisa antes de que duela.

- **Personalidad:** precisa, alerta, confiable, con carácter. No es un dashboard genérico — es una sala de vigilancia médica con opinión de diseño.
- **Tono de voz (UI, español):** claro y directo. Frases cortas. Sin jerga innecesaria. La urgencia se comunica con color y jerarquía, no con signos de exclamación.
- **Anti-patrones:** nada de degradados arcoíris por decoración, nada de glow saturado, nada de 3D gratuito. El impacto viene de **tipografía grande + espacio + un acento bold puntual**.

---

## 2. Marca gráfica

El logo es la **V con pulso ECG**: dos brazos (jade → orchid) que descienden a un ápice, cruzados por una línea de pulso cardíaco. Significa vigilancia + signo vital.

- Usar siempre sobre fondo con contraste suficiente. Tamaño mínimo legible: 28px.
- El pulso ECG es el motivo recurrente de marca: puede aparecer como separador, loader, o detalle en headers.
- No rotar, no re-colorear los brazos, no aplicar sombra dura.

---

## 3. Paleta

Filosofía editorial: **base neutra profunda + jade como color de marca + UN acento bold usado con moderación.** El color grita solo cuando hay señal (alerta).

### Marca
| Token | Hex (dark) | Hex (light) | Uso |
|-------|-----------|-------------|-----|
| `--brand` (jade) | `#00C9A7` | `#00A88A` | Color de marca, primario, éxito, foco. |
| `--brand-glow` | `#70FFE0` | `#00A88A` | Realces puntuales, hover del brand. |

### Acento editorial (bold, puntual)
| Token | Hex (dark) | Hex (light) | Uso |
|-------|-----------|-------------|-----|
| `--signal` (coral) | `#FF6B6B` | `#E84545` | **El acento bold.** Alertas, números críticos, CTA destacado, detalles editoriales. Máx ~1 uso dominante por vista. |
| `--accent` (orchid) | `#B06EF5` | `#8A44D8` | Secundario expresivo: gradientes de marca, categorías, detalles. |

### Semánticos (severidad de alertas)
| Rol | Color | Severidad |
|-----|-------|-----------|
| `--danger` | coral `#FF6B6B` | crítica / alta |
| `--warning` | gold `#FFD166` | media |
| `--info` | sapphire `#4A9EF0` | baja / informativo |
| `--success` | jade | resuelto / ok |

### Neutros (dark)
`--void #060D14` (fondo) · `--surface #0C1420` · `--card #121E2E` · `--lift #1A2840` · `--sunken #080F1A`

### Texto (dark)
`--text #E8F4F2` · `--sub #8FBFB8` · `--muted #4A7A74` · `--faint #1E3A36`

> **Regla de oro editorial:** en una vista típica, el 90% es neutro + jade. El coral aparece poco y por eso pega fuerte. Si todo es colorido, nada resalta.

---

## 4. Tipografía

Editorial = **la tipografía es el protagonista.** Escala amplia, contraste fuerte entre display y cuerpo.

- **Display / Headings:** `Syne` (600–800). Titulares grandes, tight tracking, a veces enormes (hero KPIs, page titles). Es la firma visual.
- **Cuerpo / UI:** `Space Grotesk` (300–600). Legible, técnico, moderno.
- **Datos / mono opcional:** números tabulares con `font-variant-numeric: tabular-nums` para KPIs.

### Escala tipográfica (rem base 16)
| Token | Tamaño | Uso |
|-------|--------|-----|
| `display-xl` | 64–96px (clamp) | Hero / número KPI protagonista (Syne 800) |
| `display-lg` | 40–56px | Título de página (Syne 700) |
| `display-md` | 28–34px | Sección grande (Syne 700) |
| `h1` | 24px | (Syne 600) |
| `h2` | 20px | (Syne 600) |
| `h3` | 16px | (Space Grotesk 600) |
| `body` | 15px | Cuerpo (Space Grotesk 400) |
| `sm` | 13px | Secundario (Space Grotesk 400) |
| `xs` | 11px | Labels / badges (Space Grotesk 600, uppercase, tracking 0.4px) |

**Firma editorial:** los títulos de página usan Syne grande + un `eyebrow` (xs uppercase, color `--sub`) encima. Ej: eyebrow "PANEL DE ALERTAS" / título "Buenos días, Fabián".

---

## 5. Espacio y layout

Editorial vive del **espacio negativo** y del **layout asimétrico**.

- **Escala de espaciado (px):** 4, 8, 12, 16, 24, 32, 48, 64, 96. Usar solo estos valores.
- **Ritmo generoso:** más aire entre secciones (48–96px) que en el diseño actual.
- **Asimetría:** grids no siempre uniformes. Un KPI hero grande + satélites pequeños. Alinear a una columna fuerte, romper con intención.
- **Ancho de contenido:** máx 1600px, con padding lateral responsivo (20 → 56px).
- **Densidad:** las tablas/listas densas; los hero/headers, aireados. Contraste de densidad = editorial.

### Radios
`--r-sm 8px` · `--r-md 12px` · `--r-lg 16px` · `--r-xl 24px` · `--r-full 999px`

### Sombras (dark, sutiles + profundidad real)
`--shadow-sm` · `--shadow-md` · `--shadow-lg` + glows de marca `--shadow-brand` / `--shadow-signal` usados con moderación.

---

## 6. Componentes (principios)

- **Card:** superficie `--card`, borde fino `--border` (1px), radio `lg`. Sin glow por defecto; glow solo en hover o estado activo/alerta. Padding 24–32.
- **Button:** 3 variantes — `primary` (jade sólido/gradiente), `ghost` (glass + borde), `signal` (coral, solo para acciones destacadas/destructivas). Radio `md`. Micro-scale en hover/tap.
- **Badge / Severidad:** pill xs uppercase, color por severidad. Es donde el color semántico vive.
- **Stat / KPI:** número en Syne grande (`display`), label eyebrow xs arriba, delta con flecha + color semántico. Tabular-nums.
- **Input:** glass, borde fino, foco jade con ring suave.
- **PageShell / SectionHeading:** patrón editorial estándar (eyebrow + título display + acción a la derecha).

---

## 7. Motion (moderado, con propósito)

Cada animación debe comunicar algo (entrada, cambio de estado, jerarquía). Nada decorativo pesado.

- **Entradas:** fade + translate 8–16px, 0.35–0.45s, `ease-out`. Stagger 40–60ms en listas.
- **Hover:** scale 1.02–1.03, cambios de color 0.2s.
- **Transición de ruta:** fade/slide sutil entre páginas.
- **Loaders:** skeleton shimmer (no spinners genéricos donde se pueda). El pulso ECG como loader de marca.
- **Curvas:** `ease-out` para entradas, `cubic-bezier(0.34,1.56,0.64,1)` para pops puntuales.
- **Respeto:** honrar `prefers-reduced-motion`.

### Fuera (recorte de peso)
Eliminar 3D y partículas pesadas: `KpiScene3D`, `CreditCard3D`, `Particles`, `Ribbons`, y componentes reactbits no usados. Aurora solo si aporta y es barata. Bundle más liviano = más fluidez.

---

## 8. Accesibilidad

- Contraste texto/fondo ≥ 4.5:1 (cuerpo), ≥ 3:1 (display grande).
- Foco visible siempre (`--brand` ring).
- No comunicar estado solo por color: severidad lleva también icono/label.
- Targets táctiles ≥ 40px.

---

## 9. Checklist "¿es Vigía?"

- [ ] ¿Hay un titular Syne grande con eyebrow?
- [ ] ¿El coral aparece poco y por señal, no por decoración?
- [ ] ¿Hay aire real entre secciones?
- [ ] ¿El layout tiene una jerarquía clara (un protagonista)?
- [ ] ¿La animación comunica algo o es relleno?
- [ ] ¿Se lee bien en dark y light?
