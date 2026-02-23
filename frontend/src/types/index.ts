// Types pour l'authentification
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'superuser' | 'admin' | 'doctor' | 'secretary' | 'accountant';
  phone_number?: string;
  department?: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Types pour les patients
export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  phone_number: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_history?: string;
  created_at: string;
  updated_at: string;
  full_name: string;
}

export interface PatientAccess {
  id: number;
  patient: {
    id: number;
    full_name: string;
  };
  patient_name: string;
  access_key: string;
  password: string;
  is_active: boolean;
  access_count: number;
  last_access?: string;
  created_at: string;
  is_permanent: boolean;
}

// Types pour les examens
export interface ExamType {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Types pour les factures
export interface InvoiceItem {
  id: number;
  exam_type: number;
  exam_type_details?: ExamType;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  patient: number;
  patient_details?: Patient;
  patient_name?: string;
  created_by: number;
  created_by_name?: string;
  status: 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  status_display?: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  notes?: string;
  items: InvoiceItem[];
  patient_access?: PatientAccess;
  created_at: string;
  updated_at: string;
}

// Types pour les paiements
export interface Payment {
  id: number;
  invoice: number;
  invoice_details?: Invoice;
  amount: number;
  payment_method: 'cash' | 'check' | 'bank_transfer' | 'mobile_money' | 'orange_money' | 'wave' | 'free_money' | 'credit_card';
  payment_method_display?: string;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  status_display?: string;
  reference_number?: string;
  transaction_id?: string;
  phone_number?: string;
  operator_reference?: string;
  notes?: string;
  recorded_by: number;
  recorded_by_name?: string;
  remaining_amount?: number;
  is_partial_payment?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentSummary {
  total_payments: number;
  total_cash: number;
  total_mobile_money: number;
  total_bank_transfer: number;
  total_check: number;
  payment_count: number;
  period_start: string;
  period_end: string;
}

// Types pour les rapports patients
export interface PatientReport {
  id: number;
  patient_access: number;
  patient_name: string;
  access_key: string;
  report_file: string;
  filename: string;
  download_url: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  download_count: number;
}

// Types pour les dashboards
export interface DashboardStats {
  user: {
    id: number;
    username: string;
    full_name: string;
    role: string;
    last_login?: string;
  };
  today: string;
  start_of_week: string;
  start_of_month: string;
}

export interface AdminDashboardStats extends DashboardStats {
  total_users: number;
  users_by_role: Record<string, number>;
  recent_users: Array<{
    id: number;
    username: string;
    email: string;
    role: string;
    date_joined: string;
  }>;
  total_patients: number;
  total_invoices: number;
  total_revenue: number;
}

export interface SecretaryDashboardStats extends DashboardStats {
  appointments_today: number;
  total_patients: number;
  recent_patients: Array<{
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    created_at: string;
  }>;
  recent_invoices: Array<{
    id: number;
    invoice_number: string;
    patient__first_name: string;
    patient__last_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

export interface DoctorDashboardStats extends DashboardStats {
  recent_reports: Array<{
    id: number;
    patient_name: string;
    created_at: string;
    report_type: string;
  }>;
  upcoming_appointments: Array<any>;
  total_reports: number;
}

export interface AccountantDashboardStats extends DashboardStats {
  monthly_revenue: number;
  pending_invoices: Array<{
    id: number;
    invoice_number: string;
    patient_name: string;
    total_amount: number;
    status: string;
    due_date: string;
  }>;
  invoices_status: {
    draft: number;
    sent: number;
    partially_paid: number;
    paid: number;
    cancelled: number;
  };
}

// Types pour les permissions
export type Permission = 
  | 'patients' 
  | 'exams' 
  | 'invoices' 
  | 'payments' 
  | 'reports' 
  | 'users' 
  | 'appointments'
  | 'all';

export interface UserPermissions {
  role: User['role'];
  permissions: Permission[];
}

// Types pour les API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Types pour les filtres de recherche
export interface SearchFilters {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface PatientFilters extends SearchFilters {
  age_min?: number;
  age_max?: number;
  created_after?: string;
  created_before?: string;
}

export interface InvoiceFilters extends SearchFilters {
  status?: Invoice['status'];
  amount_min?: number;
  amount_max?: number;
  patient?: number;
  date_from?: string;
  date_to?: string;
}

export interface PaymentFilters extends SearchFilters {
  payment_method?: Payment['payment_method'];
  status?: Payment['status'];
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
}

// Types pour le portail patient
export interface PatientLoginCredentials {
  access_key: string;
  password: string;
}

export interface PatientLoginResponse {
  success: boolean;
  patient: {
    id: number;
    full_name: string;
    phone_number: string;
  };
  access_info: {
    access_key: string;
    is_permanent: boolean;
    access_count: number;
    last_accessed?: string;
  };
  files: PatientReport[];
}
