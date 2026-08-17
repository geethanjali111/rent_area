import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, 
  Property, 
  RentalApplication, 
  Lease, 
  Visit, 
  PaymentInvoice, 
  MaintenanceRequest, 
  Notification, 
  AuditLog,
  PropertyType
} from './types';
import { api } from './lib/api';

// Components
import { DemoToolbar } from './components/DemoToolbar';
import { Navbar } from './components/Navbar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { AddPropertyModal } from './components/AddPropertyModal';
import { VisitsView } from './components/VisitsView';
import { ApplicationsView } from './components/ApplicationsView';
import { DraftLeaseModal } from './components/DraftLeaseModal';
import { LeasesView } from './components/LeasesView';
import { PaymentsView } from './components/PaymentsView';
import { MaintenanceView } from './components/MaintenanceView';
import { AdminDashboard } from './components/AdminDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AutomatedTestModal } from './components/AutomatedTestModal';

// Icons
import { 
  Search, 
  SlidersHorizontal, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  ArrowUpDown, 
  X, 
  Filter, 
  Check, 
  RotateCcw,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Authentication / Active Persona
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Core Data
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [invoices, setInvoices] = useState<PaymentInvoice[]>([]);
  const [tickets, setTickets] = useState<MaintenanceRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Active View Tab: 'explore' | 'shortlist' | 'visits' | 'applications' | 'leases' | 'payments' | 'maintenance' | 'owner_dashboard' | 'admin_dashboard'
  const [activeTab, setActiveTab] = useState<string>('explore');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedroomFilter, setBedroomFilter] = useState('ALL');
  const [petFriendlyOnly, setPetFriendlyOnly] = useState(false);
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'newest'>('featured');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Shortlist State
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(['prop-1']);

  // Modals State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [draftingLeaseApp, setDraftingLeaseApp] = useState<RentalApplication | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [isLifecycleSimulating, setIsLifecycleSimulating] = useState(false);

  // Loading indicator
  const [loading, setLoading] = useState(true);

  // 1. Initial Load & Fetching Data
  const refreshAllData = useCallback(async () => {
    try {
      const [
        usersData,
        propsData,
        appsData,
        leasesData,
        visitsData,
        invoicesData,
        ticketsData,
        notifsData,
        auditData
      ] = await Promise.all([
        api.getUsers(),
        api.getProperties(),
        api.getApplications(),
        api.getLeases(),
        api.getVisits(),
        api.getInvoices(),
        api.getMaintenanceTickets(),
        api.getNotifications(),
        api.getAuditLogs()
      ]);

      setUsers(usersData);
      setProperties(propsData);
      setApplications(appsData);
      setLeases(leasesData);
      setVisits(visitsData);
      setInvoices(invoicesData);
      setTickets(ticketsData);
      setNotifications(notifsData);
      setAuditLogs(auditData);

      // Default to tenant Alex if no user set yet
      if (!currentUser && usersData.length > 0) {
        const defaultUser = usersData.find(u => u.id === 'user-tenant-1') || usersData[0];
        setCurrentUser(defaultUser);
        api.setCurrentUserId(defaultUser.id);
      }
    } catch (err) {
      console.error('Failed to load data from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Persona switching handler
  const handleSwitchUser = async (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (!selected) return;
    
    api.setCurrentUserId(selected.id);
    setCurrentUser(selected);

    // Switch view to match role naturally
    if (selected.role === 'ADMIN') {
      setActiveTab('admin_dashboard');
    } else if (selected.role === 'OWNER') {
      setActiveTab('owner_dashboard');
    } else {
      setActiveTab('explore');
    }

    // Refresh context data (enforces server-side user isolation)
    await refreshAllData();
  };

  // Reset database handler
  const handleResetDb = async () => {
    if (!window.confirm('Reset database to pristine baseline seed data?')) return;
    try {
      await api.resetDatabase();
      await refreshAllData();
      alert('Database restored to default verified state!');
    } catch (err: any) {
      alert('Failed to reset DB: ' + err.message);
    }
  };

  // Run full lifecycle demo
  const handleRunLifecycleDemo = async () => {
    setIsLifecycleSimulating(true);
    try {
      await api.runFullLifecycle();
      await refreshAllData();
      setShowTestModal(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
    } catch (err: any) {
      alert('Simulation error: ' + err.message);
    } finally {
      setIsLifecycleSimulating(false);
    }
  };

  // Shortlist toggle
  const handleToggleShortlist = (propertyId: string) => {
    if (shortlistedIds.includes(propertyId)) {
      setShortlistedIds(shortlistedIds.filter(id => id !== propertyId));
    } else {
      setShortlistedIds([...shortlistedIds, propertyId]);
    }
  };

  // Notification handlers
  const handleNotificationClick = async (notif: Notification) => {
    await api.markNotificationRead(notif.id);
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.link) {
      if (notif.link.includes('applications')) setActiveTab('applications');
      else if (notif.link.includes('leases')) setActiveTab('leases');
      else if (notif.link.includes('visits')) setActiveTab('visits');
      else if (notif.link.includes('payments')) setActiveTab('payments');
      else if (notif.link.includes('maintenance')) setActiveTab('maintenance');
    }
  };

  const handleMarkAllNotifsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Property Actions
  const handleSaveProperty = async (data: any) => {
    if (editingProperty) {
      await api.updateProperty(editingProperty.id, data);
    } else {
      await api.createProperty(data);
    }
    setEditingProperty(null);
    setShowAddProperty(false);
    await refreshAllData();
  };

  const handleVerifyProperty = async (propertyId: string, approved: boolean, notes?: string) => {
    await api.verifyProperty(propertyId, approved, notes);
    await refreshAllData();
  };

  // Visit Request
  const handleRequestVisit = async (data: any) => {
    await api.requestVisit(data);
    await refreshAllData();
  };

  const handleUpdateVisit = async (id: string, updates: Partial<Visit>) => {
    await api.updateVisit(id, updates);
    await refreshAllData();
  };

  // Application
  const handleSubmitApplication = async (data: any) => {
    await api.submitApplication(data);
    await refreshAllData();
  };

  const handleUpdateApplicationStatus = async (id: string, status: string, reason?: string) => {
    await api.updateApplicationStatus(id, status, reason);
    await refreshAllData();
  };

  // Lease
  const handleDraftLease = async (data: any) => {
    await api.draftLease(data);
    setDraftingLeaseApp(null);
    await refreshAllData();
    setActiveTab('leases');
  };

  const handleSignLease = async (leaseId: string, signatureName: string) => {
    await api.signLease(leaseId, signatureName);
    await refreshAllData();
  };

  // Payments
  const handlePayInvoice = async (invoiceId: string, paymentMethod: string) => {
    await api.payInvoice(invoiceId, paymentMethod);
    await refreshAllData();
  };

  // Maintenance
  const handleCreateMaintenanceTicket = async (data: any) => {
    await api.createMaintenanceTicket(data);
    await refreshAllData();
  };

  const handleUpdateMaintenanceTicket = async (ticketId: string, updates: Partial<MaintenanceRequest>) => {
    await api.updateMaintenanceTicket(ticketId, updates);
    await refreshAllData();
  };

  const handleAddMaintenanceComment = async (ticketId: string, message: string) => {
    await api.addMaintenanceComment(ticketId, message);
    await refreshAllData();
  };

  // Search & Filter Memo
  const filteredProperties = useMemo(() => {
    let result = properties;

    // View tab filtering
    if (activeTab === 'shortlist') {
      result = result.filter(p => shortlistedIds.includes(p.id));
    }

    // Text Query search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.amenities.some(a => a.toLowerCase().includes(q))
      );
    }

    // City Filter
    if (cityFilter !== 'ALL') {
      result = result.filter(p => p.city.toLowerCase() === cityFilter.toLowerCase());
    }

    // Property Type
    if (propertyTypeFilter !== 'ALL') {
      result = result.filter(p => p.propertyType === propertyTypeFilter);
    }

    // Bedrooms
    if (bedroomFilter !== 'ALL') {
      const bCount = Number(bedroomFilter);
      result = result.filter(p => p.bedrooms >= bCount);
    }

    // Price
    if (minPrice) {
      result = result.filter(p => p.rentAmount >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => p.rentAmount <= Number(maxPrice));
    }

    // Pets & Furnished
    if (petFriendlyOnly) {
      result = result.filter(p => p.petFriendly);
    }
    if (furnishedOnly) {
      result = result.filter(p => p.furnished);
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'price_asc') return a.rentAmount - b.rentAmount;
      if (sortBy === 'price_desc') return b.rentAmount - a.rentAmount;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [
    properties,
    activeTab,
    shortlistedIds,
    searchQuery,
    cityFilter,
    propertyTypeFilter,
    bedroomFilter,
    minPrice,
    maxPrice,
    petFriendlyOnly,
    furnishedOnly,
    sortBy
  ]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(properties.map(p => p.city));
    return Array.from(cities);
  }, [properties]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      
      {/* 1. Global Testing & Persona Switcher Toolbar */}
      <DemoToolbar
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onOpenTests={() => setShowTestModal(true)}
        onRunLifecycle={handleRunLifecycleDemo}
        onResetDb={handleResetDb}
        isLifecycleRunning={isLifecycleSimulating}
      />

      {/* 2. Platform Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        shortlistCount={shortlistedIds.length}
        onOpenAddProperty={() => {
          setEditingProperty(null);
          setShowAddProperty(true);
        }}
        onNotificationClick={handleNotificationClick}
        onMarkAllNotifsRead={handleMarkAllNotifsRead}
      />

      {/* 3. Main View Render based on Active Tab */}
      <main className="flex-1">
        
        {loading ? (
          <div className="max-w-7xl mx-auto p-12 text-center">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-slate-700">Connecting to RentMate Engine & Database...</p>
          </div>
        ) : (
          <>
            {/* VIEW: EXPLORE / SHORTLIST PROPERTIES */}
            {(activeTab === 'explore' || activeTab === 'shortlist') && (
              <div id="marketplace-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                
                {/* Search & Comprehensive Filters Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                  
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search by neighborhood, city, address, or amenity (e.g. Balcony, EV Charging)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
                      
                      {/* City Dropdown */}
                      <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
                      >
                        <option value="ALL">All Cities</option>
                        {uniqueCities.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      {/* Property Type Dropdown */}
                      <select
                        value={propertyTypeFilter}
                        onChange={(e) => setPropertyTypeFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
                      >
                        <option value="ALL">All Property Types</option>
                        <option value="APARTMENT">Apartments</option>
                        <option value="HOUSE">Houses</option>
                        <option value="CONDO">Condos</option>
                        <option value="TOWNHOUSE">Townhouses</option>
                        <option value="STUDIO">Studios</option>
                      </select>

                      {/* Bedroom count */}
                      <select
                        value={bedroomFilter}
                        onChange={(e) => setBedroomFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
                      >
                        <option value="ALL">Any Beds</option>
                        <option value="1">1+ Beds</option>
                        <option value="2">2+ Beds</option>
                        <option value="3">3+ Beds</option>
                        <option value="4">4+ Beds</option>
                      </select>

                      {/* Expand Filter Drawer Button */}
                      <button
                        onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                          showFilterDrawer || petFriendlyOnly || furnishedOnly || minPrice || maxPrice
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">More Filters</span>
                      </button>

                      {/* Sort Dropdown */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
                      >
                        <option value="featured">Featured First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="newest">Newest Listed</option>
                      </select>

                    </div>
                  </div>

                  {/* Expanded Filter Drawer */}
                  {showFilterDrawer && (
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Price Range:</span>
                        <input
                          type="number"
                          placeholder="Min $"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                          type="number"
                          placeholder="Max $"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={petFriendlyOnly}
                            onChange={(e) => setPetFriendlyOnly(e.target.checked)}
                            className="rounded text-slate-900"
                          />
                          <span>Pet Friendly Only</span>
                        </label>

                        <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={furnishedOnly}
                            onChange={(e) => setFurnishedOnly(e.target.checked)}
                            className="rounded text-slate-900"
                          />
                          <span>Furnished Units</span>
                        </label>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setMinPrice('');
                            setMaxPrice('');
                            setPetFriendlyOnly(false);
                            setFurnishedOnly(false);
                            setCityFilter('ALL');
                            setPropertyTypeFilter('ALL');
                            setBedroomFilter('ALL');
                            setSearchQuery('');
                          }}
                          className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900">
                      {activeTab === 'shortlist' ? 'My Saved Properties' : 'Available Rental Listings'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                      {filteredProperties.length}
                    </span>
                  </div>

                  {currentUser?.role === 'OWNER' && (
                    <button
                      onClick={() => {
                        setEditingProperty(null);
                        setShowAddProperty(true);
                      }}
                      className="text-xs font-bold text-slate-900 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> List New Unit
                    </button>
                  )}
                </div>

                {/* Property Grid */}
                {filteredProperties.length === 0 ? (
                  <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No properties match your filter criteria</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Try clearing filters or search terms to explore available homes.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCityFilter('ALL');
                        setPropertyTypeFilter('ALL');
                        setBedroomFilter('ALL');
                        setMinPrice('');
                        setMaxPrice('');
                        setPetFriendlyOnly(false);
                        setFurnishedOnly(false);
                      }}
                      className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        currentUser={currentUser}
                        isShortlisted={shortlistedIds.includes(property.id)}
                        onToggleShortlist={handleToggleShortlist}
                        onSelectProperty={(p) => setSelectedProperty(p)}
                        onOpenBookTour={(p) => {
                          setSelectedProperty(p);
                        }}
                        onOpenApply={(p) => {
                          setSelectedProperty(p);
                        }}
                        onEditProperty={(p) => {
                          setEditingProperty(p);
                          setShowAddProperty(true);
                        }}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* VIEW: VISITS */}
            {activeTab === 'visits' && (
              <VisitsView
                visits={visits}
                currentUser={currentUser}
                onUpdateVisit={handleUpdateVisit}
              />
            )}

            {/* VIEW: APPLICATIONS */}
            {activeTab === 'applications' && (
              <ApplicationsView
                applications={applications}
                currentUser={currentUser}
                onUpdateStatus={handleUpdateApplicationStatus}
                onOpenDraftLease={(app) => setDraftingLeaseApp(app)}
              />
            )}

            {/* VIEW: LEASES */}
            {activeTab === 'leases' && (
              <LeasesView
                leases={leases}
                currentUser={currentUser}
                onSignLease={handleSignLease}
                onNavigateToPayments={() => setActiveTab('payments')}
              />
            )}

            {/* VIEW: PAYMENTS */}
            {activeTab === 'payments' && (
              <PaymentsView
                invoices={invoices}
                currentUser={currentUser}
                onPayInvoice={handlePayInvoice}
              />
            )}

            {/* VIEW: MAINTENANCE */}
            {activeTab === 'maintenance' && (
              <MaintenanceView
                tickets={tickets}
                properties={properties}
                currentUser={currentUser}
                onCreateTicket={handleCreateMaintenanceTicket}
                onUpdateTicket={handleUpdateMaintenanceTicket}
                onAddComment={handleAddMaintenanceComment}
              />
            )}

            {/* VIEW: OWNER DASHBOARD */}
            {activeTab === 'owner_dashboard' && (
              <OwnerDashboard
                properties={properties}
                applications={applications}
                leases={leases}
                visits={visits}
                tickets={tickets}
                currentUser={currentUser}
                onOpenAddProperty={() => {
                  setEditingProperty(null);
                  setShowAddProperty(true);
                }}
                onSelectProperty={(p) => setSelectedProperty(p)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* VIEW: ADMIN DASHBOARD */}
            {activeTab === 'admin_dashboard' && (
              <AdminDashboard
                properties={properties}
                applications={applications}
                leases={leases}
                invoices={invoices}
                users={users}
                auditLogs={auditLogs}
                onVerifyProperty={handleVerifyProperty}
                onInspectProperty={(p) => setSelectedProperty(p)}
              />
            )}
          </>
        )}

      </main>

      {/* 4. Modals */}
      
      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          currentUser={currentUser}
          isShortlisted={shortlistedIds.includes(selectedProperty.id)}
          onClose={() => setSelectedProperty(null)}
          onToggleShortlist={handleToggleShortlist}
          onRequestVisit={handleRequestVisit}
          onSubmitApplication={handleSubmitApplication}
          onVerifyProperty={handleVerifyProperty}
        />
      )}

      {/* Add / Edit Property Modal */}
      {showAddProperty && (
        <AddPropertyModal
          initialProperty={editingProperty}
          currentUser={currentUser}
          onClose={() => {
            setShowAddProperty(false);
            setEditingProperty(null);
          }}
          onSave={handleSaveProperty}
        />
      )}

      {/* Draft Lease Modal */}
      {draftingLeaseApp && (
        <DraftLeaseModal
          application={draftingLeaseApp}
          currentUser={currentUser}
          onClose={() => setDraftingLeaseApp(null)}
          onDraftLease={handleDraftLease}
        />
      )}

      {/* Automated Tests & Lifecycle Modal */}
      {showTestModal && (
        <AutomatedTestModal
          onClose={() => setShowTestModal(false)}
          onRefreshAppState={refreshAllData}
        />
      )}

    </div>
  );
}
