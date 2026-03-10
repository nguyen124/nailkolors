import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { technicianGuard } from './guards/technician.guard';

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
  { path: '**', redirectTo: '' }
];
