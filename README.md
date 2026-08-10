# Vigía — Frontend

Dashboard **Next.js 16** para **Vigía**, sistema de alertas inteligentes para clínicas médicas. Consume el backend Django (`CarrilloCR/vigia`) vía REST. UI **bilingüe** (español por defecto, inglés global). Ver [`DOCUMENTACION.md`](./DOCUMENTACION.md) para la explicación completa del proyecto.

## Stack

- **Next.js 16** (App Router, standalone output) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + tokens CSS por `data-theme` (dark/light)
- **Zustand** (estado, persistido en `localStorage`)
- **Axios** con interceptores JWT (refresh automático de token en 401)
- **Framer Motion** (animaciones), **Recharts** (gráficos de KPIs)
- Fuentes: **Inter** (texto), **Syne** (display / `.font-display`)

## Estructura

```
src/
├── app/
│   ├── page.tsx                    # Login/registro + hero animado (HeroDemo3D) + botón "?" (video)
│   ├── layout.tsx                  # ThemeProvider + AutoTranslate + CursorEffect
│   └── dashboard/
│       ├── layout.tsx              # Auth guard + gating por rol + TerminosGate + GuidedTour
│       ├── page.tsx                # Dashboard: KPIs, alertas, ejecutar motor, HIS, médicos
│       ├── kpis/                   # Análisis por KPI + gráficos + funciones IA
│       ├── medicos/  medico/[id]/  # Listado + detalle de médico (Mi Consultorio si es personal médico)
│       ├── pacientes/ paciente/[id]/  # Listado + ficha de paciente (médicos, citas, stats)
│       ├── citas/                  # Agenda paciente-médico-sede, estados
│       ├── notificaciones/         # Historial de avisos
│       ├── generador/              # Espejo en vivo del HIS conectado
│       ├── reportes/               # Exportaciones CSV (alertas, datos HIS+IA)
│       └── configuracion/          # Cuenta, clínica, sistema, ayuda (gated por rol/plan)
├── components/
│   ├── DashboardHeader.tsx         # Nav superior filtrada por rol
│   ├── CopilotoOrb.tsx             # Chatbot IA flotante (orbe animado)
│   ├── GuidedTour.tsx              # Recorrido guiado spotlight (resalta elementos reales)
│   ├── AutoTranslate.tsx           # Traductor global ES→EN (dic. estático + fallback IA cacheado)
│   ├── TerminosGate.tsx            # ToS + aviso de planes al entrar por 1ª vez
│   ├── HisMirror.tsx               # Espejo read-only del HIS
│   ├── ui/                         # Primitivas: Button, Card, Input, SeverityBadge, Particles, ...
│   └── reactbits/                  # Animados: Aurora, GlowingCard, HeroDemo3D, BlurText, CountUp, ...
├── store/
│   ├── auth.ts                     # user + tokens (persist 'vigia-auth')
│   ├── theme.ts                    # tema (persist 'vigia-theme')
│   └── prefs.ts                    # idioma, animaciones, fontSize, cursor, etc.
├── lib/
│   ├── axios.ts                    # Instancia con auth interceptors
│   ├── i18n.ts                     # Diccionario ES→EN estático (EN export)
│   ├── guiaContenido.tsx           # Contenido bilingüe de la Documentación / guía
│   ├── tourSteps.ts                # Pasos del recorrido guiado (data-tour targets)
│   └── permisos.ts                 # NAV_PERMISOS, roles, capacidades
└── types/index.ts                  # Interfaces de dominio
```

## Roles (coordinados con `core/permissions.py` del backend)

| Rol           | Acceso                                                                  |
|---------------|------------------------------------------------------------------------|
| `superadmin`  | Todo + selector de clínica + panel Super Admin + Facturación           |
| `admin`       | Todo dentro de su clínica (incl. HIS, motor, facturación)              |
| `gerente`     | Reportes, equipo, correos; CRUD dentro de su sede                      |
| `medico`      | Pacientes, citas (scope sede) + **Mi Consultorio** (su propio perfil)  |
| `user`        | Dashboard, KPIs, médicos, alertas, notificaciones (lectura)            |
| `viewer`      | Pantalla "Cuenta pendiente" hasta que un admin lo apruebe              |

El layout hace polling de `/auth/me/` mientras la cuenta esté pendiente, para detectar la aprobación sin re-login. El gating de UI es UX — **el backend enforza los permisos**.

## Funciones destacadas

- **i18n global** — `AutoTranslate` traduce todo el DOM a inglés: primero por diccionario (`i18n.ts`, instantáneo), y lo que falte lo traduce Claude vía `/ia/traducir/` (cacheado en `localStorage`). La Documentación tiene versión inglesa nativa (`guiaContenido.tsx`).
- **Recorrido guiado (GuidedTour)** — tour tipo "spotlight" que resalta elementos reales de cada página (por `data-tour`), navega entre páginas y se salta lo que el rol/plan no permite. Aparece la 1ª vez tras aceptar términos; se relanza desde Config → Documentación.
- **Copiloto IA** — chatbot flotante que responde sobre los datos de la clínica (plan Pro).
- **Facturación** — checkout externo por **Tilopay** (pasarela CR) o **Stripe** (test), con fallback a simulación local. Sin cobro real (modo prueba).
- **HIS en vivo** — espejo read-only del sistema hospitalario conectado.

## Setup

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev        # Turbopack en localhost:3000
```

Scripts: `npm run dev` · `npm run build` (production, output standalone) · `npm run lint`.
No hay framework de tests configurado.

## Notas

- Alias `@/*` → raíz del proyecto (`tsconfig.json`).
- URL del backend vía `NEXT_PUBLIC_API_URL`.
- Deploy vía Docker (imagen standalone) — ver `CarrilloCR/deploy-vigia`.
