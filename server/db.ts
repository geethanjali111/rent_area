import fs from 'fs';
import path from 'path';
import { 
  DatabaseSchema, 
  User, 
  Property, 
  Visit, 
  RentalApplication, 
  Lease, 
  RentPayment, 
  MaintenanceTicket, 
  Notification, 
  AuditLog, 
  ShortlistItem,
  UserRole 
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'rentmate-db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_1',
    name: 'Eleanor Vance',
    email: 'admin@rentmate.com',
    role: 'ADMIN',
    phone: '+1 (555) 019-2834',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    bio: 'Platform Trust & Safety Administrator with 8+ years in real estate compliance.',
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'user_owner_1',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@apexproperties.com',
    role: 'OWNER',
    phone: '+1 (555) 392-8190',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
    bio: 'Premier Urban Property Manager managing luxury condos & townhouses across Seattle & Portland.',
    status: 'ACTIVE',
    createdAt: '2026-01-15T10:30:00.000Z'
  },
  {
    id: 'user_owner_2',
    name: 'Sarah Vance',
    email: 'sarah.vance@bayliving.com',
    role: 'OWNER',
    phone: '+1 (555) 847-2910',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    bio: 'Independent eco-friendly residential landlord dedicated to sustainable, well-kept rentals.',
    status: 'ACTIVE',
    createdAt: '2026-01-20T14:15:00.000Z'
  },
  {
    id: 'user_tenant_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@techpulse.io',
    role: 'TENANT',
    phone: '+1 (555) 472-9018',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    bio: 'Senior Software Engineer, clean, quiet non-smoker with a certified service dog.',
    creditScore: 785,
    monthlyIncome: 14500,
    employer: 'TechPulse Cloud Solutions',
    occupation: 'Lead Cloud Architect',
    status: 'ACTIVE',
    createdAt: '2026-02-01T09:00:00.000Z'
  },
  {
    id: 'user_tenant_2',
    name: 'Elena Rostova',
    email: 'elena.rostova@designlab.org',
    role: 'TENANT',
    phone: '+1 (555) 618-3401',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
    bio: 'UX Creative Director seeking a sunlit studio or 1-bedroom close to public transit.',
    creditScore: 740,
    monthlyIncome: 9800,
    employer: 'DesignLab Studios',
    occupation: 'Creative Director',
    status: 'ACTIVE',
    createdAt: '2026-02-10T11:45:00.000Z'
  },
  {
    id: 'user_tenant_3',
    name: 'Jordan Chen',
    email: 'jordan.chen@biomed.edu',
    role: 'TENANT',
    phone: '+1 (555) 902-1144',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    bio: 'Postdoctoral medical researcher looking for a 2-bedroom townhouse with garage parking.',
    creditScore: 760,
    monthlyIncome: 8200,
    employer: 'Pacific BioMed Research',
    occupation: 'Postdoctoral Fellow',
    status: 'ACTIVE',
    createdAt: '2026-02-12T16:20:00.000Z'
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop_skyline_penthouse',
    ownerId: 'user_owner_1',
    ownerName: 'Marcus Sterling',
    ownerEmail: 'marcus.sterling@apexproperties.com',
    ownerPhone: '+1 (555) 392-8190',
    title: 'The Luminary Skyline Penthouse with Private Terrace',
    description: 'Floor-to-ceiling panoramic glass windows overlooking Elliot Bay. Gourmet kitchen equipped with Sub-Zero & Miele appliances, hardwood quartz finishes, automated blackout shades, and an oversized cedar-lined private balcony.',
    address: '888 2nd Avenue, Unit 4202',
    city: 'Seattle',
    state: 'WA',
    zip: '98104',
    rentAmount: 3850,
    depositAmount: 3850,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1420,
    propertyType: 'CONDO',
    furnished: true,
    petFriendly: true,
    parkingSpaces: 2,
    availableDate: '2026-09-01',
    amenities: [
      'Central A/C & Climate Control',
      'In-Unit Washer & Dryer',
      'EV Charging Station',
      '24/7 Concierge & Security',
      'Rooftop Infinity Pool',
      'Fitness & Wellness Center',
      'High-Speed Fiber Internet Included',
      'Pet Spa & Dog Run'
    ],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200'
    ],
    status: 'ACTIVE',
    verificationNotes: 'Verified via King County Property Registry & Deed of Ownership. Complies with city rental safety standards.',
    verifiedBy: 'Eleanor Vance (Admin)',
    verifiedAt: '2026-02-15T14:30:00.000Z',
    featured: true,
    createdAt: '2026-02-14T10:00:00.000Z',
    updatedAt: '2026-02-15T14:30:00.000Z'
  },
  {
    id: 'prop_craftsman_bellevue',
    ownerId: 'user_owner_1',
    ownerName: 'Marcus Sterling',
    ownerEmail: 'marcus.sterling@apexproperties.com',
    ownerPhone: '+1 (555) 392-8190',
    title: 'Modernized Craftsman Home near Meydenbauer Bay',
    description: 'Charming architectural details blended with contemporary comforts. Vaulted ceilings, gas fireplace, fenced manicured backyard with fruit trees, and dedicated home office with gigabit ethernet.',
    address: '1420 102nd Ave SE',
    city: 'Bellevue',
    state: 'WA',
    zip: '98004',
    rentAmount: 4200,
    depositAmount: 4200,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 2150,
    propertyType: 'HOUSE',
    furnished: false,
    petFriendly: true,
    parkingSpaces: 2,
    availableDate: '2026-09-15',
    amenities: [
      'Fenced Private Yard',
      'Attached 2-Car Garage',
      'Gas Fireplace',
      'Central Heating & AC',
      'Stainless Steel Appliances',
      'Smart Thermostat (Nest)',
      'Storage Shed'
    ],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=1200'
    ],
    status: 'ACTIVE',
    verificationNotes: 'Deed inspected and clean. Home inspection on file.',
    verifiedBy: 'Eleanor Vance (Admin)',
    verifiedAt: '2026-02-16T11:00:00.000Z',
    featured: true,
    createdAt: '2026-02-15T08:30:00.000Z',
    updatedAt: '2026-02-16T11:00:00.000Z'
  },
  {
    id: 'prop_capitol_hill_loft',
    ownerId: 'user_owner_2',
    ownerName: 'Sarah Vance',
    ownerEmail: 'sarah.vance@bayliving.com',
    ownerPhone: '+1 (555) 847-2910',
    title: 'Sun-Drenched Industrial Loft in Vibrant Capitol Hill',
    description: 'Authentic exposed timber beams, 14-foot concrete ceilings, polished concrete floors, and custom steel-framed partition walls. Walk to light rail station, cafes, and Cal Anderson Park in under 4 minutes.',
    address: '1120 E Pine St, Apt 3B',
    city: 'Seattle',
    state: 'WA',
    zip: '98122',
    rentAmount: 2450,
    depositAmount: 2450,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 890,
    propertyType: 'APARTMENT',
    furnished: false,
    petFriendly: true,
    parkingSpaces: 1,
    availableDate: '2026-08-25',
    amenities: [
      'Exposed Brick & Beams',
      'In-Unit Laundry',
      'Dishwasher',
      'Bike Storage Room',
      'Secured Keyless Entry',
      'Balcony with City View'
    ],
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200'
    ],
    status: 'ACTIVE',
    verificationNotes: 'Verified building title & HOA rental approval.',
    verifiedBy: 'Eleanor Vance (Admin)',
    verifiedAt: '2026-02-18T16:00:00.000Z',
    featured: false,
    createdAt: '2026-02-17T12:00:00.000Z',
    updatedAt: '2026-02-18T16:00:00.000Z'
  },
  {
    id: 'prop_fremont_townhouse',
    ownerId: 'user_owner_2',
    ownerName: 'Sarah Vance',
    ownerEmail: 'sarah.vance@bayliving.com',
    ownerPhone: '+1 (555) 847-2910',
    title: 'Eco-Smart 3-Story Townhome with Solar & Private Roofdeck',
    description: 'Built-Green certified 4-Star 3-story townhome featuring radiant in-floor heating, solar power array, induction cooking, and a scenic rooftop deck facing the Cascade Mountains.',
    address: '3640 Fremont Ave N',
    city: 'Seattle',
    state: 'WA',
    zip: '98103',
    rentAmount: 3100,
    depositAmount: 3100,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1280,
    propertyType: 'TOWNHOUSE',
    furnished: false,
    petFriendly: false,
    parkingSpaces: 1,
    availableDate: '2026-09-01',
    amenities: [
      'Private Rooftop Deck',
      'Radiant Heated Floors',
      'Solar Panel Array',
      'Electric Vehicle Charger',
      'Walk to Burke-Gilman Trail',
      'Energy-Star Appliances'
    ],
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=1200'
    ],
    status: 'RENTED',
    verificationNotes: 'Certified green build certificate verified.',
    verifiedBy: 'Eleanor Vance (Admin)',
    verifiedAt: '2026-02-05T10:00:00.000Z',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-20T10:00:00.000Z'
  },
  {
    id: 'prop_queen_anne_draft',
    ownerId: 'user_owner_1',
    ownerName: 'Marcus Sterling',
    ownerEmail: 'marcus.sterling@apexproperties.com',
    ownerPhone: '+1 (555) 392-8190',
    title: 'Historic Queen Anne Victorian Flat with Sound Views',
    description: 'Classic Victorian architectural charm with bay windows, pocket doors, stained glass accents, and contemporary kitchen overhaul.',
    address: '612 W Highland Dr',
    city: 'Seattle',
    state: 'WA',
    zip: '98119',
    rentAmount: 3400,
    depositAmount: 3400,
    bedrooms: 2,
    bathrooms: 1.5,
    squareFeet: 1350,
    propertyType: 'APARTMENT',
    furnished: false,
    petFriendly: true,
    parkingSpaces: 1,
    availableDate: '2026-10-01',
    amenities: [
      'Puget Sound Views',
      'Hardwood Floors',
      'Bay Window Nook',
      'Wine Storage',
      'Private Storage Locker'
    ],
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=1200'
    ],
    status: 'PENDING_VERIFICATION',
    verificationNotes: 'Awaiting platform admin document review.',
    createdAt: '2026-02-22T15:00:00.000Z',
    updatedAt: '2026-02-22T15:30:00.000Z'
  }
];

