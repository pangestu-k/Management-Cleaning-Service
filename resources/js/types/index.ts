// User types
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'customer' | 'cleaner';
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface RegisterAdminRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    admin_secret_key: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
        token_type: string;
    };
}

// Service types
export interface Service {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

// Cleaner types
export interface Cleaner {
    id: number;
    user_id: number;
    phone?: string;
    status: 'active' | 'inactive';
    user?: User;
    created_at: string;
    updated_at: string;
}

// Schedule types
export interface Schedule {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    remaining_capacity: number;
    status: 'available' | 'full' | 'unavailable';
    created_at: string;
    updated_at: string;
}

// Booking types
export type BookingStatus = 'pending' | 'approved' | 'on_progress' | 'completed' | 'canceled';

export interface Booking {
    id: number;
    booking_code: string;
    user_id: number;
    service_id: number;
    schedule_id: number;
    cleaner_id?: number;
    address: string;
    status: BookingStatus;
    total_price: number;
    user?: User;
    service?: Service;
    schedule?: Schedule;
    cleaner?: Cleaner;
    created_at: string;
    updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        data: T[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// Dashboard types
export interface DashboardStatistics {
    total_orders: number;
    pending_orders: number;
    approved_orders: number;
    on_progress_orders: number;
    completed_orders: number;
    canceled_orders: number;
    today_orders: number;
    total_revenue: number;
}

export interface DashboardResponse {
    statistics: DashboardStatistics;
    recent_bookings: Booking[];
}

// Form types
export interface ServiceFormData {
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
    status?: 'active' | 'inactive';
}

export interface CleanerFormData {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    status?: 'active' | 'inactive';
}

export interface ScheduleFormData {
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    status?: 'available' | 'full' | 'unavailable';
}

export interface BookingFormData {
    service_id: number;
    schedule_id: number;
    address: string;
}
