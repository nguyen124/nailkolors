export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician';
}

export interface WorkingHours {
  day: string;
  isWorking: boolean;
  start: string;
  end: string;
}

export interface Technician {
  _id: string;
  userId: string | User;
  name: string;
  photo: string;
  bio: string;
  specialties: string[];
  workingHours: WorkingHours[];
  blockedDates: string[];
  isActive: boolean;
}

export interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  category: 'manicure' | 'pedicure' | 'gel' | 'acrylic' | 'nail-art' | 'other';
  description: string;
  image: string;
  isActive: boolean;
}

export interface NailColor {
  _id: string;
  colorName: string;
  brand: string;
  colorCode: string;
  finishType: 'glossy' | 'matte' | 'glitter' | 'shimmer' | 'cream' | 'gel';
  image: string;
  quantity: number;
  status: 'available' | 'out-of-stock';
}

export interface Appointment {
  _id: string;
  serviceId: string | Service;
  technicianId: string | Technician;
  nailColorId: string | NailColor | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  image: string;
  publishDate: string;
  isPublished: boolean;
}

export interface AnalyticsDashboard {
  todayTotal: number;
  weeklyTotal: number;
  dailyRevenue: number;
  popularServices: { _id: string; name: string; count: number }[];
  techPerformance: { _id: string; name: string; completed: number }[];
  popularColors: { _id: string; colorName: string; brand: string; colorCode: string; count: number }[];
}
