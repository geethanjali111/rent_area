import React from 'react';
import { Property, RentalApplication, Lease, Visit, MaintenanceRequest, User } from '../types';
import { 
  Building, 
  DollarSign, 
  FileCheck, 
  Calendar, 
  Wrench, 
  Plus, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  Sparkles,
  Bed,
  Bath,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface OwnerDashboardProps {
  properties: Property[];
  applications: RentalApplication[];
  leases: Lease[];
  visits: Visit[];
  tickets: MaintenanceRequest[];
  currentUser: User | null;
  onOpenAddProperty: () => void;
  onSelectProperty: (property: Property) => void;
  onNavigateTab: (tab: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  properties,
  applications,
  leases,
  visits,
  tickets,
  currentUser,
  onOpenAddProperty,
  onSelectProperty,
  onNavigateTab
}) => {
  // Only owner's properties (already isolated by backend)
  const totalUnits = properties.length;
  const rentedUnits = properties.filter(p => p.status === 'RENTED').length;
  const occupancyRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;
  
  // Total Gross Rent Roll per Month
  const grossRentRoll = properties
    .filter(p => p.status === 'RENTED' || p.status === 'ACTIVE')
    .reduce((acc, curr) => acc + curr.rentAmount, 0);

  const pendingVisitsCount = visits.filter(v => v.status === 'REQUESTED').length;
  const pendingAppsCount = applications.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length;
  const openTicketsCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <div id="owner-dashboard-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portfolio & Operations Command</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              OWNER PORTAL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, {currentUser?.name}. Manage listings, approve applications, issue leases, and resolve tenant repairs.
          </p>
        </div>

        <button
          onClick={onOpenAddProperty}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Monthly Rent Roll</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">${grossRentRoll.toLocaleString()}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Across {totalUnits} Managed Units</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy Rate</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{occupancyRate}%</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{rentedUnits} of {totalUnits} Units Leased</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('applications')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 transition cursor-pointer"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Applications</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{pendingAppsCount}</h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">AI Underwriting Ready</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('maintenance')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 transition cursor-pointer"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Maintenance</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{openTicketsCount}</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{tickets.length} Total Historical</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigateTab('visits')}
          className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-xs text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tour Walkthrough Requests</h4>
              <p className="text-[11px] text-slate-500">{pendingVisitsCount} awaiting your confirmation</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div 
          onClick={() => onNavigateTab('leases')}
          className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-xs text-purple-600">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Active Lease Agreements</h4>
              <p className="text-[11px] text-slate-500">{leases.length} digital tenancies on file</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div 
          onClick={() => onNavigateTab('payments')}
          className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-xs text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Payment & Escrow Center</h4>
              <p className="text-[11px] text-slate-500">Track monthly disbursements</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Property Portfolio Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">My Managed Properties ({properties.length})</h2>
          <button
            onClick={onOpenAddProperty}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> List Another Unit
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Building className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No properties in your portfolio yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Add your first rental unit to begin receiving verified tenant applications.</p>
            <button
              onClick={onOpenAddProperty}
              className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Add First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map(p => (
              <div
                key={p.id}
                onClick={() => onSelectProperty(p)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        p.status === 'ACTIVE' ? 'bg-emerald-600 text-white' :
                        p.status === 'RENTED' ? 'bg-slate-900 text-amber-300' :
                        p.status === 'PENDING_VERIFICATION' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-white'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-900/80 text-white text-xs font-bold">
                      ${p.rentAmount.toLocaleString()} / mo
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{p.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{p.address}, {p.city}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-3 pt-2.5 border-t border-slate-100 font-medium">
                      <span>{p.bedrooms} Beds</span>
                      <span>•</span>
                      <span>{p.bathrooms} Baths</span>
                      <span>•</span>
                      <span>{p.squareFeet.toLocaleString()} sqft</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl transition">
                    Inspect Property
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
