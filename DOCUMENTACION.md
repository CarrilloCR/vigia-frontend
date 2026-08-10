# Vigía — Documentación del proyecto

Sistema de alertas inteligentes para clínicas médicas. Este documento explica Vigía en dos niveles: **para cualquier persona** (qué es, para qué sirve, cómo se usa) y **técnicamente** (cómo está construido, cómo funciona por dentro).

---

## 1. Qué es Vigía (explicación simple)

Vigía es una plataforma web que **vigila la salud operativa de una clínica** y avisa cuando algo va mal, antes de que se convierta en un problema serio.

Una clínica genera muchos números cada día: ingresos, citas completadas, cancelaciones, ausencias de pacientes (no-shows), retención, satisfacción (NPS). Revisar todo eso a mano es lento y fácil de pasar por alto. Vigía lo hace automáticamente:

1. **Recibe los datos** del sistema de la clínica (su HIS/ERP hospitalario, o un archivo CSV).
2. **Detecta anomalías** — un indicador que cae, sube o se comporta raro comparado con su historia.
3. **Explica y recomienda** — para las alertas graves, una IA (Claude) redacta qué pasó y qué hacer.
4. **Notifica** — la alerta aparece en el panel y, según el plan, llega por correo.

El resultado: la clínica ve en un vistazo su estado, recibe avisos priorizados por gravedad y puede actuar a tiempo.

### Para quién es
Clínicas y consultorios médicos. Dentro de cada clínica hay **roles** (administrador, gerente, personal médico, usuario) con vistas y permisos distintos. Un **super admin** administra la plataforma y da de alta a las clínicas.

---

## 2. Cómo se usa (recorrido del usuario)

1. **Registro** → el usuario crea cuenta y pide unirse a una clínica (o el super admin crea la clínica). Queda **pendiente** hasta que un admin lo aprueba con un rol.
2. **Primera entrada** → acepta los **Términos de Servicio**, ve el aviso de **planes**, y arranca un **recorrido guiado** que resalta cada sección de la app.
3. **Dashboard** → estado de la clínica: tarjetas de KPIs, alertas activas por gravedad, acceso al HIS y a los médicos. El admin puede pulsar **Ejecutar análisis** para correr la detección al instante.
4. **KPIs** → análisis profundo de cada indicador, con gráficos y las anomalías detectadas resaltadas. Con plan de pago: predicción de saturación, análisis de tendencias, resumen ejecutivo y riesgo de no-show (todo con IA).
5. **Médicos / Pacientes / Citas** → datos conectados: cada médico con sus pacientes, citas y alertas; cada paciente con su historial; la agenda con estados. El personal médico ve **Mi Consultorio** (su propio perfil).
6. **HIS** → espejo en vivo del sistema hospitalario conectado (solo lectura).
7. **Reportes** → exportar a CSV (alertas, o datos del HIS con los scores de detección de la IA).
8. **Copiloto** → un chatbot flotante que responde preguntas en lenguaje natural sobre los datos ("¿qué médico tiene más no-shows?").
9. **Configuración** → perfil, seguridad, apariencia (tema, **idioma ES/EN**, tamaño de fuente), datos de la clínica, integraciones, **facturación** y documentación.

### Planes
- **Gratis** — punto de partida de toda clínica: 5 usuarios, 1 sede, carga solo por CSV. Sin IA, sin integraciones, sin correo.
- **Básico / Profesional** — compra (simulada): desbloquean IA, integración con el HIS y notificaciones por correo; suben los límites.
- **Enterprise** — no se compra: se acuerda con el super admin (solicitud dentro de la app + correo).

---

## 3. Arquitectura técnica

Vigía son **tres servicios** que se comunican por HTTP, más la infraestructura de soporte:

