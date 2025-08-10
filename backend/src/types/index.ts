// Database Types
export type UserRole = 'customer' | 'agent' | 'admin' | 'super_admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet';
export type BusType = 'ac' | 'non_ac' | 'sleeper' | 'semi_sleeper' | 'luxury';
export type SeatType = 'window' | 'aisle' | 'middle';
export type Gender = 'male' | 'female' | 'other';

// User Profile Interface
export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  date_of_birth?: Date;
  gender?: Gender;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  avatar_url?: string;
  address?: Address;
  emergency_contact?: EmergencyContact;
  preferences?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Address Interface
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  landmark?: string;
}

// Emergency Contact Interface
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Agent Interface
export interface Agent {
  id: string;
  user_id: string;
  agent_code: string;
  license_number?: string;
  business_name?: string;
  business_address?: Address;
  commission_rate: number;
  is_verified: boolean;
  is_active: boolean;
  documents?: Document[];
  bank_details?: BankDetails;
  total_bookings: number;
  total_revenue: number;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

// Document Interface
export interface Document {
  type: string;
  url: string;
  verified: boolean;
  uploaded_at: Date;
}

// Bank Details Interface
export interface BankDetails {
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  branch_name?: string;
}

// Route Interface
export interface Route {
  id: string;
  route_code: string;
  name: string;
  source_city: string;
  destination_city: string;
  distance_km: number;
  estimated_duration: string;
  is_active: boolean;
  route_map?: any; // GeoJSON
  created_at: Date;
  updated_at: Date;
}

// Route Stop Interface
export interface RouteStop {
  id: string;
  route_id: string;
  stop_name: string;
  stop_code?: string;
  city: string;
  state: string;
  location?: { x: number; y: number };
  stop_order: number;
  arrival_time?: string;
  departure_time?: string;
  stop_duration: string;
  is_pickup: boolean;
  is_drop: boolean;
  landmark?: string;
  contact_phone?: string;
  facilities?: string[];
  created_at: Date;
  updated_at: Date;
}

// Bus Interface
export interface Bus {
  id: string;
  bus_number: string;
  bus_name?: string;
  bus_type: BusType;
  operator_name: string;
  total_seats: number;
  available_seats: number;
  seat_layout: SeatLayout;
  amenities?: string[];
  registration_number?: string;
  engine_number?: string;
  chassis_number?: string;
  manufacturing_year?: number;
  permit_details?: any;
  insurance_details?: any;
  fitness_certificate?: any;
  driver_details?: DriverDetails;
  conductor_details?: ConductorDetails;
  is_active: boolean;
  maintenance_status: string;
  last_service_date?: Date;
  next_service_date?: Date;
  fuel_type: string;
  mileage?: number;
  images?: string[];
  created_at: Date;
  updated_at: Date;
}

// Seat Layout Interface
export interface SeatLayout {
  rows: number;
  columns: number;
  seats: Seat[];
  layout_type: 'standard' | 'sleeper' | 'semi_sleeper';
}

// Seat Interface
export interface Seat {
  number: number;
  row: number;
  column: number;
  type: SeatType;
  is_available: boolean;
  is_blocked: boolean;
  price_modifier?: number; // Additional price for premium seats
}

// Create Booking DTO Interface
export interface CreateBookingDto {
  route_id: string;
  journey_date: string;
  seat_numbers: string[];
  passenger_details: BookingPassengerRequest[];
  source_stop: string;
  destination_stop: string;
  total_amount: number;
  contact_details: {
    email: string;
    phone: string;
  };
  special_requests?: string;
}

// Driver Details Interface
export interface DriverDetails {
  name: string;
  phone: string;
  license_number: string;
  license_expiry: Date;
  experience_years?: number;
}

// Conductor Details Interface
export interface ConductorDetails {
  name: string;
  phone: string;
  id_number: string;
}

// Bus Schedule Interface
export interface BusSchedule {
  id: string;
  route_id: string;
  bus_id: string;
  schedule_code: string;
  departure_time: string;
  arrival_time: string;
  departure_date: Date;
  arrival_date: Date;
  base_price: number;
  dynamic_pricing?: DynamicPricing;
  available_seats: number;
  booked_seats: number[];
  blocked_seats: number[];
  days_of_operation: number[];
  is_active: boolean;
  special_notes?: string;
  cancellation_policy?: CancellationPolicy;
  created_at: Date;
  updated_at: Date;
}

// Dynamic Pricing Interface
export interface DynamicPricing {
  surge_multiplier?: number;
  off_peak_discount?: number;
  early_bird_discount?: number;
  last_minute_surcharge?: number;
}

// Cancellation Policy Interface
export interface CancellationPolicy {
  free_cancellation_hours: number;
  cancellation_charges: CancellationCharge[];
}

// Cancellation Charge Interface
export interface CancellationCharge {
  hours_before_departure: number;
  charge_percentage: number;
}

// Booking Interface
export interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  schedule_id: string;
  agent_id?: string;
  journey_date: Date;
  boarding_point?: string;
  dropping_point?: string;
  total_passengers: number;
  seat_numbers: number[];
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  net_amount: number;
  status: BookingStatus;
  booking_source: string;
  contact_phone: string;
  contact_email?: string;
  emergency_contact?: EmergencyContact;
  special_requests?: string;
  cancellation_reason?: string;
  cancellation_date?: Date;
  created_at: Date;
  updated_at: Date;
}

// Booking Passenger Interface
export interface BookingPassenger {
  id: string;
  booking_id: string;
  seat_number: number;
  passenger_name: string;
  passenger_age?: number;
  passenger_gender?: Gender;
  id_proof_type?: string;
  id_proof_number?: string;
  is_primary: boolean;
  created_at: Date;
}

// Payment Interface
export interface Payment {
  id: string;
  booking_id: string;
  payment_reference: string;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway_transaction_id?: string;
  gateway_response?: any;
  gateway_fee: number;
  refund_amount: number;
  refund_reference?: string;
  refund_date?: Date;
  refund_reason?: string;
  processed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: ApiError[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Search Interfaces
export interface BusSearchQuery {
  source: string;
  destination: string;
  journey_date: Date;
  passengers?: number;
  bus_type?: BusType;
}

export interface BusSearchResult {
  schedule: BusSchedule;
  route: Route;
  bus: Bus;
  available_seats: number;
  price: number;
  boarding_points: RouteStop[];
  dropping_points: RouteStop[];
}

// Booking Request Interface
export interface BookingRequest {
  schedule_id: string;
  seat_numbers: number[];
  passengers: BookingPassengerRequest[];
  boarding_point: string;
  dropping_point: string;
  contact_phone: string;
  contact_email?: string;
  special_requests?: string;
}

export interface BookingPassengerRequest {
  seat_number: number;
  passenger_name: string;
  passenger_age?: number;
  passenger_gender?: Gender;
  id_proof_type?: string;
  id_proof_number?: string;
  is_primary?: boolean;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

// Pagination Interface
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Filter Interfaces
export interface BookingFilters {
  status?: BookingStatus;
  journey_date?: Date;
  from_date?: Date;
  to_date?: Date;
  agent_id?: string;
}

export interface RouteFilters {
  source_city?: string;
  destination_city?: string;
  is_active?: boolean;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

// Audit Log Interface
export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: any;
  new_values?: any;
  changed_by?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}
