import React, { useState } from 'react';
import { Lease, User } from '../types';
import { 
  ClipboardCheck, 
  FileCheck, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';
import { LeaseModal } from './LeaseModal';

interface LeasesViewProps {
  leases: Lease[];
  currentUser: User | null;
  onSignLease: (leaseId: string, signatureName: string) => Promise<void>;
  onNavigateToPayments?: () => void;
}

export const LeasesView: React.FC<LeasesViewProps> = ({
  leases,
  currentUser,
  onSignLease,
  onNavigateToPayments
}) => {
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredLeases = leases.filter(l => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  return (
    <div id="leases-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lease Agreements & Tenancies</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage active residential tenancy contracts, digital signatures, and deposit escrows.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'ACTIVE', 'PENDING_TENANT_SIGNATURE', 'TERMINATED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Leases' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredLeases.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No lease agreements found</h3>
          <p className="text-xs text-slate-500 mt-1">When an application is approved and a lease is issued, it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeases.map(lease => {
            const isActive = lease.status === 'ACTIVE';

            return (
              <div
                key={lease.id}
                id={`lease-card-${lease.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Status row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono text-slate-400">Lease #{lease.id.slice(0, 8)}</span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Tenancy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        <Lock className="w-3.5 h-3.5 text-purple-600" /> Awaiting Signature
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">{lease.propertyTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 mb-4">{lease.propertyAddress}</p>

                  {/* Financial & Term Summary */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Rent</span>
                      <strong className="text-slate-900 font-extrabold text-sm">${lease.monthlyRent.toLocaleString()}</strong>
                      <span className="text-slate-500 text-[10px] block">Due on {lease.paymentDueDay}st</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Security Deposit</span>
                      <strong className="text-slate-900 font-extrabold text-sm">${lease.depositAmount.toLocaleString()}</strong>
                      <span className={`text-[10px] font-bold block ${lease.securityDepositPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {lease.securityDepositPaid ? '✓ Deposit Escrowed' : 'Deposit Unpaid'}
                      </span>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="space-y-1 text-xs text-slate-600 pb-3 border-b border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Landlord:</span>
                      <strong className="text-slate-900">{lease.ownerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tenant:</span>
                      <strong className="text-slate-900">{lease.tenantName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Validity:</span>
                      <span>{new Date(lease.startDate).toLocaleDateString()} — {new Date(lease.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedLease(lease)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{isActive ? 'View Full Contract' : 'Review & Sign Lease'}</span>
                  </button>

                  {isActive && onNavigateToPayments && (
                    <button
                      onClick={onNavigateToPayments}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Rent Payments</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Lease Details Modal */}
      {selectedLease && (
        <LeaseModal
          lease={selectedLease}
          currentUser={currentUser}
          onClose={() => setSelectedLease(null)}
          onSignLease={async (id, sig) => {
            await onSignLease(id, sig);
            setSelectedLease(null);
          }}
        />
      )}

    </div>
  );
};