export const INITIAL_VISITS: Visit[] = [
  {
    id: 'visit_101',
    propertyId: 'prop_skyline_penthouse',
    propertyTitle: 'The Luminary Skyline Penthouse with Private Terrace',
    propertyAddress: '888 2nd Avenue, Unit 4202',
    propertyCity: 'Seattle',
    tenantId: 'user_tenant_1',
    tenantName: 'Alex Rivera',
    tenantEmail: 'alex.rivera@techpulse.io',
    tenantPhone: '+1 (555) 472-9018',
    ownerId: 'user_owner_1',
    date: '2026-08-28',
    timeSlot: '14:00 - 14:45',
    visitType: 'IN_PERSON',
    status: 'CONFIRMED',
    notes: 'Interested in seeing parking garage EV charging and balcony space.',
    ownerNotes: 'Confirmed with front desk concierge for visitor pass.',
    createdAt: '2026-08-16T10:00:00.000Z',
    updatedAt: '2026-08-16T11:20:00.000Z'
  },
  {
    id: 'visit_102',
    propertyId: 'prop_capitol_hill_loft',
    propertyTitle: 'Sun-Drenched Industrial Loft in Vibrant Capitol Hill',
    propertyAddress: '1120 E Pine St, Apt 3B',
    propertyCity: 'Seattle',
    tenantId: 'user_tenant_2',
    tenantName: 'Elena Rostova',
    tenantEmail: 'elena.rostova@designlab.org',
    tenantPhone: '+1 (555) 618-3401',
    ownerId: 'user_owner_2',
    date: '2026-08-29',
    timeSlot: '11:00 - 11:30',
    visitType: 'VIRTUAL',
    status: 'REQUESTED',
    notes: 'Virtual live video walkthrough preferred before travelling to Seattle.',
    createdAt: '2026-08-17T02:30:00.000Z',
    updatedAt: '2026-08-17T02:30:00.000Z'
  }
];

