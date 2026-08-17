import express, { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { User, UserRole, Property, Visit, RentalApplication, Lease, RentPayment, MaintenanceTicket } from './types';
import { generatePropertyDescription, analyzeTenantApplication } from './gemini';
import { runAllTests, executeFullLifecycleSimulation } from './tests';

export const apiRouter = express.Router();

// Middleware: Authenticate user from header or fallback
let activeUserId: string = 'user_owner_1'; // default active persona for immediate exploration

apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser && db.getUserById(headerUser)) {
    (req as any).currentUser = db.getUserById(headerUser);
  } else {
    (req as any).currentUser = db.getUserById(activeUserId) || db.getUsers()[0];
  }
  next();
});

const getCurrentUser = (req: Request): User => {
  return (req as any).currentUser;
};

// ==========================================
// 1. AUTH & PERSONAS
// ==========================================

apiRouter.get('/auth/current-user', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  res.json({ success: true, user });
});

apiRouter.get('/auth/users', (req: Request, res: Response) => {
  const users = db.getUsers();
  res.json({ success: true, users, activeUserId });
});

apiRouter.post('/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User persona not found' });
  }
  activeUserId = user.id;
  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'SWITCH_PERSONA',
    entityType: 'User',
    entityId: user.id,
    details: `Active user context switched to ${user.name} (${user.role})`
  });
  res.json({ success: true, user });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, role, phone, bio, monthlyIncome, creditScore, employer, occupation } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, error: 'Name, email, and role are required' });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, error: 'User with this email already exists' });
  }
  const newUser = db.createUser({
    name,
    email,
    role: role as UserRole,
    phone: phone || '+1 (555) 000-0000',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    bio: bio || '',
    monthlyIncome: monthlyIncome ? Number(monthlyIncome) : undefined,
    creditScore: creditScore ? Number(creditScore) : undefined,
    employer,
    occupation,
    status: 'ACTIVE'
  });
  activeUserId = newUser.id;
  res.status(201).json({ success: true, user: newUser });
});

// ==========================================
// 2. PROPERTIES & VERIFICATION
// ==========================================

apiRouter.get('/properties', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { search, city, propertyType, minPrice, maxPrice, bedrooms, bathrooms, petFriendly, furnished, status, ownerId } = req.query;

  const properties = db.getProperties({
    search: search as string,
    city: city as string,
    propertyType: propertyType as string,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    bathrooms: bathrooms ? Number(bathrooms) : undefined,
    petFriendly: petFriendly === 'true',
    furnished: furnished === 'true',
    status: status as string,
    ownerId: ownerId as string,
    viewerRole: user?.role,
    viewerId: user?.id
  });

  res.json({ success: true, properties });
});

apiRouter.get('/properties/:id', (req: Request, res: Response) => {
  const prop = db.getPropertyById(req.params.id);
  if (!prop) {
    return res.status(404).json({ success: false, error: 'Property not found' });
  }
  res.json({ success: true, property: prop });
});

