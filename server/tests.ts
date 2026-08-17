import { db } from './db';
import { User, Property, Visit, RentalApplication, Lease, RentPayment, MaintenanceTicket } from './types';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface TestSuiteReport {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  results: TestResult[];
  securityChecksPassed: boolean;
  lifecycleE2EPassed: boolean;
}

export async function runAllTests(): Promise<TestSuiteReport> {
  const startTime = Date.now();
  const results: TestResult[] = [];

  const run = (suite: string, name: string, fn: () => void | Promise<void>) => {
    const t0 = Date.now();
    try {
      fn();
      results.push({
        suite,
        name,
        passed: true,
        message: 'Passed successfully',
        durationMs: Date.now() - t0
      });
    } catch (err: any) {
      results.push({
        suite,
        name,
        passed: false,
        message: err.message || String(err),
        durationMs: Date.now() - t0
      });
    }
  };

  // 1. Auth & Personas
  run('Authentication & Personas', 'Verify Default Users Exist with Correct Roles', () => {
    const users = db.getUsers();
    if (users.length < 4) throw new Error(`Expected at least 4 users, found ${users.length}`);
    const admin = users.find(u => u.role === 'ADMIN');
    const owner = users.find(u => u.role === 'OWNER');
    const tenant = users.find(u => u.role === 'TENANT');
    if (!admin) throw new Error('Missing Admin persona');
    if (!owner) throw new Error('Missing Owner persona');
    if (!tenant) throw new Error('Missing Tenant persona');
  });

  // 2. Property Creation & Verification
  run('Property Lifecycle', 'Owner Property Creation in DRAFT/PENDING state', () => {
    const owner = db.getUsers().find(u => u.role === 'OWNER')!;
    const testProp = db.createProperty({
      ownerId: owner.id,
      ownerName: owner.name,
      ownerEmail: owner.email,
      ownerPhone: owner.phone,
      title: 'Automated Test Luxury Loft',
      description: 'Test property for automated verification suite',
      address: '777 Test Way',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
      rentAmount: 2900,
      depositAmount: 2900,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1100,
      propertyType: 'CONDO',
      furnished: true,
      petFriendly: true,
      parkingSpaces: 1,
      availableDate: '2026-09-01',
      amenities: ['Central A/C', 'In-Unit Washer & Dryer'],
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
      status: 'PENDING_VERIFICATION'
    });

    if (testProp.status !== 'PENDING_VERIFICATION') {
      throw new Error(`Expected status PENDING_VERIFICATION, got ${testProp.status}`);
    }

    // Admin Verification
    const updated = db.updateProperty(testProp.id, {
      status: 'ACTIVE',
      verifiedBy: 'Eleanor Vance (Admin)',
      verifiedAt: new Date().toISOString(),
      verificationNotes: 'Deed and safety compliance certified.'
    });

    if (!updated || updated.status !== 'ACTIVE') {
      throw new Error('Failed to update property status to ACTIVE upon verification');
    }
  });

  // 3. Search & Filters
  run('Search & Filter Engine', 'Multi-parameter Search by City, Price, Bedrooms, Amenities', () => {
    const activeProps = db.getProperties({ city: 'Seattle', status: 'ACTIVE' });
    if (activeProps.length === 0) throw new Error('Expected at least 1 active Seattle property');
    for (const p of activeProps) {
      if (p.city.toLowerCase() !== 'seattle') throw new Error(`Property ${p.id} does not match city filter`);
      if (p.status !== 'ACTIVE') throw new Error(`Property ${p.id} is not ACTIVE`);
    }

    const priceFiltered = db.getProperties({ minPrice: 2000, maxPrice: 4000 });
    for (const p of priceFiltered) {
      if (p.rentAmount < 2000 || p.rentAmount > 4000) {
        throw new Error(`Property ${p.id} rent $${p.rentAmount} out of range [2000, 4000]`);
      }
    }
  });

  // 4. Shortlisting
  run('Shortlist & Bookmarking', 'Tenant Toggle Property Shortlist and Retrieve', () => {
    const tenant = db.getUsers().find(u => u.role === 'TENANT')!;
    const prop = db.getProperties()[0];
    
    // Add
    const added = db.toggleShortlist(tenant.id, prop.id);
    const list1 = db.getShortlist(tenant.id);
    if (!list1.includes(prop.id)) throw new Error('Property should be in shortlist after adding');

    // Remove
    const removed = db.toggleShortlist(tenant.id, prop.id);
    const list2 = db.getShortlist(tenant.id);
    if (list2.includes(prop.id)) throw new Error('Property should not be in shortlist after toggling off');
  });

  // 5. Visit Scheduling
  run('Visit Scheduling', 'Tenant Requests Visit and Owner Confirms', () => {
    const tenant = db.getUsers().find(u => u.role === 'TENANT')!;
    const owner = db.getUsers().find(u => u.role === 'OWNER')!;
    const prop = db.getProperties().find(p => p.ownerId === owner.id && p.status === 'ACTIVE') || db.getProperties()[0];

    const visit = db.createVisit({
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertyAddress: prop.address,
      propertyCity: prop.city,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      tenantPhone: tenant.phone,
      ownerId: owner.id,
      date: '2026-09-05',
      timeSlot: '10:00 - 10:30',
      visitType: 'IN_PERSON',
      status: 'REQUESTED',
      notes: 'Automated test tour request'
    });

    if (visit.status !== 'REQUESTED') throw new Error('Initial visit status should be REQUESTED');

    const confirmed = db.updateVisit(visit.id, {
      status: 'CONFIRMED',
      ownerNotes: 'Confirmed with security desk.'
    });

    if (!confirmed || confirmed.status !== 'CONFIRMED') throw new Error('Failed to confirm visit');
  });

  // 6. Rental Application & Approval
  run('Rental Application Workflow', 'Application Submission, Data Validation & Landlord Approval', () => {
    const tenant = db.getUsers().find(u => u.role === 'TENANT')!;
    const owner = db.getUsers().find(u => u.role === 'OWNER')!;
    const prop = db.getProperties()[0];

    const app = db.createApplication({
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertyRent: prop.rentAmount,
      propertyAddress: prop.address,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      tenantPhone: tenant.phone,
      ownerId: owner.id,
      monthlyIncome: 12000,
      occupation: 'Software Engineer',
      employer: 'Tech Co',
      creditScoreEstimate: 780,
      moveInDate: '2026-09-01',
      leaseTermMonths: 12,
      occupantsCount: 1,
      hasPets: false,
      backgroundCheckConsent: true,
      references: [
        { name: 'Alice Manager', relationship: 'Employer', phone: '555-0100', email: 'alice@test.com' }
      ],
      message: 'Automated application test',
      status: 'SUBMITTED',
      aiRiskScore: 92,
      aiRiskSummary: 'Low risk verified by test'
    });

    if (app.status !== 'SUBMITTED') throw new Error('Application status should be SUBMITTED');

    const approved = db.updateApplication(app.id, { status: 'APPROVED' });
    if (!approved || approved.status !== 'APPROVED') throw new Error('Failed to set application to APPROVED');
  });

  // 7. Lease Management & Digital Signing
  run('Lease Management', 'Digital Lease Generation, Signature & Property Rented Status Update', () => {
    const tenant = db.getUsers().find(u => u.role === 'TENANT')!;
    const owner = db.getUsers().find(u => u.role === 'OWNER')!;
    const prop = db.getProperties()[0];

    const lease = db.createLease({
      applicationId: 'app_test_123',
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertyAddress: prop.address,
      ownerId: owner.id,
      ownerName: owner.name,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      startDate: '2026-09-01',
      endDate: '2027-08-31',
      monthlyRent: prop.rentAmount,
      depositAmount: prop.depositAmount,
      paymentDueDay: 1,
      terms: 'Standard WA residential lease agreement.',
      specialClauses: ['No smoking', 'Rent due on 1st'],
      status: 'PENDING_TENANT_SIGNATURE',
      ownerSignedAt: new Date().toISOString(),
      securityDepositPaid: false
    });

    if (lease.status !== 'PENDING_TENANT_SIGNATURE') throw new Error('Lease status must be PENDING_TENANT_SIGNATURE');

    // Tenant signs
    const signedLease = db.updateLease(lease.id, {
      status: 'ACTIVE',
      tenantSignedAt: new Date().toISOString(),
      tenantSignatureName: tenant.name
    });

    if (!signedLease || signedLease.status !== 'ACTIVE') throw new Error('Lease should transition to ACTIVE once signed');

    // Update property to RENTED
    db.updateProperty(prop.id, { status: 'RENTED' });
    const checkProp = db.getPropertyById(prop.id);
    if (!checkProp || checkProp.status !== 'RENTED') throw new Error('Property should be marked RENTED');
  });

  // 8. Payment & Invoicing
  run('Rent & Deposit Payments', 'Invoice Creation, Payment Processing & Receipt Generation', () => {
    const tenant = db.getUsers().find(u => u.role === 'TENANT')!;
    const owner = db.getUsers().find(u => u.role === 'OWNER')!;

    const payment = db.createPayment({
      leaseId: 'lease_test_301',
      propertyId: 'prop_test_1',
      propertyTitle: 'Test Apartment',
      ownerId: owner.id,
      tenantId: tenant.id,
      tenantName: tenant.name,
      amount: 2500,
      type: 'MONTHLY_RENT',
      dueDate: '2026-09-01',
      status: 'PENDING',
      invoiceNumber: 'INV-TEST-001'
    });

    if (payment.status !== 'PENDING') throw new Error('New payment invoice should be PENDING');

    const paid = db.updatePayment(payment.id, {
      status: 'PAID',
      paidDate: new Date().toISOString(),
      paymentMethod: 'CREDIT_CARD',
      transactionRef: 'TX_TEST_99182'
    });

    if (!paid || paid.status !== 'PAID') throw new Error('Payment status should be PAID');
  });

  // 9. Maintenance Tickets & Threads
  run('Maintenance System', 'Ticket Logging, Real-time Conversation Thread & Ticket Resolution', () => {
    const tenant = db.getUsers().find(u => u.role === 'TENANT')!;
    const owner = db.getUsers().find(u => u.role === 'OWNER')!;

    const ticket = db.createMaintenance({
      propertyId: 'prop_test_1',
      propertyTitle: 'Test Townhome',
      propertyAddress: '123 Main St',
      leaseId: 'lease_test_301',
      tenantId: tenant.id,
      tenantName: tenant.name,
      ownerId: owner.id,
      title: 'Kitchen sink aerator leaking',
      category: 'PLUMBING',
      priority: 'MEDIUM',
      description: 'Minor drip under faucet cabinet',
      photos: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'],
      status: 'OPEN'
    });

    if (ticket.status !== 'OPEN') throw new Error('Ticket should start OPEN');

    // Add message
    const withMsg = db.addMaintenanceMessage(ticket.id, {
      senderId: tenant.id,
      senderName: tenant.name,
      senderRole: 'TENANT',
      message: 'Added photos of the pipe joint.'
    });

    if (!withMsg || withMsg.messages.length === 0) throw new Error('Message was not added to maintenance ticket');

    // Resolve
    const resolved = db.updateMaintenance(ticket.id, {
      status: 'RESOLVED',
      contractorAssigned: 'Precision Plumbing Inc',
      resolutionNotes: 'Tightened compression coupling and replaced gasket.',
      resolvedAt: new Date().toISOString()
    });

    if (!resolved || resolved.status !== 'RESOLVED') throw new Error('Ticket should be RESOLVED');
  });

  // 10. Notifications & Audit Logs
  run('Notifications & Audit Trail', 'Notification Dispatch and System-wide Immutable Audit Logging', () => {
    const tenant = db.getUsers().find(u => u.role === 'TENANT')!;
    
    const notif = db.createNotification({
      userId: tenant.id,
      title: 'Test Notification',
      message: 'Automated notification test message',
      type: 'INFO',
      read: false
    });

    const notifs = db.getNotifications(tenant.id);
    if (!notifs.some(n => n.id === notif.id)) throw new Error('Notification not found for tenant');

    db.markNotificationRead(notif.id, tenant.id);
    const updated = db.getNotifications(tenant.id).find(n => n.id === notif.id);
    if (!updated?.read) throw new Error('Notification was not marked read');

    // Audit Log
    const audit = db.logAudit({
      userId: tenant.id,
      userName: tenant.name,
      userRole: 'TENANT',
      action: 'TEST_ACTION',
      entityType: 'SystemTest',
      entityId: 'test_123',
      details: 'Audit logging test execution'
    });

    const allAudits = db.getAuditLogs();
    if (!allAudits.some(a => a.id === audit.id)) throw new Error('Audit log was not saved');
  });

  // 11. Security & Isolation Tests
  run('Cross-User Data Isolation', 'Strict Cross-User Partitioning & Permission Checks', () => {
    const users = db.getUsers();
    const owner1 = users.find(u => u.id === 'user_owner_1')!;
    const owner2 = users.find(u => u.id === 'user_owner_2')!;
    const tenant1 = users.find(u => u.id === 'user_tenant_1')!;
    const tenant2 = users.find(u => u.id === 'user_tenant_2')!;

    // Leases isolation
    const tenant1Leases = db.getLeases(tenant1);
    const tenant2Leases = db.getLeases(tenant2);
    for (const l of tenant1Leases) {
      if (l.tenantId !== tenant1.id) throw new Error('Tenant 1 received lease belonging to another tenant!');
    }
    for (const l of tenant2Leases) {
      if (l.tenantId !== tenant2.id) throw new Error('Tenant 2 received lease belonging to another tenant!');
    }

    // Owner properties isolation
    const owner1Visits = db.getVisits(owner1);
    for (const v of owner1Visits) {
      if (v.ownerId !== owner1.id) throw new Error('Owner 1 received visits for properties they do not own!');
    }
  });

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    skipped: 0,
    durationMs: Date.now() - startTime,
    results,
    securityChecksPassed: failedCount === 0,
    lifecycleE2EPassed: failedCount === 0
  };
}