export const INITIAL_APPLICATIONS: RentalApplication[] = [
  {
    id: 'app_201',
    propertyId: 'prop_craftsman_bellevue',
    propertyTitle: 'Modernized Craftsman Home near Meydenbauer Bay',
    propertyRent: 4200,
    propertyAddress: '1420 102nd Ave SE, Bellevue, WA 98004',
    tenantId: 'user_tenant_3',
    tenantName: 'Jordan Chen',
    tenantEmail: 'jordan.chen@biomed.edu',
    tenantPhone: '+1 (555) 902-1144',
    ownerId: 'user_owner_1',
    monthlyIncome: 8200,
    occupation: 'Postdoctoral Fellow',
    employer: 'Pacific BioMed Research',
    creditScoreEstimate: 760,
    moveInDate: '2026-09-15',
    leaseTermMonths: 12,
    occupantsCount: 2,
    hasPets: false,
    backgroundCheckConsent: true,
    references: [
      {
        name: 'Dr. Katherine Wu',
        relationship: 'Department Head & Supervisor',
        phone: '+1 (555) 301-8899',
        email: 'katherine.wu@biomed.edu'
      },
      {
        name: 'Robert Hastings',
        relationship: 'Previous Landlord (3 years)',
        phone: '+1 (555) 441-2900',
        email: 'hastings.rentals@gmail.com'
      }
    ],
    message: 'We are very responsible tenants relocating for research work at the Bellevue medical campus. Non-smokers, no pets, excellent rental history.',
    status: 'APPROVED',
    aiRiskScore: 94,
    aiRiskSummary: 'Low Risk: Rent-to-income ratio is 51% (or 32% combined with co-applicant), high credit rating (760), flawless references verified.',
    createdAt: '2026-08-14T09:15:00.000Z',
    updatedAt: '2026-08-15T13:40:00.000Z'
  }
];