apiRouter.post('/properties', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Only Property Owners or Admins can list properties' });
  }

  const {
    title, description, address, city, state, zip, rentAmount, depositAmount,
    bedrooms, bathrooms, squareFeet, propertyType, furnished, petFriendly,
    parkingSpaces, availableDate, amenities, images, submitForVerification
  } = req.body;

  if (!title || !address || !city || !rentAmount) {
    return res.status(400).json({ success: false, error: 'Title, address, city, and rent amount are required' });
  }

  const defaultImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200'
  ];

  const initialStatus = submitForVerification ? 'PENDING_VERIFICATION' : 'DRAFT';

  const newProperty = db.createProperty({
    ownerId: user.id,
    ownerName: user.name,
    ownerEmail: user.email,
    ownerPhone: user.phone,
    title,
    description: description || 'Beautiful rental property.',
    address,
    city,
    state: state || 'WA',
    zip: zip || '98101',
    rentAmount: Number(rentAmount),
    depositAmount: depositAmount ? Number(depositAmount) : Number(rentAmount),
    bedrooms: Number(bedrooms) || 1,
    bathrooms: Number(bathrooms) || 1,
    squareFeet: Number(squareFeet) || 750,
    propertyType: propertyType || 'APARTMENT',
    furnished: Boolean(furnished),
    petFriendly: Boolean(petFriendly),
    parkingSpaces: Number(parkingSpaces) || 0,
    availableDate: availableDate || new Date().toISOString().split('T')[0],
    amenities: Array.isArray(amenities) ? amenities : ['In-Unit Laundry'],
    images: defaultImages,
    status: initialStatus
  });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CREATE_PROPERTY',
    entityType: 'Property',
    entityId: newProperty.id,
    details: `Created property "${title}" in status ${initialStatus}`
  });

  if (initialStatus === 'PENDING_VERIFICATION') {
    // Notify admins
    const admins = db.getUsers().filter(u => u.role === 'ADMIN');
    admins.forEach(admin => {
      db.createNotification({
        userId: admin.id,
        title: 'New Listing Pending Verification',
        message: `${user.name} submitted "${title}" for platform verification.`,
        type: 'ACTION_REQUIRED',
        link: '/admin/verifications',
        read: false
      });
    });
  }

  res.status(201).json({ success: true, property: newProperty });
});

apiRouter.put('/properties/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const prop = db.getPropertyById(req.params.id);
  if (!prop) {
    return res.status(404).json({ success: false, error: 'Property not found' });
  }

  // Security isolation check
  if (user.role !== 'ADMIN' && prop.ownerId !== user.id) {
    return res.status(403).json({ success: false, error: 'You are not authorized to edit this property' });
  }

  const updated = db.updateProperty(prop.id, req.body);
  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'UPDATE_PROPERTY',
    entityType: 'Property',
    entityId: prop.id,
    details: `Updated listing "${prop.title}" details`
  });

  res.json({ success: true, property: updated });
});

apiRouter.post('/properties/:id/submit-verification', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const prop = db.getPropertyById(req.params.id);
  if (!prop) return res.status(404).json({ success: false, error: 'Property not found' });

  if (user.role !== 'ADMIN' && prop.ownerId !== user.id) {
    return res.status(403).json({ success: false, error: 'Unauthorized to submit this property' });
  }

  const updated = db.updateProperty(prop.id, {
    status: 'PENDING_VERIFICATION'
  });

  // Notify Admins
  const admins = db.getUsers().filter(u => u.role === 'ADMIN');
  admins.forEach(admin => {
    db.createNotification({
      userId: admin.id,
      title: 'Verification Request',
      message: `Property "${prop.title}" submitted by ${user.name} for verification review.`,
      type: 'ACTION_REQUIRED',
      read: false
    });
  });

  res.json({ success: true, property: updated });
});

apiRouter.post('/properties/:id/verify', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Only Platform Administrators can verify properties' });
  }

  const { approved, notes, rejectionReason } = req.body;
  const prop = db.getPropertyById(req.params.id);
  if (!prop) return res.status(404).json({ success: false, error: 'Property not found' });

  const newStatus = approved ? 'ACTIVE' : 'REJECTED';
  const updated = db.updateProperty(prop.id, {
    status: newStatus,
    verifiedBy: `${user.name} (Admin)`,
    verifiedAt: new Date().toISOString(),
    verificationNotes: notes || 'Verified compliance with municipal codes and deed registry.',
    rejectionReason: approved ? undefined : rejectionReason
  });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: approved ? 'VERIFY_PROPERTY_APPROVED' : 'VERIFY_PROPERTY_REJECTED',
    entityType: 'Property',
    entityId: prop.id,
    details: approved 
      ? `Verified property "${prop.title}" and published to ACTIVE marketplace`
      : `Rejected property "${prop.title}". Reason: ${rejectionReason || 'Non-compliant documents'}`
  });

  // Notify Owner
  db.createNotification({
    userId: prop.ownerId,
    title: approved ? 'Property Verified & Live!' : 'Verification Update Required',
    message: approved
      ? `Great news! "${prop.title}" is now verified and active for tenant applications.`
      : `Your listing "${prop.title}" was not approved: ${rejectionReason || notes}`,
    type: approved ? 'SUCCESS' : 'WARNING',
    read: false
  });

  res.json({ success: true, property: updated });
});

