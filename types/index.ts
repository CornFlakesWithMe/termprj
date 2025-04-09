export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  securityQuestions: SecurityQuestion[];
  isCarOwner: boolean;
  balance: number;
  createdAt: string;
}

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export interface Car {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  type: string;
  seats: number;
  color: string;
  licensePlate: string;
  mileage: number;
  images: string[];
  pricePerDay: number;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  features: string[];
  description: string;
  availabilityCalendar: DateRange[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  bookings: Booking[];
  createdAt: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Booking {
  id: string;
  carId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "upcoming" | "active" | "completed" | "cancelled";
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  bookingId?: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  targetId: string;
  targetType: "user" | "car";
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SearchFilters {
  location?: string;
  startDate?: string;
  endDate?: string;
  priceMin?: number;
  priceMax?: number;
  carType?: string;
  seats?: number;
  features?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "booking" | "message" | "payment" | "review" | "system";
  relatedId?: string;
  read: boolean;
  createdAt: string;
}