export const INITIAL_LEASES: Lease[] = [
  {
    id: 'lease_301',
    applicationId: 'app_legacy_fremont',
    propertyId: 'prop_fremont_townhouse',
    propertyTitle: 'Eco-Smart 3-Story Townhome with Solar & Private Roofdeck',
    propertyAddress: '3640 Fremont Ave N, Seattle, WA 98103',
    ownerId: 'user_owner_2',
    ownerName: 'Sarah Vance',
    tenantId: 'user_tenant_1',
    tenantName: 'Alex Rivera',
    tenantEmail: 'alex.rivera@techpulse.io',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    monthlyRent: 3100,
    depositAmount: 3100,
    paymentDueDay: 1,
    terms: 'Standard 12-Month WA State Residential Lease Agreement with renewable clause.',
    specialClauses: [
      'Tenant responsible for maintaining rooftop solar clean airflow.',
      'Strict non-smoking on premises.',
      'Tenant agrees to use felt floor protectors on hardwood.'
    ],
    status: 'ACTIVE',
    ownerSignedAt: '2026-02-20T10:00:00.000Z',
    tenantSignedAt: '2026-02-20T14:22:00.000Z',
    tenantSignatureName: 'Alex Rivera',
    securityDepositPaid: true,
    createdAt: '2026-02-19T16:00:00.000Z',
    updatedAt: '2026-02-20T14:22:00.000Z'
  }
];

