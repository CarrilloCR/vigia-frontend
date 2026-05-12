# Vigía — Frontend

Dashboard Next.js para el sistema de alertas inteligentes Vigía. Conecta al backend Django (`/home/carrillo/vigia`) vía REST. UI en español.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Zustand** (state, persistido en `localStorage`)
- **Axios** con interceptors JWT (`/auth/refresh/` automático en 401)
- **Framer Motion** + **react-three-fiber** + **drei** (animación 3D login)
- Fuentes: **Inter** (body), **Syne** (display)

## Estructura

```
src/
├── app/
│   ├── page.tsx                    # Login/register con orbe 3D
│   ├── dashboard/
│   │   ├── layout.tsx              # Auth guard + role gating + polling /me
│   │   ├── page.tsx                # Alertas activas + ejecutar motor
│   │   ├── kpis/, medicos/, citas/, pacientes/, reportes/,
│   │   ├── notificaciones/, generador/, equipo/, correos/,
│   │   └── configuracion/          # Tabs gated por rol
├── components/
│   ├── DashboardHeader.tsx         # Nav lateral filtrada por rol
│   ├── ui/                         # Primitives: Button, Card, Input, KpiScene3D, ...
│   └── reactbits/                  # Animados: Aurora, GlowingCard, BlurText, ...
├── store/
│   ├── auth.ts                     # user + tokens, persist 'vigia-auth'
│   └── theme.ts                    # dark/light persist 'vigia-theme'
├── lib/
│   ├── axios.ts                    # Instancia con auth interceptors
│   ├── permissions.ts              # canAccess / canWrite matrix
│   └── permisos.ts                 # NAV_PERMISOS, ROL_LABELS, ROL_COLORS
├── hooks/
│   └── usePermissions.ts           # Hook + useRequireAccess route guard
└── types/index.ts                  # Interfaces dominio
```

## Roles

Coordinados con backend (`core/permissions.py`):

| Rol           | Páginas accesibles                                                     |
|---------------|------------------------------------------------------------------------|
| `superadmin`  | Todo + selector de clínica + Super Admin                               |
| `admin`       | Todo dentro de su clínica (incl. generador)                            |
| `gerente`     | + reportes, correos, equipo; CRUD dentro de su sede                    |
| `medico`      | + pacientes, citas (scope sede)                                        |
| `user`        | dashboard, KPIs, médicos, alertas, notificaciones, reportes (read-only)|
| `viewer`      | Pantalla "Cuenta pendiente de aprobación" hasta que admin lo apruebe   |

`DashboardLayout` hace polling de `/auth/me/` cada 10s mientras la cuenta esté pendiente para detectar aprobación sin re-login.

## Setup

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

## Scripts

```bash
npm run dev      # Turbopack en localhost:3000
npm run build    # Production build
npm run lint     # ESLint (next core-web-vitals + TS)
```

No hay framework de tests configurado.

## Theming

Variables CSS por `data-theme` en `<html>`. Default dark. Toggle con `ThemeToggle`. Tokens en `app/globals.css`.

## Animación login

`src/components/ui/KpiScene3D.tsx` — orbe icosaedro jade con `<Edges>` (drei) para aristas crispas, halo pulsante, point lights. Pure visual loop, sin controles.

## Notas

- Alias `@/*` mapea a la raíz del proyecto (ver `tsconfig.json`).
- Backend URL vía `NEXT_PUBLIC_API_URL`.
- Frontend nunca debe confiar en role gating sola: backend (`RoleBasedAccess`) enforza permisos. UI gating es UX.
