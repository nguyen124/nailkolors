You are a senior full-stack engineer. Build a production-ready Nail Salon website and management system using the MEAN stack.

Tech stack:

Frontend

* Angular (latest version)
* Angular Material
* RxJS
* Responsive mobile design

Backend

* Node.js
* Express.js REST API

Database

* MongoDB
* Mongoose ODM

Authentication

* JWT authentication
* Role-based access control
* User self-registration (customer role only)
* Admin account is pre-seeded via /api/auth/seed-admin — no self-registration as admin
* Technician accounts are created by admin only (admin panel → Technician Management)
* Default admin credentials: email=admin@nailkolors.com / password=admin1234

Real-time features

* Socket.io for notifications

---

SYSTEM ROLES

The application must support 3 roles:

1. Admin (Salon Owner) — pre-seeded only, cannot self-register
2. Technician — can register with license number and license expiry date
3. Customer — can register with name, email, phone, password

Role-based routing after login:
* admin → /admin
* technician → /technician
* customer → /customer

---

PUBLIC WEBSITE (CUSTOMER SIDE)

Pages required:

* Home
* Services / Menu
* Nail Color Gallery
* Technicians
* Book Appointment
* Blog / Promotions
* Contact

---

SERVICE MENU

Customers must be able to view:

* Service name
* Price
* Duration
* Description
* Category (Manicure, Pedicure, Acrylic, Builder Gel, Sns Dipping, Color Change, Removal, Waxing.)

---

NAIL COLOR INVENTORY (PUBLIC VIEW)

Customers can browse nail polish colors available at the salon.

Each color should include:

* color name
* brand
* color code
* photo
* finish type ('Shiny' | 'Matte' | 'Glitter' | 'Cat Eyes' | 'Holographic'.)
* stock status

---

CUSTOMER APPOINTMENT BOOKING

Customers should be able to book appointments online without creating an account.

Booking workflow:

Select the service that they want
After select the service that they want, the customer can see the list of technicians that can do that service and their availability. The customer then can choose date, choose available time slot. Then the customer enter information:
   * name
   * phone
   * email
   * the detailed description that they want to do
Then the customer confirm appointment

Rules:

* Prevent double booking
* Only show available time slots
* Respect technician working hours
* Consider service duration

After booking:

* Save appointment in database
* Send confirmation email to customer
* Send notification to technician
* Show confirmation page

Customers should also be able to:

* View appointment by phone/email
* Cancel appointment

---

TECHNICIAN DASHBOARD

Technicians must log in.

Registration: When registering as a technician, the user must provide:
* name
* email
* phone
* password
* license number
* license expiry date

A Technician profile is auto-created on registration (linked to the User account via userId).

Features:

Dashboard

* View today's appointments
* View weekly schedule
* Calendar interface

Appointment management

* Accept appointment
* Mark appointment completed
* Cancel appointment

Availability

* Set working hours
* Block days off
* Manage schedule

Notifications

* Real-time notification when a customer books them
* Popup notification inside dashboard

---

ADMIN DASHBOARD (SALON OWNER)

Admin must have a full management panel. The default login credential of admin is admin@nailkolors.com / admin1234 (seeded via POST /api/auth/seed-admin)

---

SERVICE MENU MANAGEMENT

Admin can:

* Add service
* Edit service
* Delete service

Fields:

* name
* price
* duration
* category (Manicure | Pedicure | Builder Gel | Acrylic | Sns Dipping | Color Change | Removal | Waxing)
* description
* image

---

NAIL COLOR INVENTORY MANAGEMENT

Admin can manage nail polish inventory.

Features:

* Add color
* Edit color
* Delete color
* Update stock quantity

Fields:

* colorName
* brand
* colorCode
* finishType
* image
* quantity
* status (available / out of stock)

---

TECHNICIAN MANAGEMENT

Admin can:

* Add technician
* Edit technician
* Remove technician

Fields:

* name
* email / photo / bio
* specialties — checkboxes using the same fixed category list as services:
  (manicure, pedicure, gel, acrylic, nail-art, eyebrow waxing)
* working hours

Specialty ↔ Service mapping rule:
  technician.specialties includes service.category
  → that technician appears in the booking flow when customer picks that service
  Backend: GET /api/technicians?specialty=gel returns only gel-specialist technicians

---

BLOG / POST MANAGEMENT

Admin can manage promotional posts.

Fields:

* title
* content
* image
* publishDate

---

APPOINTMENT MANAGEMENT

Admin can:

