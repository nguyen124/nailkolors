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

Real-time features

* Socket.io for notifications

---

SYSTEM ROLES

The application must support 3 roles:

1. Admin (Salon Owner)
2. Technician
3. Customer

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
* Category (manicure, pedicure, gel, acrylic, etc.)

---

NAIL COLOR INVENTORY (PUBLIC VIEW)

Customers can browse nail polish colors available at the salon.

Each color should include:

* color name
* brand
* color code
* photo
* finish type (glossy, matte, glitter, etc.)
* stock status

---

CUSTOMER APPOINTMENT BOOKING

Customers should be able to book appointments online without creating an account.

Booking workflow:

1. Select service
2. Select nail color (optional)
3. Select technician (or auto assign)
4. Choose date
5. Choose available time slot
6. Enter customer information:

   * name
   * phone
   * email
7. Confirm appointment

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

Admin must have a full management panel.

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
* category
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
* photo
* bio
* specialties
* working hours

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
* password
* role (admin, technician)

Technicians

* _id
* userId
* bio
* specialties
* workingHours

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

Create Angular modules:

* public module
* booking module
* admin module
* technician module
* shared components module

Include:

* Angular services for API communication
* Angular guards for authentication
* Angular Material UI components
* Calendar booking interface

---

UI DESIGN

Design style should look like a modern luxury nail salon:

* soft pastel colors
* elegant typography
* clean layout
* mobile responsive

---

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
