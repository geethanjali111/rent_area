export type UserRole = 'ADMIN' | 'OWNER' | 'TENANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarUrl: string;
  bio?: string;
  creditScore?: number;
  monthlyIncome?: number;
  employer?: string;
  occupation?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'CONDO' | 'TOWNHOUSE' | 'STUDIO';
export type PropertyStatus = 
  | 'DRAFT' 
  | 'PENDING_VERIFICATION' 
  | 'VERIFIED' 
  | 'ACTIVE' 
  | 'RENTED' 
  | 'DELISTED' 
  | 'REJECTED';

export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  rentAmount: number;
  depositAmount: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: PropertyType;
  furnished: boolean;
  petFriendly: boolean;
  parkingSpaces: number;
  availableDate: string;
  amenities: string[];
  images: string[];
  status: PropertyStatus;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VisitType = 'IN_PERSON' | 'VIRTUAL';
export type VisitStatus = 'REQUESTED' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Visit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyCity: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  ownerId: string;
  date: string;
  timeSlot: string;
  visitType: VisitType;
  status: VisitStatus;
  notes?: string;
  ownerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'LEASE_SENT';

export interface RentalReference {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface RentalApplication {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyRent: number;
  propertyAddress: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  ownerId: string;
  monthlyIncome: number;
  occupation: string;
  employer: string;
  creditScoreEstimate: number;
  moveInDate: string;
  leaseTermMonths: number;
  occupantsCount: number;
  hasPets: boolean;
  petDetails?: string;
  backgroundCheckConsent: boolean;
  references: RentalReference[];
  message?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  leaseId?: string;
  aiRiskScore?: number; // 0-100 (higher = safer)
  aiRiskSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeaseStatus = 'DRAFT' | 'PENDING_TENANT_SIGNATURE' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED';

export interface Lease {
  id: string;
  applicationId: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  ownerId: string;
  ownerName: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  paymentDueDay: number;
  terms: string;
  specialClauses: string[];
  status: LeaseStatus;
  ownerSignedAt: string;
  tenantSignedAt?: string;
  tenantSignatureName?: string;
  securityDepositPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'FAILED';
export type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'AUTO_PAY';
export type PaymentType = 'MONTHLY_RENT' | 'SECURITY_DEPOSIT' | 'LATE_FEE' | 'UTILITIES';

export interface RentPayment {
  id: string;
  leaseId: string;
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  type: PaymentType;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  invoiceNumber: string;
  notes?: string;
  createdAt: string;
}

export type MaintenanceCategory = 
  | 'PLUMBING' 
  | 'ELECTRICAL' 
  | 'HVAC' 
  | 'APPLIANCE' 
  | 'STRUCTURAL' 
  | 'PEST_CONTROL' 
  | 'OTHER';

export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
export type MaintenanceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface MaintenanceMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  leaseId: string;
  tenantId: string;
  tenantName: string;
  ownerId: string;
  title: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  description: string;
  photos: string[];
  status: MaintenanceStatus;
  contractorAssigned?: string;
  estimatedCost?: number;
  resolutionNotes?: string;
  resolvedAt?: string;
  messages: MaintenanceMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION_REQUIRED';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface ShortlistItem {
  id: string;
  tenantId: string;
  propertyId: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  properties: Property[];
  visits: Visit[];
  applications: RentalApplication[];
  leases: Lease[];
  payments: RentPayment[];
  maintenance: MaintenanceTicket[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  shortlists: ShortlistItem[];
}
