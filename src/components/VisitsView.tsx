import React, { useState } from 'react';
import { Visit, User } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  User as UserIcon,
  Video, 
  Check, 
  Building,
  AlertCircle
} from 'lucide-react';

interface VisitsViewProps {
  visits: Visit[];
  currentUser: User | null;
  onUpdateVisit: (id: string, updates: Partial<Visit>) => Promise<void>;
}

export const VisitsView: React.FC<VisitsViewProps> = ({
  visits,
  currentUser,
  onUpdateVisit
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [ownerNotesInput, setOwnerNotesInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const isOwnerOrAdmin = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN';

  const filteredVisits = visits.filter(v => {
    if (statusFilter === 'ALL') return true;
    return v.status === statusFilter;
  });

  const handleStatusChange = async (visitId: string, newStatus: Visit['status'], notes?: string) => {
    setUpdating(true);
    try {
      await onUpdateVisit(visitId, {
        status: newStatus,
        ownerNotes: notes !== undefined ? notes : undefined
      });
      setSelectedVisit(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update visit');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: Visit['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
          </span>
        );
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Owner Confirmation
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Check className="w-3.5 h-3.5 text-blue-600" /> Tour Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="visits-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Property Tours & Visits</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isOwnerOrAdmin ? 'Manage incoming tenant walkthrough requests and access details.' : 'Track your scheduled in-person walkthroughs and live video tours.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Tours' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Visits List */}
      {filteredVisits.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No scheduled visits found</h3>
          <p className="text-xs text-slate-500 mt-1">Explore available rental listings to book a private tour.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVisits.map(visit => (
            <div
              key={visit.id}
              id={`visit-card-${visit.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Status & Type Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {visit.visitType === 'IN_PERSON' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        🚶 In-Person Walkthrough
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                        <Video className="w-3 h-3" /> Virtual Video Tour
                      </span>
                    )}
                  </div>
                  <div>{getStatusBadge(visit.status)}</div>
                </div>

                {/* Property Title */}
                <h3 className="font-extrabold text-base text-slate-900">{visit.propertyTitle}</h3>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{visit.propertyAddress}, {visit.propertyCity}</span>
                </div>

                {/* Date & Time Slot Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{new Date(visit.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{visit.timeSlot}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-medium">Requested</p>
                    <p className="text-[11px] text-slate-600 font-semibold">{new Date(visit.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Counterparty details */}
                <div className="space-y-1.5 text-xs text-slate-600 pb-3 border-b border-slate-100">
                  {isOwnerOrAdmin ? (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tenant: <strong className="text-slate-900">{visit.tenantName}</strong> ({visit.tenantPhone})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact Landlord: <strong className="text-slate-900">{visit.tenantName ? 'Property Manager' : 'Verified Owner'}</strong></span>
                    </div>
                  )}

                  {visit.notes && (
                    <div className="p-2 bg-blue-50/60 rounded-lg text-[11px] text-blue-900 mt-2">
                      <strong>Tenant Note:</strong> {visit.notes}
                    </div>
                  )}

                  {visit.ownerNotes && (
                    <div className="p-2 bg-emerald-50/60 rounded-lg text-[11px] text-emerald-900 mt-2">
                      <strong>Owner Access Info:</strong> {visit.ownerNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2">
                {visit.status === 'REQUESTED' && isOwnerOrAdmin && (
                  <>
                    <button
                      onClick={() => handleStatusChange(visit.id, 'CONFIRMED', 'Gate pass & access details sent.')}
                      disabled={updating}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      Confirm Tour
                    </button>
                    <button
                      onClick={() => handleStatusChange(visit.id, 'CANCELLED', 'Owner unavailable at requested time.')}
                      disabled={updating}
                      className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Decline
                    </button>
                  </>
                )}

                {visit.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(visit.id, 'COMPLETED')}
                      disabled={updating}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Mark Tour Completed
                    </button>
                    <button
                      onClick={() => handleStatusChange(visit.id, 'CANCELLED', 'Cancelled by participant.')}
                      disabled={updating}
                      className="text-slate-500 hover:text-rose-600 text-xs font-medium px-2 py-1 transition cursor-pointer"
                    >
                      Cancel Tour
                    </button>
                  </>
                )}

                {visit.status === 'COMPLETED' && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Walkthrough Completed
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
