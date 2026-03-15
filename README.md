# Nail Kolors - Luxury Nail Salon Management System

A full-stack MEAN application for managing a nail salon, including public booking, technician dashboards, and an admin panel.

## Project Structure

```
nailkolors/
├── backend/          # Node.js + Express + MongoDB
└── frontend/         # Angular 17
```

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Angular CLI: `npm install -g @angular/cli`

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and email credentials
npm run dev
```

### 2. Seed Admin User

```
POST http://localhost:5000/api/auth/seed-admin
```
Default credentials: `admin@nailkolors.com` / `admin123`

### 3. Frontend Setup

```bash
cd frontend
npm install
ng serve
```

Open `http://localhost:4200`

## Default Login

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@nailkolors.com     | admin123   |
| Tech    | (created via admin panel)| tech123    |

## Key Routes

### Public
| Path                | Description              |
|---------------------|--------------------------|
| `/`                 | Home page                |
| `/services`         | Service menu             |
| `/gallery`          | Nail color gallery       |
| `/technicians`      | Meet the team            |
| `/book`             | Book appointment         |
| `/my-appointments`  | View/cancel bookings     |
| `/blog`             | Blog & promotions        |
| `/contact`          | Contact page             |

### Admin (login required)
| Path                    | Description              |
|-------------------------|--------------------------|
| `/admin/dashboard`      | Analytics dashboard      |
| `/admin/appointments`   | Manage all appointments  |
| `/admin/services`       | CRUD services            |
| `/admin/colors`         | Nail color inventory     |
| `/admin/technicians`    | Manage technicians       |
| `/admin/posts`          | Blog management          |

### Technician (login required)
| Path                        | Description          |
|-----------------------------|----------------------|
| `/technician/dashboard`     | Today's appointments |
| `/technician/schedule`      | Weekly calendar      |
| `/technician/availability`  | Set hours/days off   |

## API Endpoints

```
POST   /api/auth/login
GET    /api/services
POST   /api/services          (admin)
PUT    /api/services/:id      (admin)
DELETE /api/services/:id      (admin)

GET    /api/technicians
POST   /api/technicians       (admin)
PUT    /api/technicians/:id   (admin/tech)
DELETE /api/technicians/:id   (admin)

GET    /api/colors
POST   /api/colors            (admin)
PUT    /api/colors/:id        (admin)
DELETE /api/colors/:id        (admin)

POST   /api/appointments
GET    /api/appointments      (admin/tech)
PUT    /api/appointments/:id  (admin/tech)
DELETE /api/appointments/:id  (admin)
GET    /api/appointments/available-slots
GET    /api/appointments/lookup
PATCH  /api/appointments/:id/cancel

GET    /api/posts
POST   /api/posts             (admin)
PUT    /api/posts/:id         (admin)
DELETE /api/posts/:id         (admin)

GET    /api/analytics/dashboard (admin)
```

## Features

- **Public booking** — no account needed, step-by-step wizard
- **Real-time notifications** — Socket.io alerts for technicians and admin
- **Email confirmations** — sent on booking via Nodemailer
- **Role-based access** — Admin / Technician / Public
- **Responsive design** — mobile-first, Angular Material UI
- **Image uploads** — Multer for service, color, technician, post photos
- **Double-booking prevention** — time slot conflict detection
- **Analytics dashboard** — revenue, popular services, technician stats

- local mongodb connection string: MONGODB_URI=mongodb://localhost:27017/nailkolors