apiRouter.delete('/properties/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const prop = db.getPropertyById(req.params.id);
  if (!prop) return res.status(404).json({ success: false, error: 'Property not found' });

  if (user.role !== 'ADMIN' && prop.ownerId !== user.id) {
    return res.status(403).json({ success: false, error: 'Unauthorized to delete this property' });
  }

  db.deleteProperty(prop.id);
  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'DELETE_PROPERTY',
    entityType: 'Property',
    entityId: prop.id,
    details: `Deleted property "${prop.title}"`
  });

  res.json({ success: true, message: 'Property deleted successfully' });
});

apiRouter.post('/properties/ai-generate-description', async (req: Request, res: Response) => {
  try {
    const { title, propertyType, city, bedrooms, bathrooms, amenities, rentAmount } = req.body;
    const result = await generatePropertyDescription({
      title: title || 'Luxury Rental',
      propertyType: propertyType || 'Apartment',
      city: city || 'Seattle',
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      amenities: Array.isArray(amenities) ? amenities : ['Balcony', 'In-Unit Laundry'],
      rentAmount: Number(rentAmount) || 2000
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'AI generation failed' });
  }
});

// ==========================================
// 3. SHORTLIST
// ==========================================

apiRouter.get('/shortlist', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const ids = db.getShortlist(user.id);
  const properties = ids.map(id => db.getPropertyById(id)).filter(Boolean);
  res.json({ success: true, shortlistIds: ids, properties });
});

apiRouter.post('/shortlist/toggle', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { propertyId } = req.body;
  if (!propertyId) return res.status(400).json({ success: false, error: 'Property ID required' });

  const added = db.toggleShortlist(user.id, propertyId);
  const updatedIds = db.getShortlist(user.id);
  res.json({ success: true, added, shortlistIds: updatedIds });
});

// ==========================================
// 4. VISITS & TOURS
// ==========================================

apiRouter.get('/visits', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const visits = db.getVisits(user);
  res.json({ success: true, visits });
});

apiRouter.post('/visits', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { propertyId, date, timeSlot, visitType, notes } = req.body;

  const prop = db.getPropertyById(propertyId);
  if (!prop) return res.status(404).json({ success: false, error: 'Property not found' });

  const newVisit = db.createVisit({
    propertyId: prop.id,
    propertyTitle: prop.title,
    propertyAddress: prop.address,
    propertyCity: prop.city,
    tenantId: user.id,
    tenantName: user.name,
    tenantEmail: user.email,
    tenantPhone: user.phone,
    ownerId: prop.ownerId,
    date,
    timeSlot,
    visitType: visitType || 'IN_PERSON',
    status: 'REQUESTED',
    notes
  });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'REQUEST_VISIT',
    entityType: 'Visit',
    entityId: newVisit.id,
    details: `Requested ${visitType} tour for "${prop.title}" on ${date} at ${timeSlot}`
  });

  // Notify Owner
  db.createNotification({
    userId: prop.ownerId,
    title: 'New Tour Requested',
    message: `${user.name} requested a ${visitType.toLowerCase().replace('_', ' ')} visit for "${prop.title}" on ${date}.`,
    type: 'ACTION_REQUIRED',
    link: '/visits',
    read: false
  });

  res.status(201).json({ success: true, visit: newVisit });
});

