# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vigia is a medical clinic intelligent alerts system ("Sistema de Alertas Inteligentes para Clínicas Médicas"). It's a Next.js 16 frontend that connects to a backend API for monitoring KPIs, managing alerts, doctors, notifications, and configuration for medical clinics. The UI is in Spanish.

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint (next core-web-vitals + typescript rules)

No test framework is configured.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand for state, Axios for API calls, Framer Motion for animations.

**Path alias:** `@/*` maps to project root (configured in tsconfig.json).

**Source structure (`src/`):**
- `app/` — Next.js App Router pages. Root page (`page.tsx`) is the login/register auth page. Dashboard pages live under `app/dashboard/`.
- `components/ui/` — Reusable UI primitives (Button, Card, Input, SeverityBadge, PageLoader, ThemeToggle, Particles).
- `components/reactbits/` — Animated/visual components (Aurora, GlowingCard, AnimatedInput, BlurText, CountUp, FadeContent, TiltedCard, AnimatedList, ShinyText).
- `lib/axios.ts` — Configured Axios instance with JWT auth interceptors (auto-attaches Bearer token, handles 401 refresh via `/auth/refresh/`).
- `store/` — Zustand stores with `persist` middleware. `auth.ts` (user/tokens, persisted as `vigia-auth`) and `theme.ts` (dark/light toggle, persisted as `vigia-theme`).
- `types/index.ts` — All shared TypeScript interfaces for domain models (Clinica, Sede, Medico, Paciente, Cita, Alerta, Notificacion, RegistroKPI, etc.).

**API:** Backend URL configured via `NEXT_PUBLIC_API_URL` env var. Auth endpoints: `/auth/login/`, `/auth/register/`, `/auth/refresh/`.

**Theming:** CSS custom properties define dark/light themes via `data-theme` attribute on `<html>`. Dark is default. Fonts: Inter (body), Syne (display/headings via `.font-display` class).

**Dashboard routes:**
- `/dashboard` — main alerts dashboard with KPI stats
- `/dashboard/medicos` — doctors list
- `/dashboard/medico/[id]` — individual doctor detail
- `/dashboard/notificaciones` — notifications
- `/dashboard/kpis` — KPI charts
- `/dashboard/configuracion` — settings/email configuration