* View all appointments
* Filter by technician
* Filter by date
* Reschedule appointment
* Cancel appointment

---

ANALYTICS DASHBOARD

Admin dashboard should display:

* Total appointments today
* Weekly appointments
* Estimated daily revenue
* Most popular services
* Technician performance
* Most used nail colors

---

DATABASE DESIGN (MongoDB)

Create collections:

Users

* _id
* name
* email
* phone (optional)
* password (hashed with bcrypt)
* role (admin | technician | customer, default: customer)

Technicians

* _id
* userId (ref: Users)
* name
* bio
* specialties
* workingHours
* licenseNumber
* licenseExpiry

Services

* _id
* name
* price
* duration
* category
* description
* image

NailColors

* _id
* colorName
* brand
* colorCode
* finishType
* image
* quantity
* status

Appointments

* _id
* serviceId
* technicianId
* nailColorId
* customerName
* customerPhone
* customerEmail
* date
* time
* status

Posts

* _id
* title
* content
* image
* createdAt

---

API ROUTES (Express)

Auth

POST /api/auth/login
POST /api/auth/register       — register as customer or technician (admin blocked)
POST /api/auth/seed-admin     — one-time admin seed (creates admin@nailkolors.com)

Services

GET /api/services
POST /api/services
PUT /api/services/:id
DELETE /api/services/:id

Technicians

GET /api/technicians
POST /api/technicians
PUT /api/technicians/:id
DELETE /api/technicians/:id

Nail Colors

GET /api/colors
POST /api/colors
PUT /api/colors/:id
DELETE /api/colors/:id

Appointments

POST /api/appointments
GET /api/appointments
PUT /api/appointments/:id
DELETE /api/appointments/:id

Posts

GET /api/posts
POST /api/posts
PUT /api/posts/:id
DELETE /api/posts/:id

---

REAL-TIME NOTIFICATIONS

Use Socket.io.

When a booking is created:

* The technician receives an instant notification
* The admin dashboard updates in real time
* Email notification is sent to technician and customer

---

ANGULAR STRUCTURE

Standalone components with lazy-loaded routes (no NgModules).

Layouts:
* public-layout — sticky header with auth-aware nav (Sign In / Register for guests; Dashboard + account menu with Sign Out for logged-in users)
* admin-layout — sidebar with nav and Logout button
* technician-layout — sidebar with nav and Logout button
* customer-layout — top header with account menu and Sign Out

Route groups:
* / (public-layout) — Home, Services, Gallery, Technicians, Blog, Contact, Book, My Appointments
* /login — login page
* /register — registration page (customer or technician)
* /admin (admin-layout, adminGuard)
* /technician (technician-layout, technicianGuard)
* /customer (customer-layout, customerGuard)

Services:
* AuthService — login, register, logout, currentUser signal, isLoggedIn, token getter
* AppointmentService, ServiceService, TechnicianService, ColorService, PostService, AnalyticsService, SocketService

Guards:
* authGuard, adminGuard, technicianGuard, customerGuard

Include:

* Angular Material UI components
* Calendar booking interface
* RxJS for reactive data streams
* Signals for auth state

---

UI DESIGN

Design style should look like a modern luxury nail salon:

* soft pastel colors
* elegant typography
* clean layout
* mobile responsive

---

IMPLEMENTED FEATURES (as of 2026-03-10)

Backend:
* Express + Socket.io server
* JWT auth middleware (auth, adminOnly, technicianOrAdmin)
* All CRUD routes for services, technicians, colors, appointments, posts
* Analytics route
* Multer image upload for services, colors, technicians, posts
* Nodemailer confirmation emails on booking
* Double-booking prevention (time slot overlap detection)
* Admin seed route

Frontend:
* Angular 17 standalone components, lazy-loaded routes
* Angular Material pink/rose luxury theme
* Public pages: Home, Services, Gallery, Technicians, Blog, Contact, Book, My Appointments
* Login page with role-based redirect
* Register page (customer or technician; admin blocked)
* Customer layout + dashboard (upcoming/completed appointments, cancel)
* Admin layout + dashboard (analytics, appointments, services, colors, technicians, posts)
* Technician layout + dashboard (schedule, availability, notifications)
* Logout available in all layouts (header menu / sidebar footer)
* Socket.io real-time notifications (admin + technician)

OUTPUT FORMAT

Provide:

1. Full project folder structure
2. MongoDB schema (Mongoose models)
3. Backend Express routes
4. Angular components
5. Angular services
6. Booking system logic
7. Real-time notification setup
8. Deployment instructions
