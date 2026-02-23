import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginCredentials, 
  AuthResponse, 
  Patient, 
  PatientAccess,
  Invoice, 
  ExamType, 
  PaginatedResponse, 
  PatientReport, 
  PatientLoginCredentials, 
  PatientLoginResponse, 
  Payment, 
  PaymentSummary
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token JWT
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Intercepteur pour gérer les erreurs d'authentification
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expiré, essayer de le renouveler
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.data.access);
              
              // Retry la requête originale
              error.config.headers.Authorization = `Bearer ${response.data.access}`;
              return this.client.request(error.config);
            } catch (refreshError) {
              // Refresh failed, redirect to login
              this.logout();
              window.location.href = '/login';
            }
          } else {
            this.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentification
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/token/', credentials);
    return response.data;
  }

  async refreshToken(refresh: string): Promise<AxiosResponse<{ access: string }>> {
    return this.client.post('/auth/token/refresh/', { refresh });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Dashboards
  async getAdminDashboard(): Promise<any> {
    const response = await this.client.get('/auth/admin-stats/');
    return response.data;
  }

  async getSecretaryDashboard(): Promise<any> {
    const response = await this.client.get('/auth/secretary-stats/');
    return response.data;
  }

  async getDoctorDashboard(): Promise<any> {
    const response = await this.client.get('/auth/doctor-stats/');
    return response.data;
  }

  async getAccountantDashboard(): Promise<any> {
    const response = await this.client.get('/auth/accountant-stats/');
    return response.data;
  }

  // Patients
  async getPatients(params?: any): Promise<PaginatedResponse<Patient>> {
    const response = await this.client.get<PaginatedResponse<Patient>>('/patients/', { params });
    return response.data;
  }

  async getPatient(id: number): Promise<Patient> {
    const response = await this.client.get<Patient>(`/patients/${id}/`);
    return response.data;
  }

  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    const response = await this.client.post<Patient>('/patients/', patient);
    return response.data;
  }

  async updatePatient(id: number, patient: Partial<Patient>): Promise<Patient> {
    const response = await this.client.put<Patient>(`/patients/${id}/`, patient);
    return response.data;
  }

  async deletePatient(id: number): Promise<void> {
    await this.client.delete(`/patients/${id}/`);
  }

  // Accès patients
  async getPatientAccesses(params?: any): Promise<any> {
    const response = await this.client.get('/patients/access/', { params });
    return response.data;
  }

  async generatePatientAccess(patientId: number): Promise<PatientAccess> {
    try {
      const response = await this.client.post<PatientAccess>('/patients/access/generate/', {
        patient_id: patientId,
        validity_days: 90  // 3 mois de validité par défaut
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la génération de l\'accès patient:', error);
      // Si l'erreur est 400 et que l'accès existe déjà, on essaie de le récupérer
      if (error?.response?.status === 400 && error?.response?.data?.error?.includes('existe déjà')) {
        const existingAccess = await this.client.get<{results: PatientAccess[]}>(`/patients/access/?patient_id=${patientId}`);
        if (existingAccess.data?.results?.length > 0) {
          return existingAccess.data.results[0];
        }
      }
      throw error;
    }
  }

  // Factures
  async getInvoices(params?: Record<string, any>): Promise<PaginatedResponse<Invoice>> {
    const response = await this.client.get<PaginatedResponse<Invoice>>('/invoices/', { params });
    return response.data;
  }

  async getInvoice(id: number): Promise<Invoice> {
    const response = await this.client.get<Invoice>(`/invoices/${id}/`);
    return response.data;
  }

  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    const response = await this.client.post<Invoice>('/invoices/', invoice);
    return response.data;
  }

  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice> {
    const response = await this.client.put<Invoice>(`/invoices/${id}/`, invoice);
    return response.data;
  }

  async deleteInvoice(id: number): Promise<void> {
    await this.client.delete(`/invoices/${id}/`);
  }

  async downloadInvoicePDF(id: number): Promise<Blob> {
    const response = await this.client.get(`/invoices/${id}/download_pdf/`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Paiements
  async getPayments(params?: Record<string, any>): Promise<PaginatedResponse<Payment>> {
    const response = await this.client.get<PaginatedResponse<Payment>>('/payments/', { params });
    return response.data;
  }

  async getPayment(id: number): Promise<Payment> {
    const response = await this.client.get<Payment>(`/payments/${id}/`);
    return response.data;
  }

  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const response = await this.client.post<Payment>('/payments/', payment);
    return response.data;
  }

  async updatePayment(id: number, payment: Partial<Payment>): Promise<Payment> {
    const response = await this.client.put<Payment>(`/payments/${id}/`, payment);
    return response.data;
  }

  async downloadReceiptPDF(id: number): Promise<Blob> {
    const response = await this.client.get(`/payments/${id}/receipt/`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Types d'examens
  async getExamTypes(params?: Record<string, any>): Promise<PaginatedResponse<ExamType>> {
    const response = await this.client.get<PaginatedResponse<ExamType>>('/exams/', { params });
    return response.data;
  }

  async getExamType(id: number): Promise<ExamType> {
    const response = await this.client.get<ExamType>(`/exams/${id}/`);
    return response.data;
  }

  async createExamType(examType: Partial<ExamType>): Promise<ExamType> {
    const response = await this.client.post<ExamType>('/exams/', examType);
    return response.data;
  }

  async updateExamType(id: number, examType: Partial<ExamType>): Promise<ExamType> {
    const response = await this.client.put<ExamType>(`/exams/${id}/`, examType);
    return response.data;
  }

  async deleteExamType(id: number): Promise<void> {
    await this.client.delete(`/exams/${id}/`);
  }


  // Utilisateurs
  async getUsers(params?: any): Promise<any> {
    const response = await this.client.get('/auth/users/', { params });
    return response.data;
  }

  async createUser(userData: any): Promise<any> {
    const response = await this.client.post('/auth/users/', userData);
    return response.data;
  }

  async updateUser(id: number, userData: any): Promise<any> {
    const response = await this.client.put(`/auth/users/${id}/`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.client.delete(`/auth/users/${id}/`);
  }

  // Recherche globale
  async globalSearch(query: string): Promise<any> {
    const response = await this.client.get('/search/', { params: { q: query } });
    return response.data;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const response = await this.client.get<Patient[]>('/search/patients/', { params: { q: query } });
    return response.data;
  }

  async getSearchStats(): Promise<any> {
    const response = await this.client.get('/search/stats/');
    return response.data;
  }

  // Portail patient
  async patientLogin(credentials: PatientLoginCredentials): Promise<PatientLoginResponse> {
    const response = await this.client.post<PatientLoginResponse>('/patients/portal/login/', credentials);
    return response.data;
  }

  async getPatientReportsForPortal(): Promise<PatientReport[]> {
    const response = await this.client.get<PatientReport[]>('/reports/patient/');
    return response.data;
  }

  async downloadPatientReport(id: number): Promise<Blob> {
    const response = await this.client.get(`/reports/patient-download/${id}/`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Admin Reports API
  async getPatientReports(params?: any): Promise<any> {
    const response = await this.client.get('/reports/admin/', { params });
    return response.data;
  }

  async createPatientReport(data: FormData): Promise<any> {
    const response = await this.client.post('/reports/admin/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async togglePatientReportActive(id: number): Promise<any> {
    const response = await this.client.post(`/reports/admin/${id}/toggle_active/`);
    return response.data;
  }

  async deletePatientReport(id: number): Promise<void> {
    await this.client.delete(`/reports/admin/${id}/`);
  }

  async deletePayment(id: number): Promise<void> {
    await this.client.delete(`/payments/${id}/`);
  }

  async getPaymentSummary(params?: any): Promise<PaymentSummary> {
    const response = await this.client.get<PaymentSummary>('/payments/summary/', { params });
    return response.data;
  }

  async getPaymentsByInvoice(invoiceId: number): Promise<any> {
    const response = await this.client.get(`/payments/by_invoice/?invoice_id=${invoiceId}`);
    return response.data;
  }
}

export const api = new ApiClient();
export default api;