apiRouter.patch('/visits/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const visit = db.getVisitById(req.params.id);
  if (!visit) return res.status(404).json({ success: false, error: 'Visit not found' });

  // Cross-user permission check
  if (user.role !== 'ADMIN' && user.id !== visit.ownerId && user.id !== visit.tenantId) {
    return res.status(403).json({ success: false, error: 'Unauthorized to update this visit' });
  }

  const { status, ownerNotes, date, timeSlot } = req.body;
  const updated = db.updateVisit(visit.id, {
    status: status || visit.status,
    ownerNotes: ownerNotes !== undefined ? ownerNotes : visit.ownerNotes,
    date: date || visit.date,
    timeSlot: timeSlot || visit.timeSlot
  });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'UPDATE_VISIT_STATUS',
    entityType: 'Visit',
    entityId: visit.id,
    details: `Updated visit status to ${status || visit.status}`
  });

  // Notify counterparty
  const recipientId = user.id === visit.ownerId ? visit.tenantId : visit.ownerId;
  db.createNotification({
    userId: recipientId,
    title: `Visit Status: ${status}`,
    message: `${user.name} updated the visit request for "${visit.propertyTitle}" to ${status}.`,
    type: status === 'CONFIRMED' ? 'SUCCESS' : 'INFO',
    read: false
  });

  res.json({ success: true, visit: updated });
});

// ==========================================
// 5. RENTAL APPLICATIONS & AI SCREENING
// ==========================================

apiRouter.get('/applications', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const applications = db.getApplications(user);
  res.json({ success: true, applications });
});

apiRouter.get('/applications/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const app = db.getApplicationById(req.params.id);
  if (!app) return res.status(404).json({ success: false, error: 'Application not found' });

  if (user.role !== 'ADMIN' && user.id !== app.ownerId && user.id !== app.tenantId) {
    return res.status(403).json({ success: false, error: 'Unauthorized access to application' });
  }

  res.json({ success: true, application: app });
});

apiRouter.post('/applications', async (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const {
    propertyId, monthlyIncome, occupation, employer, creditScoreEstimate,
    moveInDate, leaseTermMonths, occupantsCount, hasPets, petDetails,
    references, message, backgroundCheckConsent
  } = req.body;

  const prop = db.getPropertyById(propertyId);
  if (!prop) return res.status(404).json({ success: false, error: 'Property not found' });

  // AI Screening Analysis
  let aiRiskScore = 90;
  let aiRiskSummary = 'Application passed initial underwriting filters.';
  try {
    const analysis = await analyzeTenantApplication({
      monthlyIncome: Number(monthlyIncome),
      propertyRent: prop.rentAmount,
      creditScore: Number(creditScoreEstimate) || 720,
      occupation: occupation || 'Professional',
      employer: employer || 'Verified Enterprise',
      hasPets: Boolean(hasPets),
      occupantsCount: Number(occupantsCount) || 1
    });
    aiRiskScore = analysis.score;
    aiRiskSummary = analysis.summary;
  } catch (err) {
    console.error('AI screening error:', err);
  }

  const newApp = db.createApplication({
    propertyId: prop.id,
    propertyTitle: prop.title,
    propertyRent: prop.rentAmount,
    propertyAddress: prop.address,
    tenantId: user.id,
    tenantName: user.name,
    tenantEmail: user.email,
    tenantPhone: user.phone,
    ownerId: prop.ownerId,
    monthlyIncome: Number(monthlyIncome),
    occupation: occupation || 'Professional',
    employer: employer || 'Self-Employed',
    creditScoreEstimate: Number(creditScoreEstimate) || 720,
    moveInDate: moveInDate || '2026-09-01',
    leaseTermMonths: Number(leaseTermMonths) || 12,
    occupantsCount: Number(occupantsCount) || 1,
    hasPets: Boolean(hasPets),
    petDetails,
    backgroundCheckConsent: Boolean(backgroundCheckConsent),
    references: Array.isArray(references) ? references : [],
    message,
    status: 'SUBMITTED',
    aiRiskScore,
    aiRiskSummary
  });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'SUBMIT_APPLICATION',
    entityType: 'RentalApplication',
    entityId: newApp.id,
    details: `Submitted rental application for "${prop.title}" ($${prop.rentAmount}/mo)`
  });

  // Notify Owner
  db.createNotification({
    userId: prop.ownerId,
    title: 'New Rental Application Received',
    message: `${user.name} submitted an application for "${prop.title}" (AI Underwriting Score: ${aiRiskScore}/100).`,
    type: 'ACTION_REQUIRED',
    link: '/applications',
    read: false
  });

  res.status(201).json({ success: true, application: newApp });
});