export const INITIAL_PAYMENTS: RentPayment[] = [
  {
    id: 'pay_401',
    leaseId: 'lease_301',
    propertyId: 'prop_fremont_townhouse',
    propertyTitle: 'Eco-Smart 3-Story Townhome with Solar & Private Roofdeck',
    ownerId: 'user_owner_2',
    tenantId: 'user_tenant_1',
    tenantName: 'Alex Rivera',
    amount: 3100,
    type: 'SECURITY_DEPOSIT',
    dueDate: '2026-03-01',
    paidDate: '2026-02-20T14:30:00.000Z',
    status: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    transactionRef: 'ACH_DEP_992148',
    invoiceNumber: 'INV-2026-02-DEP',
    notes: 'Refundable Security Deposit Escrow',
    createdAt: '2026-02-20T14:25:00.000Z'
  },
  {
    id: 'pay_402',
    leaseId: 'lease_301',
    propertyId: 'prop_fremont_townhouse',
    propertyTitle: 'Eco-Smart 3-Story Townhome with Solar & Private Roofdeck',
    ownerId: 'user_owner_2',
    tenantId: 'user_tenant_1',
    tenantName: 'Alex Rivera',
    amount: 3100,
    type: 'MONTHLY_RENT',
    dueDate: '2026-08-01',
    paidDate: '2026-08-01T09:12:00.000Z',
    status: 'PAID',
    paymentMethod: 'AUTO_PAY',
    transactionRef: 'ACH_RENT_881920',
    invoiceNumber: 'INV-2026-08-001',
    notes: 'August 2026 Monthly Rent (Auto-debit)',
    createdAt: '2026-07-25T00:00:00.000Z'
  },
  {
    id: 'pay_403',
    leaseId: 'lease_301',
    propertyId: 'prop_fremont_townhouse',
    propertyTitle: 'Eco-Smart 3-Story Townhome with Solar & Private Roofdeck',
    ownerId: 'user_owner_2',
    tenantId: 'user_tenant_1',
    tenantName: 'Alex Rivera',
    amount: 3100,
    type: 'MONTHLY_RENT',
    dueDate: '2026-09-01',
    status: 'PENDING',
    invoiceNumber: 'INV-2026-09-001',
    notes: 'September 2026 Monthly Rent due on 1st',
    createdAt: '2026-08-15T00:00:00.000Z'
  }
];

export const INITIAL_MAINTENANCE: MaintenanceTicket[] = [
  {
    id: 'maint_501',
    propertyId: 'prop_fremont_townhouse',
    propertyTitle: 'Eco-Smart 3-Story Townhome with Solar & Private Roofdeck',
    propertyAddress: '3640 Fremont Ave N, Seattle, WA 98103',
    leaseId: 'lease_301',
    tenantId: 'user_tenant_1',
    tenantName: 'Alex Rivera',
    ownerId: 'user_owner_2',
    title: 'Secondary bathroom shower water pressure drop',
    category: 'PLUMBING',
    priority: 'MEDIUM',
    description: 'The top-floor guest shower head has low water pressure compared to last week. Looks like possible aerator or valve buildup.',
    photos: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800'
    ],
    status: 'IN_PROGRESS',
    contractorAssigned: 'Cascade Eco-Plumbing LLC',
    estimatedCost: 150,
    messages: [
      {
        id: 'msg_1',
        senderId: 'user_tenant_1',
        senderName: 'Alex Rivera',
        senderRole: 'TENANT',
        message: 'Hi Sarah, submitted photos. Happy to be home during technician visits on Thursday afternoon.',
        timestamp: '2026-08-16T14:10:00.000Z'
      },
      {
        id: 'msg_2',
        senderId: 'user_owner_2',
        senderName: 'Sarah Vance',
        senderRole: 'OWNER',
        message: 'Thanks Alex! Cascade Eco-Plumbing is dispatched for Thursday at 2:00 PM. They will inspect the pressure regulator.',
        timestamp: '2026-08-16T15:45:00.000Z'
      }
    ],
    createdAt: '2026-08-16T14:00:00.000Z',
    updatedAt: '2026-08-16T15:45:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_owner_1',
    title: 'New In-Person Visit Request',
    message: 'Alex Rivera requested an in-person tour for The Luminary Skyline Penthouse on Aug 28.',
    type: 'ACTION_REQUIRED',
    link: '/visits',
    read: false,
    createdAt: '2026-08-16T10:00:00.000Z'
  },
  {
    id: 'notif_2',
    userId: 'user_tenant_1',
    title: 'Tour Confirmed',
    message: 'Marcus Sterling confirmed your tour for Aug 28 at 2:00 PM.',
    type: 'SUCCESS',
    link: '/visits',
    read: true,
    createdAt: '2026-08-16T11:20:00.000Z'
  },
  {
    id: 'notif_3',
    userId: 'user_admin_1',
    title: 'New Property Verification Pending',
    message: 'Marcus Sterling submitted "Historic Queen Anne Victorian Flat" for verification.',
    type: 'ACTION_REQUIRED',
    link: '/admin/verifications',
    read: false,
    createdAt: '2026-08-22T15:30:00.000Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit_1',
    userId: 'user_admin_1',
    userName: 'Eleanor Vance',
    userRole: 'ADMIN',
    action: 'VERIFY_PROPERTY',
    entityType: 'Property',
    entityId: 'prop_skyline_penthouse',
    details: 'Verified ownership deed and approved listing to ACTIVE state.',
    timestamp: '2026-02-15T14:30:00.000Z',
    ip: '192.168.1.100'
  },
  {
    id: 'audit_2',
    userId: 'user_tenant_1',
    userName: 'Alex Rivera',
    userRole: 'TENANT',
    action: 'SIGN_LEASE',
    entityType: 'Lease',
    entityId: 'lease_301',
    details: 'Digital signature authenticated and lease executed.',
    timestamp: '2026-02-20T14:22:00.000Z',
    ip: '192.168.1.144'
  },
  {
    id: 'audit_3',
    userId: 'user_tenant_1',
    userName: 'Alex Rivera',
    userRole: 'TENANT',
    action: 'PAY_RENT',
    entityType: 'RentPayment',
    entityId: 'pay_402',
    details: 'Automatic recurring payment processed for August 2026 ($3,100.00).',
    timestamp: '2026-08-01T09:12:00.000Z',
    ip: '192.168.1.144'
  }
];

