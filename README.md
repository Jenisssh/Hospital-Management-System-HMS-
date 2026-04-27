# HMS — Hospital Management System

A microservices-based hospital management application built with **Spring Cloud** + **React 18**.

7 backend services, role-based access (Admin / Doctor / Patient), JWT auth, OpenFeign for inter-service calls, Redis caching, and a polished React + Tailwind frontend with light/dark mode.

## Stack

| Layer | Tech |
|---|---|
| Backend | **Spring Boot 3.4.5**, **Spring Cloud 2024.0.0**, Java 23 |
| Persistence | **MySQL 8** (single shared DB `hms_db`), Spring Data JPA + Hibernate |
| Cache | **Redis 7** with graceful degradation |
| Service mesh | Spring Cloud Config Server, Eureka, Spring Cloud Gateway, OpenFeign |
| Auth | **JWT HS256** (jjwt 0.11.5), BCrypt, env-var-sourced secret |
| Frontend | **React 18** + **Vite 5** + **Tailwind 3.4** + Radix UI + lucide-react + recharts |

## Architecture

```
                  hms-frontend  :5173
                          │
                          ▼  http://localhost:8080
                  api-gateway   :8080
        ┌────┬────┬─────────┬────────────┬─────────┐
        │    │    │         │            │         │
       auth patient doctor  appointment  payment   (all via Eureka)
       :8084 :8082  :8081   :8083        :8085
        │    │       │       │             │
        └────┴───────┴───────┴─────────────┘
                          ▼
              MySQL (hms_db)  +  Redis (cache)

   Infra: config-server :8888  service-registry :8761
```

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **JDK** | 23 (or 17/21) | `java -version` |
| **Maven** | 3.9+ | `mvn -v` |
| **Node** | 18+ | `node --version` |
| **MySQL** | 8.0 | running on `localhost:3306`, root password `system` |
| **Redis** | 7.x | running on `localhost:6379` (WSL or Docker) |

## One-time setup

### 1. Create the database

```cmd
mysql -u root -psystem < db\init.sql
```

### 2. Set the JWT secret env var

The repo ships **`.example`** versions of the local scripts (the real ones contain a secret and are gitignored). Copy them once:

```cmd
copy setup-env.ps1.example setup-env.ps1
copy start-all.cmd.example start-all.cmd
copy stop-all.cmd.example  stop-all.cmd
```

Open `setup-env.ps1` in a text editor and replace the placeholder with a long random string (32+ chars). Then run it once:

```powershell
powershell -ExecutionPolicy Bypass -File setup-env.ps1
```

Then **close and reopen all terminals** so `JWT_SECRET` propagates.

### 3. Install frontend deps

```cmd
cd hms-frontend
npm install
```

## Running

### One command (recommended)

```cmd
start-all.cmd
```

Opens 9 cmd windows, one per service, in the right order with delays. Total readiness ~90 seconds.

Then open **http://localhost:5173** and log in:

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | ADMIN — sees everything |

