import React, { useState } from 'react';
import { Property, RentalApplication, Lease, PaymentInvoice, AuditLog, User } from '../types';
import { 
  ShieldCheck, 
  Building, 
  FileCheck, 
  DollarSign, 
  Users, 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Check,
  X,
  Lock,
  Search,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  properties: Property[];
  applications: RentalApplication[];
  leases: Lease[];
  invoices: PaymentInvoice[];
  users: User[];
  auditLogs: AuditLog[];
  onVerifyProperty: (propertyId: string, approved: boolean, notes?: string) => Promise<void>;
  onInspectProperty: (property: Property) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  properties,
  applications,
  leases,
  invoices,
  users,
  auditLogs,
  onVerifyProperty,
  onInspectProperty
}) => {
  const [adminTab, setAdminTab] = useState<'queue' | 'listings' | 'users' | 'audit'>('queue');
  const [auditSearch, setAuditSearch] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const pendingVerification = properties.filter(p => p.status === 'PENDING_VERIFICATION');
  const verifiedCount = properties.filter(p => p.status === 'ACTIVE' || p.status === 'RENTED').length;
  const activeTenanciesCount = leases.filter(l => l.status === 'ACTIVE').length;
  const totalSettledRevenue = invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);

  const handleVerify = async (propertyId: string, approved: boolean) => {
    setVerifyingId(propertyId);
    try {
      await onVerifyProperty(
        propertyId, 
        approved, 
        approved ? 'Verified title deed & compliance with local tenancy laws.' : 'Documentation insufficient.'
      );
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q)
    );
  });

  return (
    <div id="admin-dashboard-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Platform Admin Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold text-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">RentMate Platform Governance</h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                SUPERADMIN CONSOLE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Platform-wide verification, real-time RBAC enforcement, financial telemetry, and immutable audit trails.
            </p>
          </div>
        </div>

        {/* Pending Queue Indicator */}
        <div className="flex items-center gap-2">
          {pendingVerification.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
              <Clock className="w-4 h-4" />
              {pendingVerification.length} Pending Verifications
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Verification Queue Clear
            </span>
          )}
        </div>
      </div>

      {/* High-Level Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Listings</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{verifiedCount} / {properties.length}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {Math.round((verifiedCount / (properties.length || 1)) * 100)}% compliance rate
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Tenancies</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activeTenanciesCount}</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{leases.length} Total Contracts Issued</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform GMV Volume</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">${totalSettledRevenue.toLocaleString()}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">100% Verified Disbursements</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{users.length} Users</h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">3 Roles: Admin, Owner, Tenant</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Admin Subtabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/70">
          <button
            onClick={() => setAdminTab('queue')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'queue'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Verification Queue ({pendingVerification.length})
          </button>

          <button
            onClick={() => setAdminTab('listings')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'listings'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            All Marketplace Properties ({properties.length})
          </button>

          <button
            onClick={() => setAdminTab('users')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'users'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            User Directory ({users.length})
          </button>

          <button
            onClick={() => setAdminTab('audit')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'audit'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Immutable Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Verification Queue */}
        {adminTab === 'queue' && (
          <div className="p-6">
            {pendingVerification.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No listings waiting for verification. All submitted properties have been reviewed.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerification.map(prop => (
                  <div
                    key={prop.id}
                    className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Under Verification
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900">{prop.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600">{prop.address}, {prop.city}, {prop.state} {prop.zip}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        <span>Rent: <strong>${prop.rentAmount.toLocaleString()} / mo</strong></span>
                        <span>Owner: <strong>{prop.ownerName}</strong> ({prop.ownerEmail})</span>
                        <span>Listed: <strong>{new Date(prop.createdAt).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onInspectProperty(prop)}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect Details</span>
                      </button>

                      <button
                        disabled={verifyingId === prop.id}
                        onClick={() => handleVerify(prop.id, true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Listing</span>
                      </button>

                      <button
                        disabled={verifyingId === prop.id}
                        onClick={() => handleVerify(prop.id, false)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Properties Table */}
        {adminTab === 'listings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Property</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Rent / Mo</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {properties.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4">
                      <strong className="text-slate-900 font-bold block">{p.title}</strong>
                      <span className="text-slate-400 text-[11px]">{p.city}, {p.state}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{p.propertyType}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{p.ownerName}</p>
                      <p className="text-[10px] text-slate-400">{p.ownerEmail}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-900">${p.rentAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'RENTED' ? 'bg-slate-900 text-amber-300' :
                        p.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onInspectProperty(p)}
                        className="text-purple-700 hover:text-purple-900 font-bold hover:underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Users */}
        {adminTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Tenant Profile / Occupation</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <strong className="text-slate-900 font-bold block">{u.name}</strong>
                        <span className="text-slate-400 text-[10px]">ID: {u.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'OWNER' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-800 font-medium">{u.email}</p>
                      <p className="text-slate-400 text-[11px]">{u.phone}</p>
                    </td>
                    <td className="p-4">
                      {u.occupation ? (
                        <div>
                          <p className="font-semibold text-slate-800">{u.occupation} @ {u.employer}</p>
                          <p className="text-slate-500 text-[11px]">${u.monthlyIncome?.toLocaleString()} / mo • Credit {u.creditScore}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {adminTab === 'audit' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter logs by action, user, or entity..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">Showing {filteredLogs.length} audit entries</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-bold text-purple-700">{log.action}</td>
                      <td className="p-3 text-slate-800 font-medium">{log.userName}</td>
                      <td className="p-3 text-slate-600">{log.entityType} #{log.entityId.slice(0, 8)}</td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{JSON.stringify(log.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