export const INITIAL_SHORTLISTS: ShortlistItem[] = [
  {
    id: 'short_1',
    tenantId: 'user_tenant_1',
    propertyId: 'prop_skyline_penthouse',
    createdAt: '2026-08-15T12:00:00.000Z'
  },
  {
    id: 'short_2',
    tenantId: 'user_tenant_2',
    propertyId: 'prop_capitol_hill_loft',
    createdAt: '2026-08-16T18:00:00.000Z'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.properties)) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading database file, resetting to initial seed:', err);
    }
    return this.getFreshSeed();
  }

  private save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to disk:', err);
    }
  }

  public getFreshSeed(): DatabaseSchema {
    return {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      properties: JSON.parse(JSON.stringify(INITIAL_PROPERTIES)),
      visits: JSON.parse(JSON.stringify(INITIAL_VISITS)),
      applications: JSON.parse(JSON.stringify(INITIAL_APPLICATIONS)),
      leases: JSON.parse(JSON.stringify(INITIAL_LEASES)),
      payments: JSON.parse(JSON.stringify(INITIAL_PAYMENTS)),
      maintenance: JSON.parse(JSON.stringify(INITIAL_MAINTENANCE)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
      shortlists: JSON.parse(JSON.stringify(INITIAL_SHORTLISTS))
    };
  }

  public reset(): DatabaseSchema {
    this.data = this.getFreshSeed();
    this.save();
    return this.data;
  }

  // --- USERS & AUTH ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- PROPERTIES ---
  public getProperties(filters?: {
    search?: string;
    city?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    petFriendly?: boolean;
    furnished?: boolean;
    status?: string;
    ownerId?: string;
    viewerRole?: UserRole;
    viewerId?: string;
  }): Property[] {
    let result = [...this.data.properties];

    // Status / Role-based visibility
    if (filters?.ownerId) {
      result = result.filter(p => p.ownerId === filters.ownerId);
    } else if (filters?.viewerRole === 'ADMIN') {
      // Admins see everything
    } else if (filters?.viewerRole === 'OWNER' && filters?.viewerId) {
      // If no specific ownerId requested, only show active/rented to general or owner's own drafts
      result = result.filter(p => p.status === 'ACTIVE' || p.status === 'RENTED' || p.ownerId === filters.viewerId);
    } else {
      // Public / Tenant sees ACTIVE or RENTED by default, or specific filter
      if (!filters?.status) {
        result = result.filter(p => p.status === 'ACTIVE' || p.status === 'RENTED');
      }
    }

    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter(p => p.status === filters.status);
    }

    if (filters?.city && filters.city !== 'ALL') {
      result = result.filter(p => p.city.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters?.propertyType && filters.propertyType !== 'ALL') {
      result = result.filter(p => p.propertyType === filters.propertyType);
    }

    if (filters?.minPrice !== undefined && !isNaN(filters.minPrice)) {
      result = result.filter(p => p.rentAmount >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      result = result.filter(p => p.rentAmount <= filters.maxPrice!);
    }

    if (filters?.bedrooms !== undefined && !isNaN(filters.bedrooms) && filters.bedrooms > 0) {
      result = result.filter(p => p.bedrooms >= filters.bedrooms!);
    }

    if (filters?.bathrooms !== undefined && !isNaN(filters.bathrooms) && filters.bathrooms > 0) {
      result = result.filter(p => p.bathrooms >= filters.bathrooms!);
    }

    if (filters?.petFriendly === true) {
      result = result.filter(p => p.petFriendly === true);
    }

    if (filters?.furnished === true) {
      result = result.filter(p => p.furnished === true);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.amenities.some(a => a.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getPropertyById(id: string): Property | undefined {
    return this.data.properties.find(p => p.id === id);
  }

  public createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property {
    const newProp: Property = {
      ...property,
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.properties.push(newProp);
    this.save();
    return newProp;
  }

  public updateProperty(id: string, updates: Partial<Property>): Property | null {
    const index = this.data.properties.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.properties[index] = {
      ...this.data.properties[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.properties[index];
  }

  public deleteProperty(id: string): boolean {
    const lenBefore = this.data.properties.length;
    this.data.properties = this.data.properties.filter(p => p.id !== id);
    if (this.data.properties.length !== lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // --- SHORTLISTS ---
  public getShortlist(tenantId: string): string[] {
    return this.data.shortlists.filter(s => s.tenantId === tenantId).map(s => s.propertyId);
  }

  public toggleShortlist(tenantId: string, propertyId: string): boolean {
    const existingIndex = this.data.shortlists.findIndex(s => s.tenantId === tenantId && s.propertyId === propertyId);
    if (existingIndex > -1) {
      this.data.shortlists.splice(existingIndex, 1);
      this.save();
      return false; // removed
    } else {
      this.data.shortlists.push({
        id: `short_${Date.now()}`,
        tenantId,
        propertyId,
        createdAt: new Date().toISOString()
      });
      this.save();
      return true; // added
    }
  }

  // --- VISITS ---
  public getVisits(user: User): Visit[] {
    if (user.role === 'ADMIN') {
      return this.data.visits;
    }
    if (user.role === 'OWNER') {
      return this.data.visits.filter(v => v.ownerId === user.id);
    }
    return this.data.visits.filter(v => v.tenantId === user.id);
  }

  public getVisitById(id: string): Visit | undefined {
    return this.data.visits.find(v => v.id === id);
  }

  public createVisit(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Visit {
    const newVisit: Visit = {
      ...visit,
      id: `visit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.visits.push(newVisit);
    this.save();
    return newVisit;
  }

  public updateVisit(id: string, updates: Partial<Visit>): Visit | null {
    const idx = this.data.visits.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.data.visits[idx] = {
      ...this.data.visits[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.visits[idx];
  }

  // --- APPLICATIONS ---
  public getApplications(user: User): RentalApplication[] {
    if (user.role === 'ADMIN') {
      return this.data.applications;
    }
    if (user.role === 'OWNER') {
      return this.data.applications.filter(a => a.ownerId === user.id);
    }
    return this.data.applications.filter(a => a.tenantId === user.id);
  }

  public getApplicationById(id: string): RentalApplication | undefined {
    return this.data.applications.find(a => a.id === id);
  }

  public createApplication(app: Omit<RentalApplication, 'id' | 'createdAt' | 'updatedAt'>): RentalApplication {
    const newApp: RentalApplication = {
      ...app,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.applications.push(newApp);
    this.save();
    return newApp;
  }

  public updateApplication(id: string, updates: Partial<RentalApplication>): RentalApplication | null {
    const idx = this.data.applications.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.applications[idx] = {
      ...this.data.applications[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.applications[idx];
  }

  // --- LEASES ---
  public getLeases(user: User): Lease[] {
    if (user.role === 'ADMIN') {
      return this.data.leases;
    }
    if (user.role === 'OWNER') {
      return this.data.leases.filter(l => l.ownerId === user.id);
    }
    return this.data.leases.filter(l => l.tenantId === user.id);
  }

  public getLeaseById(id: string): Lease | undefined {
    return this.data.leases.find(l => l.id === id);
  }

  public createLease(lease: Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>): Lease {
    const newLease: Lease = {
      ...lease,
      id: `lease_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.leases.push(newLease);
    this.save();
    return newLease;
  }

  public updateLease(id: string, updates: Partial<Lease>): Lease | null {
    const idx = this.data.leases.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.leases[idx] = {
      ...this.data.leases[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.leases[idx];
  }

  // --- PAYMENTS ---
  public getPayments(user: User): RentPayment[] {
    if (user.role === 'ADMIN') {
      return this.data.payments;
    }
    if (user.role === 'OWNER') {
      return this.data.payments.filter(p => p.ownerId === user.id);
    }
    return this.data.payments.filter(p => p.tenantId === user.id);
  }

  public getPaymentById(id: string): RentPayment | undefined {
    return this.data.payments.find(p => p.id === id);
  }

  public createPayment(payment: Omit<RentPayment, 'id' | 'createdAt'>): RentPayment {
    const newPay: RentPayment = {
      ...payment,
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.payments.push(newPay);
    this.save();
    return newPay;
  }

  public updatePayment(id: string, updates: Partial<RentPayment>): RentPayment | null {
    const idx = this.data.payments.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.payments[idx] = {
      ...this.data.payments[idx],
      ...updates
    };
    this.save();
    return this.data.payments[idx];
  }

  // --- MAINTENANCE ---
  public getMaintenance(user: User): MaintenanceTicket[] {
    if (user.role === 'ADMIN') {
      return this.data.maintenance;
    }
    if (user.role === 'OWNER') {
      return this.data.maintenance.filter(m => m.ownerId === user.id);
    }
    return this.data.maintenance.filter(m => m.tenantId === user.id);
  }

  public getMaintenanceById(id: string): MaintenanceTicket | undefined {
    return this.data.maintenance.find(m => m.id === id);
  }

  public createMaintenance(ticket: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>): MaintenanceTicket {
    const newMaint: MaintenanceTicket = {
      ...ticket,
      id: `maint_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.maintenance.push(newMaint);
    this.save();
    return newMaint;
  }

  public updateMaintenance(id: string, updates: Partial<MaintenanceTicket>): MaintenanceTicket | null {
    const idx = this.data.maintenance.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.data.maintenance[idx] = {
      ...this.data.maintenance[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.maintenance[idx];
  }

  public addMaintenanceMessage(ticketId: string, message: {
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    message: string;
  }): MaintenanceTicket | null {
    const ticket = this.data.maintenance.find(m => m.id === ticketId);
    if (!ticket) return null;
    
    ticket.messages.push({
      id: `msg_${Date.now()}`,
      senderId: message.senderId,
      senderName: message.senderName,
      senderRole: message.senderRole,
      message: message.message,
      timestamp: new Date().toISOString()
    });
    ticket.updatedAt = new Date().toISOString();
    this.save();
    return ticket;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(notif: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const newNotif: Notification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  public markNotificationRead(id: string, userId: string): boolean {
    const n = this.data.notifications.find(item => item.id === id && item.userId === userId);
    if (n) {
      n.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(limit = 100): AuditLog[] {
    return [...this.data.auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const entry: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    return entry;
  }
}

export const db = new Database();
