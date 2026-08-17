import {
  User,
  Property,
  Visit,
  RentalApplication,
  Lease,
  RentPayment,
  PaymentInvoice,
  MaintenanceTicket,
  MaintenanceRequest,
  Notification,
  AuditLog,
  TestSuiteReport
} from '../types';

let currentUserId: string = 'user-owner-1';

export function setApiActiveUser(userId: string) {
  currentUserId = userId;
  localStorage.setItem('rentmate_active_user', userId);
}

export function getApiActiveUser(): string {
  const stored = localStorage.getItem('rentmate_active_user');
  if (stored) {
    currentUserId = stored;
  }
  return currentUserId;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-user-id', getApiActiveUser());

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Server request failed');
  }
  return data;
}

export const api = {
  // Auth & Personas
  setCurrentUserId: (userId: string) => setApiActiveUser(userId),
  getCurrentUser: async (): Promise<User> => {
    const res = await request<{ success: boolean; user: User }>('/auth/current-user');
    return res.user;
  },
  getUsers: async (): Promise<User[]> => {
    const res = await request<{ success: boolean; users: User[]; activeUserId: string }>('/auth/users');
    return res.users;
  },
  switchUser: async (userId: string): Promise<User> => {
    setApiActiveUser(userId);
    const res = await request<{ success: boolean; user: User }>('/auth/switch-user', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    return res.user;
  },
  registerUser: async (userData: Partial<User>): Promise<User> => {
    const res = await request<{ success: boolean; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return res.user;
  },

  // Properties
  getProperties: async (params?: Record<string, any>): Promise<Property[]> => {
    const qs = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== '' && v !== 'ALL')
        .map(([k, v]) => [k, String(v)])
    ).toString() : '';
    const res = await request<{ success: boolean; properties: Property[] }>(`/properties${qs}`);
    return res.properties;
  },
  getPropertyById: async (id: string): Promise<Property> => {
    const res = await request<{ success: boolean; property: Property }>(`/properties/${id}`);
    return res.property;
  },
  createProperty: async (data: Partial<Property> & { submitForVerification?: boolean }): Promise<Property> => {
    const res = await request<{ success: boolean; property: Property }>('/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.property;
  },
  updateProperty: async (id: string, data: Partial<Property>): Promise<Property> => {
    const res = await request<{ success: boolean; property: Property }>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.property;
  },
  submitForVerification: async (id: string): Promise<Property> => {
    const res = await request<{ success: boolean; property: Property }>(`/properties/${id}/submit-verification`, {
      method: 'POST'
    });
    return res.property;
  },
  verifyProperty: async (id: string, decisionOrApproved: boolean | { approved: boolean; notes?: string }, notes?: string): Promise<Property> => {
    const payload = typeof decisionOrApproved === 'boolean'
      ? { approved: decisionOrApproved, notes }
      : decisionOrApproved;
    const res = await request<{ success: boolean; property: Property }>(`/properties/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.property;
  },
  deleteProperty: async (id: string): Promise<void> => {
    await request<{ success: boolean; message: string }>(`/properties/${id}`, {
      method: 'DELETE'
    });
  },
  aiGenerateDescription: async (data: {
    title: string;
    propertyType: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    rentAmount: number;
  }): Promise<{ description: string; highlights: string[] }> => {
    const res = await request<{ success: boolean; description: string; highlights: string[] }>('/properties/ai-generate-description', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return { description: res.description, highlights: res.highlights };
  },

  // Shortlist
  getShortlist: async (): Promise<{ shortlistIds: string[]; properties: Property[] }> => {
    const res = await request<{ success: boolean; shortlistIds: string[]; properties: Property[] }>('/shortlist');
    return { shortlistIds: res.shortlistIds, properties: res.properties };
  },
  toggleShortlist: async (propertyId: string): Promise<{ added: boolean; shortlistIds: string[] }> => {
    const res = await request<{ success: boolean; added: boolean; shortlistIds: string[] }>('/shortlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ propertyId })
    });
    return { added: res.added, shortlistIds: res.shortlistIds };
  },

  // Visits
  getVisits: async (): Promise<Visit[]> => {
    const res = await request<{ success: boolean; visits: Visit[] }>('/visits');
    return res.visits;
  },
  createVisit: async (data: { propertyId: string; date: string; timeSlot: string; visitType: string; notes?: string }): Promise<Visit> => {
    const res = await request<{ success: boolean; visit: Visit }>('/visits', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.visit;
  },
  requestVisit: async (data: { propertyId: string; date: string; timeSlot: string; visitType: string; notes?: string }): Promise<Visit> => {
    const res = await request<{ success: boolean; visit: Visit }>('/visits', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.visit;
  },
  updateVisit: async (id: string, data: Partial<Visit>): Promise<Visit> => {
    const res = await request<{ success: boolean; visit: Visit }>(`/visits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.visit;
  },

  // Applications
  getApplications: async (): Promise<RentalApplication[]> => {
    const res = await request<{ success: boolean; applications: RentalApplication[] }>('/applications');
    return res.applications;
  },
  getApplicationById: async (id: string): Promise<RentalApplication> => {
    const res = await request<{ success: boolean; application: RentalApplication }>(`/applications/${id}`);
    return res.application;
  },
  createApplication: async (data: Partial<RentalApplication>): Promise<RentalApplication> => {
    const res = await request<{ success: boolean; application: RentalApplication }>('/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.application;
  },
  submitApplication: async (data: Partial<RentalApplication>): Promise<RentalApplication> => {
    const res = await request<{ success: boolean; application: RentalApplication }>('/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.application;
  },
  updateApplicationStatus: async (id: string, status: string, rejectionReason?: string): Promise<RentalApplication> => {
    const res = await request<{ success: boolean; application: RentalApplication }>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason })
    });
    return res.application;
  },

  // Leases
  getLeases: async (): Promise<Lease[]> => {
    const res = await request<{ success: boolean; leases: Lease[] }>('/leases');
    return res.leases;
  },
  getLeaseById: async (id: string): Promise<Lease> => {
    const res = await request<{ success: boolean; lease: Lease }>(`/leases/${id}`);
    return res.lease;
  },
  createLease: async (data: Partial<Lease>): Promise<Lease> => {
    const res = await request<{ success: boolean; lease: Lease }>('/leases', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.lease;
  },
  draftLease: async (data: Partial<Lease>): Promise<Lease> => {
    const res = await request<{ success: boolean; lease: Lease }>('/leases', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.lease;
  },
  signLease: async (id: string, signatureName: string): Promise<{ lease: Lease; generatedPayments: RentPayment[] }> => {
    const res = await request<{ success: boolean; lease: Lease; generatedPayments: RentPayment[] }>(`/leases/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify({ signatureName })
    });
    return { lease: res.lease, generatedPayments: res.generatedPayments };
  },

  // Payments / Invoices
  getPayments: async (): Promise<RentPayment[]> => {
    const res = await request<{ success: boolean; payments: RentPayment[] }>('/payments');
    return res.payments;
  },
  getInvoices: async (): Promise<PaymentInvoice[]> => {
    const res = await request<{ success: boolean; payments: RentPayment[] }>('/payments');
    return res.payments;
  },
  payInvoice: async (id: string, paymentMethod: string, transactionRef?: string): Promise<RentPayment> => {
    const res = await request<{ success: boolean; payment: RentPayment }>(`/payments/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, transactionRef })
    });
    return res.payment;
  },
  getFinancialStats: async () => {
    const res = await request<{
      success: boolean;
      stats: {
        totalCollected: number;
        totalPending: number;
        totalOverdue: number;
        activeTenancies: number;
        totalPropertiesCount: number;
      }
    }>('/payments/financial-stats');
    return res.stats;
  },

  // Maintenance
  getMaintenance: async (): Promise<MaintenanceTicket[]> => {
    const res = await request<{ success: boolean; tickets: MaintenanceTicket[] }>('/maintenance');
    return res.tickets;
  },
  getMaintenanceTickets: async (): Promise<MaintenanceRequest[]> => {
    const res = await request<{ success: boolean; tickets: MaintenanceTicket[] }>('/maintenance');
    return res.tickets;
  },
  getMaintenanceById: async (id: string): Promise<MaintenanceTicket> => {
    const res = await request<{ success: boolean; ticket: MaintenanceTicket }>(`/maintenance/${id}`);
    return res.ticket;
  },
  createMaintenance: async (data: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> => {
    const res = await request<{ success: boolean; ticket: MaintenanceTicket }>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.ticket;
  },
  createMaintenanceTicket: async (data: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> => {
    const res = await request<{ success: boolean; ticket: MaintenanceTicket }>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.ticket;
  },
  updateMaintenance: async (id: string, data: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> => {
    const res = await request<{ success: boolean; ticket: MaintenanceTicket }>(`/maintenance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.ticket;
  },
  updateMaintenanceTicket: async (id: string, data: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> => {
    const res = await request<{ success: boolean; ticket: MaintenanceTicket }>(`/maintenance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return res.ticket;
  },
  addMaintenanceComment: async (id: string, message: string): Promise<MaintenanceTicket> => {
    const res = await request<{ success: boolean; ticket: MaintenanceTicket }>(`/maintenance/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return res.ticket;
  },
  addMaintenanceMessage: async (id: string, message: string): Promise<MaintenanceTicket> => {
    const res = await request<{ success: boolean; ticket: MaintenanceTicket }>(`/maintenance/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return res.ticket;
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    const res = await request<{ success: boolean; notifications: Notification[] }>('/notifications');
    return res.notifications;
  },
  markNotificationRead: async (id: string): Promise<void> => {
    await request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' });
  },
  markAllNotificationsRead: async (): Promise<void> => {
    await request<{ success: boolean }>('/notifications/read-all', { method: 'POST' });
  },

  // Admin & Audit
  getAdminMetrics: async () => {
    const res = await request<{ success: boolean; metrics: any }>('/admin/metrics');
    return res.metrics;
  },
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await request<{ success: boolean; logs: AuditLog[] }>('/admin/audit-logs');
    return res.logs;
  },

  // Demo & Regression Tests
  resetDatabase: async (): Promise<string> => {
    const res = await request<{ success: boolean; message: string }>('/demo/reset', { method: 'POST' });
    return res.message;
  },
  runTests: async (): Promise<TestSuiteReport> => {
    const res = await request<{ success: boolean; report: TestSuiteReport }>('/demo/run-tests');
    return res.report;
  },
  runRegressionTests: async (): Promise<any> => {
    const res = await request<{ success: boolean; report: TestSuiteReport }>('/demo/run-tests');
    return {
      summary: {
        total: res.report.total,
        passed: res.report.passed,
        failed: res.report.failed,
        durationMs: res.report.durationMs
      },
      suites: res.report.results.map(r => ({
        name: r.name,
        passed: r.passed,
        details: r.message,
        durationMs: r.durationMs
      }))
    };
  },
  runFullLifecycle: async (): Promise<any> => {
    const res = await request<{ success: boolean; result: any }>('/demo/run-lifecycle', { method: 'POST' });
    return res.result;
  },
  runLifecycleSimulation: async (): Promise<any> => {
    const res = await request<{ success: boolean; result: any }>('/demo/run-lifecycle', { method: 'POST' });
    return res.result;
  }
};