To stop everything: `stop-all.cmd` (kills all processes on the project's ports).

### Manually (if you want one terminal per service)

Order matters. Wait for each "Started X" log before moving on.

```
1. config-server         (port 8888)  — must be first
2. service-registry      (port 8761)
3. auth-service          (port 8084)
4. patient-service       (port 8082)
5. doctor-service        (port 8081)
6. appointment-service   (port 8083)
7. payment-service       (port 8085)
8. api-gateway           (port 8080)  — start after domain services register
9. cd hms-frontend && npm run dev
```

## What you'll see

After login as **admin**:
- **Dashboard** — gradient hero greeting + 4 stat cards + appointments-by-date bar chart + upcoming list
- **Patients** — 12 seeded patients, search/filter, create/edit (drawer)/delete with confirmation
- **Doctors** — 14 seeded doctors across all 10 departments, with department filter
- **Appointments** — book/confirm/complete/cancel/reschedule/delete with status filter chips
- **Payments** — gradient hero showing total paid, process new + refund

Try **Cmd/Ctrl + K** anywhere — opens a command palette to jump between pages.

Toggle the **sun/moon** icon in the topbar — full light/dark theme.

### Patient flow

1. Log out, click **Create an account**
2. Pick **Patient** tab → fill name, gender, DOB, phone
3. You're auto-linked: a User row + a Patient row + a JWT with `linkedId` set
4. Dashboard shows your appointments only
5. **Appointments** → Book → pick a doctor from the dropdown → submit

### Doctor flow

Same as patient but pick the **Doctor** tab in registration. Doctors then see only the appointments assigned to them and can confirm/complete/cancel them.

## Project layout

```
hms-v2/
├── README.md                    ← you are here
├── PLAN.md                      ← phase-by-phase build plan (locked)
├── start-all.cmd.example        ← copy → start-all.cmd to launch everything
├── stop-all.cmd.example         ← copy → stop-all.cmd to kill everything
├── setup-env.ps1.example        ← copy → setup-env.ps1 and edit JWT_SECRET
├── docker-compose.yml           ← optional MySQL + Redis
├── db/init.sql                  ← creates hms_db
│
├── hms-config-repo/             ← native config served by config-server
│   ├── application.yml          ← shared (Eureka URL, logging)
│   ├── api-gateway.yml          ← routes, CORS, JWT secret
│   ├── auth-service.yml
│   ├── patient-service.yml      ← + Redis
│   ├── doctor-service.yml       ← + Redis
│   ├── appointment-service.yml
│   ├── payment-service.yml
│   └── service-registry.yml
│
├── config-server/               (Spring Cloud Config, file-based)
├── service-registry/            (Eureka)
├── api-gateway/                 (Spring Cloud Gateway, JWT filter, CORS)
├── auth-service/                (User, JWT issuance, register/login/me, Feign to patient/doctor for linked-registration)
├── patient-service/             (Patient CRUD, /me, Redis cache)
├── doctor-service/              (Doctor + Department CRUD, /me, Redis cache)
├── appointment-service/         (Booking + status transitions, Feign to verify patient/doctor)
├── payment-service/             (Process + refund, Feign to verify appointment)
└── hms-frontend/                (React 18 + Vite + Tailwind + Aurora theme)
```

## Key design choices

### API surface (through gateway :8080)

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Generic register (admin bootstrap) |
| POST | `/auth/register/patient` | public | One-step User + Patient creation |
| POST | `/auth/register/doctor` | public | One-step User + Doctor creation |
| POST | `/auth/login` | public | Returns JWT |
| GET | `/auth/me` | any auth | Decode JWT |
| GET/POST/PUT/DELETE | `/patients/*` | admin (read+write) | CRUD |
| GET | `/patients/me` | patient | Own record |
| GET | `/doctors`, `/doctors/{id}`, `/departments` | any auth | Read-only |
| POST/PUT/DELETE | `/doctors/*` | admin | Manage doctors |
| GET | `/doctors/me` | doctor | Own record |
| POST | `/appointments` | patient (own) / admin | Book |
| GET | `/appointments` | role-filtered | List visible appointments |
| PATCH | `/appointments/{id}/{confirm,cancel,complete,reschedule}` | role-aware | State transitions |
| DELETE | `/appointments/{id}` | admin (only CANCELLED/COMPLETED) | Delete |
| POST | `/payments` | patient (own) / admin | Process |
| POST | `/payments/{id}/refund` | admin | Refund a PAID payment |
| GET | `/payments` | role-filtered | List |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Could not resolve placeholder 'hms.jwt.secret'` | `JWT_SECRET` env var not set in the cmd window | Run `setup-env.ps1` and reopen all terminals |
| Config-server: `Connection refused` from clients | Started clients before config-server was ready | Wait 25s after config-server before starting others |
| Eureka shows fewer than 6 services | One didn't start cleanly | Check that service's window for stack trace |
| `403 FORBIDDEN` calling /patients/* as DOCTOR | Working as designed | Only ADMIN can manage other domains; doctor sees only own appointments |
| Frontend shows "Access denied" | You hit a route your role can't access | The page tells you what role is required |
| Cache stale data after editing | TTL is 10 min; @CacheEvict runs on writes — should be immediate | Refresh page; check Redis with `redis-cli KEYS '*'` |
| Redis is down | Caching is bypassed automatically | Watch logs for `Cache GET failed` warnings |

## Default seed data

After first startup of each service:

| Service | Seeds on first run |
|---|---|
| auth-service | 1 admin user (`admin` / `admin123`) |
| patient-service | 12 patients (John Doe, Jane Smith, …) |
| doctor-service | 10 departments + 14 doctors (Dr. Robert Smith, …) |

To re-seed: drop the relevant tables and restart the service. Each `DataSeeder` checks `count() > 0` before running.

## License

MIT — do whatever you want.