```
                    ┌──────────────────────────┐
                    │  Frontend (Next.js 16)    │  navegador
                    │  Dashboard React + i18n   │
                    └─────────────┬────────────┘
                                  │ REST + JWT
                                  ▼
   ┌───────────────────────────────────────────────────────┐
   │  Backend (Django + DRF)                                │
   │  ├─ API multi-tenant (scoping por rol/sede/clínica)    │
   │  ├─ Motor de detección (estadística + Prophet + PyOD)  │
   │  ├─ Integración Claude (alertas, copiloto, IA, i18n)   │
   │  └─ Pagos (Tilopay / Stripe, modo prueba)              │
   └───┬───────────────┬───────────────┬───────────────────┘
       │               │               │
       ▼               ▼               ▼
  ┌─────────┐   ┌─────────────┐  ┌──────────────────┐
  │ Postgres│   │ Redis +      │  │ HIS/ERP externo  │
  │ (datos) │   │ Celery (async│  │ (Django, X-API-  │
  │         │   │ + Beat sync) │  │  Key) → sync pull│
  └─────────┘   └─────────────┘  └──────────────────┘
```

Repos:
- **`CarrilloCR/vigia-frontend`** — este repo (Next.js).
- **`CarrilloCR/vigia`** — backend Django.
- **`CarrilloCR/his-rep`** — HIS/ERP de demostración (simula el sistema de un hospital real).
- **`CarrilloCR/deploy-vigia`** — Docker Compose + Caddy para levantar todo el stack.

### Stack por servicio

| Servicio  | Tecnología |
|-----------|------------|
| Frontend  | Next.js 16 (App Router, standalone), React 19, TypeScript, Tailwind v4, Zustand, Axios, Framer Motion, Recharts |
| Backend   | Django 6, DRF, SimpleJWT, Celery + Beat, Prophet, PyOD, Anthropic SDK |
| Datos     | PostgreSQL (prod), SQLite (dev), Redis (broker Celery) |
| HIS       | Django independiente, API con `X-API-Key` |
| Deploy    | Docker Compose, gunicorn, Caddy (TLS automático vía sslip.io) |

---

## 4. Cómo funciona por dentro

### 4.1 Multi-tenant y roles
Cada modelo cuelga de una `Clinica`. `RoleBasedAccess` (`core/permissions.py`) filtra cada queryset por la clínica y sede del usuario y por su rol. El frontend replica el gating para la UX, pero **la autoridad es el backend**. El super admin es intocable (no se puede editar ni eliminar desde ningún rol).

Flujo de alta: super admin crea la clínica (se autocrea 1 sede) → el primer miembro entra como **admin pendiente** → el super admin lo aprueba → el admin aprueba al resto asignándoles rol y sede.

### 4.2 Datos: HIS vs CSV
En producción los datos vienen del **HIS/ERP** de la clínica. El comando `sync_his` (disparado por Celery Beat) hace *pull* de médicos, pacientes, citas y KPIs vía la API del HIS (autenticada con `X-API-Key`) y los consolida en la sede principal. Un asistente de integración usa **Claude para mapear** automáticamente las columnas del sistema externo a los campos de Vigía. En plan Gratis, en cambio, la clínica sube los datos por **CSV**.

### 4.3 Motor de detección de anomalías
`core/motor.py` combina tres métodos por cada KPI y sede:
- **Estadístico** — desviación respecto a la media/percentiles (base robusta con p75 para saturación).
- **Prophet** — modelo de series temporales (tendencia + estacionalidad) que predice el rango esperado.
- **PyOD (Isolation Forest)** — detección de outliers multivariante.

Cuando un punto cae fuera de lo esperado, se crea una **Alerta** con severidad (`baja`/`media`/`alta`/`critica`). Hay **deduplicación**: una sola alerta activa por combinación clínica + sede + tipo de KPI + médico. El motor se corre **manualmente** (botón "Ejecutar análisis") para controlar el uso de la API de Claude.

