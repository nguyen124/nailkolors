export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'technician' | 'customer';
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
  category: 'Manicure' | 'Pedicure' | 'Acrylic' | 'Builder Gel' | 'Sns Dipping' | 'Color Change' | 'Removal' | 'Waxing';
  description: string;
  image: string;
  isActive: boolean;
}

export interface NailColor {
  _id: string;
  colorName: string;
  brand: string;
  colorCode: string;
  finishType: 'Shiny' | 'Matte' | 'Glitter' | 'Cat Eyes' | 'Holographic';
  image: string;
  dotImage: string;
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
