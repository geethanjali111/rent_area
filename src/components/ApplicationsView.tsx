import React, { useState } from 'react';
import { RentalApplication, User } from '../types';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle,
  Building,
  Calendar,
  Send
} from 'lucide-react';

interface ApplicationsViewProps {
  applications: RentalApplication[];
  currentUser: User | null;
  onUpdateStatus: (id: string, status: string, rejectionReason?: string) => Promise<void>;
  onOpenDraftLease: (application: RentalApplication) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  currentUser,
  onUpdateStatus,
  onOpenDraftLease
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<RentalApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isOwnerOrAdmin = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN';

  const filteredApps = applications.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const getStatusBadge = (status: RentalApplication['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
          </span>
        );
      case 'LEASE_SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Send className="w-3.5 h-3.5 text-purple-600" /> Lease Proposal Sent
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Application Submitted
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Under Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Declined
          </span>
        );
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (id: string, status: string, reason?: string) => {
    setSubmitting(true);
    try {
      await onUpdateStatus(id, status, reason);
      setIsRejecting(false);
      setSelectedApp(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="applications-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rental Applications Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isOwnerOrAdmin
              ? 'Review prospective tenant background profiles, AI risk scores, and issue digital leases.'
              : 'Track the real-time status of your submitted tenancy applications.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'LEASE_SENT', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Applications' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No applications in this category</h3>
          <p className="text-xs text-slate-500 mt-1">Check other status filters or submit an application on a property.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map(app => {
            const rentToIncomeRatio = Math.round((app.propertyRent / (app.monthlyIncome || 1)) * 100);

            return (
              <div
                key={app.id}
                id={`application-card-${app.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left Profile Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-extrabold text-base text-slate-900">{app.propertyTitle}</h3>
                    {getStatusBadge(app.status)}
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      ${app.propertyRent.toLocaleString()}/mo
                    </span>
                  </div>

                  {/* Tenant Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Applicant</span>
                      <strong className="text-slate-900 font-bold text-xs">{app.tenantName}</strong>
                      <p className="text-[11px] text-slate-500">{app.tenantEmail}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Financials & Employment</span>
                      <strong className="text-slate-900 font-bold text-xs">${app.monthlyIncome.toLocaleString()} / mo</strong>
                      <p className="text-[11px] text-slate-500">{app.occupation} @ {app.employer}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Credit & Tenancy</span>
                      <strong className="text-slate-900 font-bold text-xs">Credit: {app.creditScoreEstimate} ({rentToIncomeRatio}% Rent Ratio)</strong>
                      <p className="text-[11px] text-slate-500">{app.leaseTermMonths} Mo Lease • Move-in: {app.moveInDate}</p>
                    </div>
                  </div>

                  {/* AI Risk Score Analysis Card */}
                  {app.aiRiskScore && (
                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 font-extrabold text-xs">
                        {app.aiRiskScore}/100
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs font-bold text-blue-950">AI Underwriting Evaluation</span>
                        </div>
                        <p className="text-[11px] text-blue-900 mt-0.5">{app.aiRiskSummary}</p>
                      </div>
                    </div>
                  )}

                  {/* References & Message */}
                  {app.references && app.references.length > 0 && (
                    <div className="text-[11px] text-slate-600">
                      <strong>Reference on File:</strong> {app.references[0].name} ({app.references[0].relationship}) — {app.references[0].phone}
                    </div>
                  )}

                  {app.message && (
                    <div className="text-[11px] text-slate-500 italic">
                      "{app.message}"
                    </div>
                  )}

                  {app.rejectionReason && (
                    <div className="p-2 bg-rose-50 text-rose-800 text-[11px] rounded-lg border border-rose-200">
                      <strong>Decline Reason:</strong> {app.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Right Action Controls */}
                <div className="shrink-0 flex flex-col gap-2 min-w-44 justify-center">
                  {isOwnerOrAdmin && app.status === 'SUBMITTED' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                        disabled={submitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Application
                      </button>

                      <button
                        onClick={() => handleStatusUpdate(app.id, 'UNDER_REVIEW')}
                        disabled={submitting}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2 rounded-xl transition cursor-pointer"
                      >
                        Mark Under Review
                      </button>

                      <button
                        onClick={() => handleStatusUpdate(app.id, 'REJECTED', 'Credit or income criteria not met.')}
                        disabled={submitting}
                        className="w-full bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-medium text-xs py-1.5 rounded-xl transition cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {isOwnerOrAdmin && app.status === 'UNDER_REVIEW' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                        disabled={submitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Approve Candidate
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'REJECTED', 'Position filled by another applicant.')}
                        disabled={submitting}
                        className="w-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-medium text-xs py-2 rounded-xl transition cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {isOwnerOrAdmin && app.status === 'APPROVED' && (
                    <button
                      onClick={() => onOpenDraftLease(app)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Prepare Digital Lease</span>
                    </button>
                  )}

                  {app.status === 'LEASE_SENT' && (
                    <div className="p-2.5 bg-purple-50 rounded-xl text-center border border-purple-200">
                      <p className="text-[11px] font-bold text-purple-900">Lease Agreement Sent</p>
                      <p className="text-[10px] text-purple-700 mt-0.5">Awaiting tenant signature</p>
                    </div>
                  )}

                  {app.status === 'REJECTED' && (
                    <div className="p-2.5 bg-slate-100 rounded-xl text-center text-slate-500 text-xs font-semibold">
                      Closed
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