### 4.4 IA con Claude
Claude (`claude-sonnet-5`) se usa en varios puntos, todos gated por plan:
- **Recomendación de alertas** alta/crítica: redacta qué pasó y qué hacer.
- **Análisis de tendencias**: lee el histórico y sugiere mejoras/riesgos/acciones.
- **Predicción de saturación**: proyecta demanda de citas vs. capacidad por sede.
- **Riesgo de no-show**: puntúa las próximas citas por probabilidad de ausencia.
- **Resumen ejecutivo**: texto breve del estado del día (con envío por correo).
- **Copiloto**: chat en lenguaje natural sobre los datos reales de la clínica.
- **Traducción de la UI** (`/ia/traducir/`): traduce al inglés lo que no está en el diccionario estático, y el frontend lo cachea.

### 4.5 Notificaciones
Cada alerta genera una notificación en la app. Si el plan incluye correo, sale por **SMTP** (Resend/Brevo/cualquiera vía env). El envío es agrupado y configurable por severidad y destinatarios.

### 4.6 Internacionalización (ES ↔ EN)
Dos capas: (1) un **diccionario estático** ES→EN (`lib/i18n.ts`) que traduce al instante lo común; (2) un **traductor global del DOM** (`AutoTranslate`) que, para lo que falte, llama a Claude una sola vez y cachea el resultado en `localStorage`. La Documentación y el recorrido guiado tienen versión inglesa nativa (sin IA). Los datos dinámicos (nombres, números) nunca se traducen.

### 4.7 Recorrido guiado
`GuidedTour` es un tour tipo *spotlight*: oscurece la página, ilumina el elemento real (marcado con `data-tour`), muestra una flecha y un cuadro explicativo, y navega de una página a otra. Se salta lo que el rol/plan del usuario no permite. Aparece la primera vez tras aceptar términos y se relanza desde Config → Documentación.

### 4.8 Pagos (modo prueba, sin cobro real)
El checkout intenta en orden: **Tilopay** (pasarela de Costa Rica) → **Stripe** (test) → **simulación local**. El backend crea la sesión de pago hosted, el usuario paga con una tarjeta de prueba en la página real de la pasarela, y al volver se **verifica el pago** y se activa el plan. Con Stripe se consulta el `Checkout Session` (`payment_status == paid`); con Tilopay se valida un token firmado + `code == 1`. Ningún flujo cobra dinero real.

---

## 5. Seguridad

- **JWT** con refresh automático; el frontend nunca decide permisos por su cuenta.
- **Scoping multi-tenant** forzado en cada queryset del backend.
- **Super admin protegido** contra edición/eliminación por cualquier rol.
- **Secretos** (claves de Claude, SMTP, pagos) viven solo en `.env` (gitignored), nunca en el repo.
- Pagos en **modo prueba**: sin credenciales reales de cobro.

---

## 6. Cómo correrlo (desarrollo)

**Backend** (`CarrilloCR/vigia`):
```bash
python -m venv env && source env/bin/activate
pip install -r requirements.txt
cp .env.example .env         # completar claves
python manage.py migrate
python manage.py bootstrap_demo   # superadmin + clínica demo con datos
./start.sh                        # worker + beat + runserver (:8000)
```

**Frontend** (este repo):
```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev                       # :3000
```

**Todo el stack** (Docker): ver `CarrilloCR/deploy-vigia` (Postgres + Redis + backend + worker + beat + HIS + frontend + Caddy).

---

## 7. Resumen

Vigía convierte los datos operativos de una clínica en **alertas accionables**: detecta anomalías con tres métodos combinados, las explica con IA, las prioriza por gravedad y las notifica. Alrededor de ese núcleo hay un SaaS completo — multi-tenant con roles, planes con gating, integración con sistemas hospitalarios reales, copiloto conversacional, reportes, bilingüe y con pagos por pasarela (en modo prueba). Construido con Next.js + Django + Celery + Claude, y desplegable con Docker.
