import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { technicianGuard } from './guards/technician.guard';
import { customerGuard } from './guards/customer.guard';
import { salonOwnerGuard } from './guards/salon-owner.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'services', loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent) },
      { path: 'gallery', loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent) },
      { path: 'technicians', loadComponent: () => import('./pages/technicians/technicians.component').then(m => m.TechniciansComponent) },
      { path: 'book', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent) },
      { path: 'booking-confirmation', loadComponent: () => import('./pages/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent) },
      { path: 'my-appointments', loadComponent: () => import('./pages/my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent) },
      { path: 'blog', loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent) },
      { path: 'blog/:id', loadComponent: () => import('./pages/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent) },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
    ]
  },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  {
    path: 'customer',
    loadComponent: () => import('./layout/customer-layout/customer-layout.component').then(m => m.CustomerLayoutComponent),
    canActivate: [customerGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' as const },
      { path: 'dashboard', loadComponent: () => import('./pages/customer/dashboard/dashboard.component').then(m => m.CustomerDashboardComponent) },
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'services', loadComponent: () => import('./pages/admin/services/services.component').then(m => m.AdminServicesComponent) },
      { path: 'colors', loadComponent: () => import('./pages/admin/colors/colors.component').then(m => m.AdminColorsComponent) },
      { path: 'technicians', loadComponent: () => import('./pages/admin/technicians/technicians.component').then(m => m.AdminTechniciansComponent) },
      { path: 'appointments', loadComponent: () => import('./pages/admin/appointments/appointments.component').then(m => m.AdminAppointmentsComponent) },
      { path: 'posts', loadComponent: () => import('./pages/admin/posts/posts.component').then(m => m.AdminPostsComponent) },
      { path: 'salon-owners', loadComponent: () => import('./pages/admin/salon-owners/salon-owners.component').then(m => m.AdminSalonOwnersComponent) },
    ]
  },
  {
    path: 'technician',
    loadComponent: () => import('./layout/technician-layout/technician-layout.component').then(m => m.TechnicianLayoutComponent),
    canActivate: [authGuard, technicianGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/technician/dashboard/dashboard.component').then(m => m.TechnicianDashboardComponent) },
      { path: 'schedule', loadComponent: () => import('./pages/technician/schedule/schedule.component').then(m => m.TechnicianScheduleComponent) },
      { path: 'availability', loadComponent: () => import('./pages/technician/availability/availability.component').then(m => m.TechnicianAvailabilityComponent) },
    ]
  },
  { path: 'salon-owner', redirectTo: '/', pathMatch: 'full' },
  {
    path: 'salon-owner/:slug',
    loadComponent: () => import('./layout/salon-owner-layout/salon-owner-layout.component').then(m => m.SalonOwnerLayoutComponent),
    canActivate: [authGuard, salonOwnerGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/salon-owner/dashboard/dashboard.component').then(m => m.SalonOwnerDashboardComponent) },
      { path: 'services', loadComponent: () => import('./pages/salon-owner/services/services.component').then(m => m.SalonOwnerServicesComponent) },
      { path: 'colors', loadComponent: () => import('./pages/salon-owner/colors/colors.component').then(m => m.SalonOwnerColorsComponent) },
      { path: 'technicians', loadComponent: () => import('./pages/salon-owner/technicians/technicians.component').then(m => m.SalonOwnerTechniciansComponent) },
      { path: 'appointments', loadComponent: () => import('./pages/salon-owner/appointments/appointments.component').then(m => m.SalonOwnerAppointmentsComponent) },
      { path: 'posts', loadComponent: () => import('./pages/salon-owner/posts/posts.component').then(m => m.SalonOwnerPostsComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