apiRouter.patch('/applications/:id/status', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const app = db.getApplicationById(req.params.id);
  if (!app) return res.status(404).json({ success: false, error: 'Application not found' });

  if (user.role !== 'ADMIN' && user.id !== app.ownerId) {
    return res.status(403).json({ success: false, error: 'Only the property owner or admin can update application status' });
  }

  const { status, rejectionReason } = req.body;
  const updated = db.updateApplication(app.id, {
    status,
    rejectionReason
  });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: `APPLICATION_${status}`,
    entityType: 'RentalApplication',
    entityId: app.id,
    details: `Application status changed to ${status}${rejectionReason ? ` (${rejectionReason})` : ''}`
  });

  // Notify Tenant
  db.createNotification({
    userId: app.tenantId,
    title: status === 'APPROVED' ? 'Application Approved! 🎉' : `Application Update: ${status}`,
    message: status === 'APPROVED' 
      ? `Congratulations! Your application for "${app.propertyTitle}" was approved. A lease agreement proposal is incoming.`
      : `Update on "${app.propertyTitle}": Status is now ${status}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
    type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'WARNING' : 'INFO',
    read: false
  });

  res.json({ success: true, application: updated });
});

// ==========================================
// 6. LEASE MANAGEMENT
// ==========================================

apiRouter.get('/leases', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const leases = db.getLeases(user);
  res.json({ success: true, leases });
});

apiRouter.get('/leases/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const lease = db.getLeaseById(req.params.id);
  if (!lease) return res.status(404).json({ success: false, error: 'Lease not found' });

  if (user.role !== 'ADMIN' && user.id !== lease.ownerId && user.id !== lease.tenantId) {
    return res.status(403).json({ success: false, error: 'Unauthorized to view this lease' });
  }

  res.json({ success: true, lease });
});

apiRouter.post('/leases', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Only owners or admins can draft a lease agreement' });
  }

  const {
    applicationId, propertyId, tenantId, startDate, endDate,
    monthlyRent, depositAmount, paymentDueDay, terms, specialClauses
  } = req.body;

  const prop = db.getPropertyById(propertyId);
  const tenant = db.getUserById(tenantId);
  if (!prop || !tenant) return res.status(400).json({ success: false, error: 'Invalid property or tenant' });

  const newLease = db.createLease({
    applicationId: applicationId || `app_${Date.now()}`,
    propertyId: prop.id,
    propertyTitle: prop.title,
    propertyAddress: prop.address,
    ownerId: user.id,
    ownerName: user.name,
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantEmail: tenant.email,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '2027-08-31',
    monthlyRent: Number(monthlyRent) || prop.rentAmount,
    depositAmount: Number(depositAmount) || prop.depositAmount,
    paymentDueDay: Number(paymentDueDay) || 1,
    terms: terms || 'Standard WA Residential Tenancy Agreement with mutual statutory covenants.',
    specialClauses: Array.isArray(specialClauses) ? specialClauses : ['Strict non-smoking on premises.'],
    status: 'PENDING_TENANT_SIGNATURE',
    ownerSignedAt: new Date().toISOString(),
    securityDepositPaid: false
  });

  // Update application status if provided
  if (applicationId) {
    db.updateApplication(applicationId, { status: 'LEASE_SENT', leaseId: newLease.id });
  }

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CREATE_LEASE',
    entityType: 'Lease',
    entityId: newLease.id,
    details: `Drafted lease agreement for ${tenant.name} on "${prop.title}"`
  });

  // Notify Tenant
  db.createNotification({
    userId: tenant.id,
    title: 'Lease Agreement Ready for Signature',
    message: `${user.name} sent you the digital lease for "${prop.title}". Please review and sign.`,
    type: 'ACTION_REQUIRED',
    link: '/leases',
    read: false
  });

  res.status(201).json({ success: true, lease: newLease });
});

apiRouter.post('/leases/:id/sign', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const lease = db.getLeaseById(req.params.id);
  if (!lease) return res.status(404).json({ success: false, error: 'Lease not found' });

  if (user.id !== lease.tenantId && user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Only the designated tenant can digitally sign this lease' });
  }

  const { signatureName } = req.body;
  if (!signatureName) {
    return res.status(400).json({ success: false, error: 'Digital signature name is required' });
  }

  const updated = db.updateLease(lease.id, {
    status: 'ACTIVE',
    tenantSignedAt: new Date().toISOString(),
    tenantSignatureName: signatureName
  });

  // Update property to RENTED
  db.updateProperty(lease.propertyId, { status: 'RENTED' });

  // Generate initial security deposit and first month's rent invoices
  const depositPayment = db.createPayment({
    leaseId: lease.id,
    propertyId: lease.propertyId,
    propertyTitle: lease.propertyTitle,
    ownerId: lease.ownerId,
    tenantId: lease.tenantId,
    tenantName: lease.tenantName,
    amount: lease.depositAmount,
    type: 'SECURITY_DEPOSIT',
    dueDate: lease.startDate,
    status: 'PENDING',
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}-DEP`,
    notes: 'Security Deposit Escrow'
  });

  const rentPayment = db.createPayment({
    leaseId: lease.id,
    propertyId: lease.propertyId,
    propertyTitle: lease.propertyTitle,
    ownerId: lease.ownerId,
    tenantId: lease.tenantId,
    tenantName: lease.tenantName,
    amount: lease.monthlyRent,
    type: 'MONTHLY_RENT',
    dueDate: lease.startDate,
    status: 'PENDING',
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}-RENT`,
    notes: 'Initial Month Rent'
  });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'SIGN_LEASE_ACTIVE',
    entityType: 'Lease',
    entityId: lease.id,
    details: `Digitally signed lease by ${signatureName}. Property set to RENTED. Deposit and rent invoices generated.`
  });

  // Notify Owner
  db.createNotification({
    userId: lease.ownerId,
    title: 'Lease Executed! 📝',
    message: `${user.name} has digitally signed the lease for "${lease.propertyTitle}". Tenancy is officially active!`,
    type: 'SUCCESS',
    link: '/leases',
    read: false
  });

  res.json({
    success: true,
    lease: updated,
    generatedPayments: [depositPayment, rentPayment]
  });
});

// ==========================================
// 7. PAYMENTS & FINANCIAL TRACKING
// ==========================================

apiRouter.get('/payments', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const payments = db.getPayments(user);
  res.json({ success: true, payments });
});

apiRouter.post('/payments/:id/pay', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const payment = db.getPaymentById(req.params.id);
  if (!payment) return res.status(404).json({ success: false, error: 'Payment invoice not found' });

  if (user.id !== payment.tenantId && user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Unauthorized to pay invoice for another tenant' });
  }

  const { paymentMethod, transactionRef } = req.body;

  const txRef = transactionRef || `TX_${paymentMethod || 'ACH'}_${Date.now().toString().slice(-6)}`;
  const updated = db.updatePayment(payment.id, {
    status: 'PAID',
    paidDate: new Date().toISOString(),
    paymentMethod: paymentMethod || 'BANK_TRANSFER',
    transactionRef: txRef
  });

  // If this was a security deposit, mark lease securityDepositPaid = true
  if (payment.type === 'SECURITY_DEPOSIT') {
    db.updateLease(payment.leaseId, { securityDepositPaid: true });
  }

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PROCESS_PAYMENT',
    entityType: 'RentPayment',
    entityId: payment.id,
    details: `Paid ${payment.type} ($${payment.amount.toLocaleString()}) via ${paymentMethod || 'BANK_TRANSFER'}. Ref: ${txRef}`
  });

  // Notify Owner
  db.createNotification({
    userId: payment.ownerId,
    title: 'Payment Received 💰',
    message: `${user.name} paid $${payment.amount.toLocaleString()} for ${payment.type.replace('_', ' ').toLowerCase()} on "${payment.propertyTitle}".`,
    type: 'SUCCESS',
    link: '/payments',
    read: false
  });

  res.json({ success: true, payment: updated });
});

apiRouter.get('/payments/financial-stats', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const payments = db.getPayments(user);
  const leases = db.getLeases(user);
  const properties = db.getProperties({ ownerId: user.role === 'OWNER' ? user.id : undefined });

  const totalCollected = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0);
  const activeTenancies = leases.filter(l => l.status === 'ACTIVE').length;

  res.json({
    success: true,
    stats: {
      totalCollected,
      totalPending,
      totalOverdue,
      activeTenancies,
      totalPropertiesCount: properties.length
    }
  });
});

// ==========================================
// 8. MAINTENANCE SYSTEM
// ==========================================

apiRouter.get('/maintenance', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const tickets = db.getMaintenance(user);
  res.json({ success: true, tickets });
});

apiRouter.get('/maintenance/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const ticket = db.getMaintenanceById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

  if (user.role !== 'ADMIN' && user.id !== ticket.ownerId && user.id !== ticket.tenantId) {
    return res.status(403).json({ success: false, error: 'Unauthorized to view this ticket' });
  }

  res.json({ success: true, ticket });
});

apiRouter.post('/maintenance', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { propertyId, leaseId, title, category, priority, description, photos } = req.body;

  const prop = db.getPropertyById(propertyId);
  if (!prop) return res.status(404).json({ success: false, error: 'Property not found' });

  const defaultPhotos = photos && photos.length > 0 ? photos : [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800'
  ];

  const newTicket = db.createMaintenance({
    propertyId: prop.id,
    propertyTitle: prop.title,
    propertyAddress: prop.address,
    leaseId: leaseId || 'lease_active',
    tenantId: user.id,
    tenantName: user.name,
    ownerId: prop.ownerId,
    title,
    category: category || 'PLUMBING',
    priority: priority || 'MEDIUM',
    description: description || 'Maintenance service requested.',
    photos: defaultPhotos,
    status: 'OPEN'
  });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CREATE_MAINTENANCE_TICKET',
    entityType: 'MaintenanceTicket',
    entityId: newTicket.id,
    details: `Logged ${priority} maintenance request: "${title}" for "${prop.title}"`
  });

  // Notify Owner
  db.createNotification({
    userId: prop.ownerId,
    title: `Maintenance Request (${priority})`,
    message: `${user.name} reported: "${title}" at "${prop.title}".`,
    type: priority === 'EMERGENCY' || priority === 'HIGH' ? 'WARNING' : 'ACTION_REQUIRED',
    link: '/maintenance',
    read: false
  });

  res.status(201).json({ success: true, ticket: newTicket });
});

apiRouter.patch('/maintenance/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const ticket = db.getMaintenanceById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

  if (user.role !== 'ADMIN' && user.id !== ticket.ownerId && user.id !== ticket.tenantId) {
    return res.status(403).json({ success: false, error: 'Unauthorized to update ticket' });
  }

  const { status, contractorAssigned, estimatedCost, resolutionNotes } = req.body;

  const isResolving = status === 'RESOLVED' && ticket.status !== 'RESOLVED';
  const updated = db.updateMaintenance(ticket.id, {
    status: status || ticket.status,
    contractorAssigned: contractorAssigned !== undefined ? contractorAssigned : ticket.contractorAssigned,
    estimatedCost: estimatedCost !== undefined ? Number(estimatedCost) : ticket.estimatedCost,
    resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : ticket.resolutionNotes,
    resolvedAt: isResolving ? new Date().toISOString() : ticket.resolvedAt
  });

  db.logAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'UPDATE_MAINTENANCE_STATUS',
    entityType: 'MaintenanceTicket',
    entityId: ticket.id,
    details: `Updated maintenance ticket status to ${status || ticket.status}`
  });

  // Notify counterparty
  const recipientId = user.id === ticket.ownerId ? ticket.tenantId : ticket.ownerId;
  db.createNotification({
    userId: recipientId,
    title: `Maintenance: ${status}`,
    message: `Ticket "${ticket.title}" updated to status: ${status}.`,
    type: status === 'RESOLVED' ? 'SUCCESS' : 'INFO',
    read: false
  });

  res.json({ success: true, ticket: updated });
});

apiRouter.post('/maintenance/:id/messages', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const ticket = db.getMaintenanceById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

  if (user.role !== 'ADMIN' && user.id !== ticket.ownerId && user.id !== ticket.tenantId) {
    return res.status(403).json({ success: false, error: 'Unauthorized to participate in this discussion' });
  }

  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Message cannot be empty' });
  }

  const updated = db.addMaintenanceMessage(ticket.id, {
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    message: message.trim()
  });

  // Notify counterparty
  const recipientId = user.id === ticket.ownerId ? ticket.tenantId : ticket.ownerId;
  db.createNotification({
    userId: recipientId,
    title: 'New Maintenance Message',
    message: `${user.name}: "${message.slice(0, 80)}..."`,
    type: 'INFO',
    link: '/maintenance',
    read: false
  });

  res.json({ success: true, ticket: updated });
});

// ==========================================
// 9. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const notifications = db.getNotifications(user.id);
  res.json({ success: true, notifications });
});

apiRouter.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const success = db.markNotificationRead(req.params.id, user.id);
  res.json({ success });
});

apiRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  db.markAllNotificationsRead(user.id);
  res.json({ success: true });
});

// ==========================================
// 10. ADMIN & AUDIT
// ==========================================

apiRouter.get('/admin/metrics', (req: Request, res: Response) => {
  const users = db.getUsers();
  const allProps = db.getProperties({ status: 'ALL' });
  const leases = db.getLeases({ role: 'ADMIN' } as User);
  const payments = db.getPayments({ role: 'ADMIN' } as User);
  const maintenance = db.getMaintenance({ role: 'ADMIN' } as User);

  const totalCollected = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);

  res.json({
    success: true,
    metrics: {
      totalUsers: users.length,
      ownersCount: users.filter(u => u.role === 'OWNER').length,
      tenantsCount: users.filter(u => u.role === 'TENANT').length,
      totalProperties: allProps.length,
      activeListings: allProps.filter(p => p.status === 'ACTIVE').length,
      pendingVerifications: allProps.filter(p => p.status === 'PENDING_VERIFICATION').length,
      rentedUnits: allProps.filter(p => p.status === 'RENTED').length,
      activeLeases: leases.filter(l => l.status === 'ACTIVE').length,
      openMaintenanceTickets: maintenance.filter(m => m.status === 'OPEN' || m.status === 'IN_PROGRESS').length,
      totalRevenueVolume: totalCollected
    }
  });
});

apiRouter.get('/admin/audit-logs', (req: Request, res: Response) => {
  const logs = db.getAuditLogs(150);
  res.json({ success: true, logs });
});

// ==========================================
// 11. DEMO & AUTOMATED REGRESSION SUITE
// ==========================================

apiRouter.post('/demo/reset', (req: Request, res: Response) => {
  db.reset();
  activeUserId = 'user_owner_1';
  res.json({ success: true, message: 'Database reset to fresh baseline seed successfully' });
});

apiRouter.get('/demo/run-tests', async (req: Request, res: Response) => {
  const report = await runAllTests();
  res.json({ success: true, report });
});

apiRouter.post('/demo/run-lifecycle', async (req: Request, res: Response) => {
  try {
    const result = await executeFullLifecycleSimulation();
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Lifecycle execution error' });
  }
});