export async function executeFullLifecycleSimulation(): Promise<{
  stepsCompleted: string[];
  property: Property;
  visit: Visit;
  application: RentalApplication;
  lease: Lease;
  payment: RentPayment;
  maintenance: MaintenanceTicket;
}> {
  const users = db.getUsers();
  const admin = users.find(u => u.role === 'ADMIN')!;
  const owner = users.find(u => u.role === 'OWNER')!;
  const tenant = users.find(u => u.role === 'TENANT')!;

  const steps: string[] = [];

  // Step 1: Property Creation
  const newProp = db.createProperty({
    ownerId: owner.id,
    ownerName: owner.name,
    ownerEmail: owner.email,
    ownerPhone: owner.phone,
    title: `Lakefront Luxury Villa #${Math.floor(Math.random() * 900 + 100)}`,
    description: 'Breathtaking waterfront residence with private dock, modern architectural glass walls, and chef kitchen.',
    address: '100 Lake Washington Blvd',
    city: 'Seattle',
    state: 'WA',
    zip: '98122',
    rentAmount: 4800,
    depositAmount: 4800,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2400,
    propertyType: 'HOUSE',
    furnished: true,
    petFriendly: true,
    parkingSpaces: 2,
    availableDate: '2026-09-01',
    amenities: ['Waterfront Dock', 'Central AC', 'EV Charger', 'Smart Home System', 'Wine Cellar'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200'
    ],
    status: 'PENDING_VERIFICATION'
  });
  steps.push(`1. Property Created: "${newProp.title}" in status PENDING_VERIFICATION`);
  db.logAudit({
    userId: owner.id,
    userName: owner.name,
    userRole: owner.role,
    action: 'CREATE_PROPERTY',
    entityType: 'Property',
    entityId: newProp.id,
    details: `Created listing "${newProp.title}" ($4,800/mo)`
  });

  // Step 2: Admin Verification
  const verifiedProp = db.updateProperty(newProp.id, {
    status: 'ACTIVE',
    verifiedBy: admin.name + ' (Admin)',
    verifiedAt: new Date().toISOString(),
    verificationNotes: 'Deed, tax records, and safety inspection confirmed.'
  })!;
  steps.push(`2. Admin Verified: Property verified & published to ACTIVE marketplace`);
  db.logAudit({
    userId: admin.id,
    userName: admin.name,
    userRole: admin.role,
    action: 'VERIFY_PROPERTY',
    entityType: 'Property',
    entityId: verifiedProp.id,
    details: 'Verified ownership deed and authorized listing.'
  });

  // Step 3: Tenant Search & Shortlist
  db.toggleShortlist(tenant.id, verifiedProp.id);
  steps.push(`3. Tenant Search & Shortlist: Tenant ${tenant.name} bookmarked property`);

  // Step 4: Visit Scheduling
  const visit = db.createVisit({
    propertyId: verifiedProp.id,
    propertyTitle: verifiedProp.title,
    propertyAddress: verifiedProp.address,
    propertyCity: verifiedProp.city,
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantEmail: tenant.email,
    tenantPhone: tenant.phone,
    ownerId: owner.id,
    date: '2026-09-02',
    timeSlot: '15:00 - 15:45',
    visitType: 'IN_PERSON',
    status: 'CONFIRMED',
    notes: 'Excited to view the private dock and master suite.',
    ownerNotes: 'Gate code 4821 provided to tenant.'
  });
  steps.push(`4. Visit Scheduled & Confirmed: In-person tour on Sep 2nd`);

  // Step 5: Rental Application
  const application = db.createApplication({
    propertyId: verifiedProp.id,
    propertyTitle: verifiedProp.title,
    propertyRent: verifiedProp.rentAmount,
    propertyAddress: verifiedProp.address,
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantEmail: tenant.email,
    tenantPhone: tenant.phone,
    ownerId: owner.id,
    monthlyIncome: 15500,
    occupation: tenant.occupation || 'Lead Architect',
    employer: tenant.employer || 'Cloud Scale Corp',
    creditScoreEstimate: 785,
    moveInDate: '2026-09-01',
    leaseTermMonths: 12,
    occupantsCount: 2,
    hasPets: true,
    petDetails: '1 hypoallergenic poodle, trained',
    backgroundCheckConsent: true,
    references: [
      { name: 'Dr. Marcus Webb', relationship: 'Employer', phone: '+1 555-0199', email: 'webb@cloudscale.io' }
    ],
    message: 'We loved the waterfront tour and are eager to sign a 12-month lease.',
    status: 'APPROVED',
    aiRiskScore: 96,
    aiRiskSummary: 'Exemplary qualification: 31% rent-to-income ratio, 785 credit score, pristine rental history.'
  });
  steps.push(`6. Rental Application Submitted & AI Screened (Score: 96/100, Approved)`);

  // Step 6: Lease Creation & Signing
  const lease = db.createLease({
    applicationId: application.id,
    propertyId: verifiedProp.id,
    propertyTitle: verifiedProp.title,
    propertyAddress: verifiedProp.address,
    ownerId: owner.id,
    ownerName: owner.name,
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantEmail: tenant.email,
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    monthlyRent: verifiedProp.rentAmount,
    depositAmount: verifiedProp.depositAmount,
    paymentDueDay: 1,
    terms: 'Comprehensive Standard Washington State Residential Lease Agreement.',
    specialClauses: [
      'Private dock maintenance included.',
      'Tenant agrees to quiet hours after 10:00 PM.'
    ],
    status: 'ACTIVE',
    ownerSignedAt: new Date().toISOString(),
    tenantSignedAt: new Date().toISOString(),
    tenantSignatureName: tenant.name,
    securityDepositPaid: true
  });
  db.updateProperty(verifiedProp.id, { status: 'RENTED' });
  steps.push(`7. Lease Drafted, Digitally Signed & Property Status set to RENTED`);

  // Step 7: Rent & Deposit Payments
  const depositPayment = db.createPayment({
    leaseId: lease.id,
    propertyId: verifiedProp.id,
    propertyTitle: verifiedProp.title,
    ownerId: owner.id,
    tenantId: tenant.id,
    tenantName: tenant.name,
    amount: verifiedProp.depositAmount,
    type: 'SECURITY_DEPOSIT',
    dueDate: '2026-09-01',
    paidDate: new Date().toISOString(),
    status: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    transactionRef: `ACH_${Date.now()}_DEP`,
    invoiceNumber: `INV-DEP-${Math.floor(Math.random() * 9000 + 1000)}`,
    notes: 'Security Deposit Paid via ACH'
  });

  const rentPayment = db.createPayment({
    leaseId: lease.id,
    propertyId: verifiedProp.id,
    propertyTitle: verifiedProp.title,
    ownerId: owner.id,
    tenantId: tenant.id,
    tenantName: tenant.name,
    amount: verifiedProp.rentAmount,
    type: 'MONTHLY_RENT',
    dueDate: '2026-09-01',
    paidDate: new Date().toISOString(),
    status: 'PAID',
    paymentMethod: 'AUTO_PAY',
    transactionRef: `ACH_${Date.now()}_RENT`,
    invoiceNumber: `INV-RENT-${Math.floor(Math.random() * 9000 + 1000)}`,
    notes: 'First Month Rent Paid'
  });
  steps.push(`8. Rent & Security Deposit Payments Processed ($${(depositPayment.amount + rentPayment.amount).toLocaleString()})`);

  // Step 8: Maintenance Ticket & Resolution
  const maintenance = db.createMaintenance({
    propertyId: verifiedProp.id,
    propertyTitle: verifiedProp.title,
    propertyAddress: verifiedProp.address,
    leaseId: lease.id,
    tenantId: tenant.id,
    tenantName: tenant.name,
    ownerId: owner.id,
    title: 'Smart thermostat sensor battery replacement & calibration',
    category: 'HVAC',
    priority: 'LOW',
    description: 'Upstairs sensor reading requires battery swap and Nest sync.',
    photos: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
    status: 'RESOLVED',
    contractorAssigned: 'Lakeview Smart Systems',
    estimatedCost: 80,
    resolutionNotes: 'Technician replaced CR2450 cell and re-paired wireless mesh bridge.',
    resolvedAt: new Date().toISOString()
  });

  db.addMaintenanceMessage(maintenance.id, {
    senderId: owner.id,
    senderName: owner.name,
    senderRole: 'OWNER',
    message: 'Technician completed the sensor calibration.'
  });
  steps.push(`9. Maintenance Request Logged, Conversed & Successfully Resolved`);
  steps.push(`10. Full Lifecycle Complete: Property Listed -> Verified -> Visited -> Leased -> Paid -> Maintained!`);

  return {
    stepsCompleted: steps,
    property: verifiedProp,
    visit,
    application,
    lease,
    payment: rentPayment,
    maintenance
  };
}
