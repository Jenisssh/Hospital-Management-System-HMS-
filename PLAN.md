# HMS v2 — Master Build Plan

## Architecture

8 backend services + 1 frontend, talking to MySQL + Redis.

| Service | Port | Owns | Calls |
|---|---|---|---|
| config-server | 8888 | (file-based) | — |
| service-registry (Eureka) | 8761 | — | — |
| api-gateway | 8080 | — | all (Eureka-resolved) |
| auth-service | 8084 | `users` | patient, doctor (Feign) |
| patient-service | 8082 | `patient` | — |
| doctor-service | 8081 | `doctor`, `department` | — |
| appointment-service | 8083 | `appointment` | patient, doctor (Feign) |
| payment-service | 8085 | `payment` | appointment (Feign) |
| hms-frontend | 5173 | — | api-gateway |

## Stack lock

- Java **23**
- Spring Boot **3.4.5**
- Spring Cloud **2024.0.0**
- MySQL **8.0**, single DB `hms_db`
- Redis **7.x**
- React **18**, Vite **5**, Tailwind **3.4**
- OpenFeign for inter-service calls
- jjwt 0.11.5 for JWT, HS256, secret = UTF-8 bytes (NO base64)

## Phases (in order, each demoable)

| # | Phase | Goal |
|---|---|---|
| 0 | Prereqs | MySQL/Redis/JDK ready, hms_db created, JWT_SECRET env var set |
| 1 | Skeleton | All 8 services scaffolded, compile, start cleanly |
| 2 | Config server + Eureka | Native file config; Eureka dashboard shows registered services |
| 3 | Auth service | register/login/me; JWT issued and validated |
| 4 | API gateway | Routes + JWT filter + CORS + role-based forwarding |
| 5 | Patient + Doctor services | CRUD + departments, admin only via gateway |
| 6 | Linked registration | `/auth/register/patient` creates User + Patient via Feign |
| 7 | Appointment service | Book + confirm/cancel/complete/reschedule, Feign verification |
| 8 | Payment service | Process + refund, linked to appointment |
| 9 | Redis caching | @Cacheable on read-heavy methods, lazy connect, namespaced keys |
| 10 | Frontend | Tailwind Aurora theme, sidebar layout, light+dark, search, charts, calendar, command palette |
| 11 | Seed + docs + scripts | DataSeeder for 12 patients / 14 doctors / seeded users, start-all.cmd, polished README |

## Locked rules (lessons from v1)

- JWT secret = **UTF-8 bytes**, ≥32 chars, env var `JWT_SECRET` (NO base64 decode)
- **No JAX-RS imports** (`jakarta.ws.rs.*`) — use Spring-native exceptions only
- User↔Patient/Doctor link is created in **one transaction** during registration (via Feign)
- All POMs use the **same** Spring Boot version
- CORS configured in api-gateway from day 1, allowing `http://localhost:5173`
- Redis caching with **lazy connect** — services start even if Redis is down
- Native file-based config-server (no git, no PAT leaks)
- Frontend: Tailwind utility classes everywhere, Aurora palette (indigo + violet + cyan)

## Design system summary

- **Aurora** palette: indigo `#4F46E5` + violet `#8B5CF6` + cyan `#06B6D4`
- **Sidebar** layout (240px) + topbar
- **Light + Dark** mode, persisted, system-detect default
- **Inter** for UI, **JetBrains Mono** for IDs
- **lucide-react** icons, **react-hot-toast** notifications, **recharts**, **react-big-calendar**, **cmdk** command palette

## Default seed credentials

| Role | Username | Password |
|---|---|---|
| ADMIN | `admin` | `admin123` |
| DOCTOR | `dr.smith` | `doctor123` |
| PATIENT | `patient.john` | `patient123` |
