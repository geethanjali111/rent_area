import React, { useState } from 'react';
import { RentalApplication, User } from '../types';
import { 
  X, 
  FileSignature, 
  Calendar, 
  DollarSign, 
  Building, 
  Check, 
  Plus, 
  Trash2,
  ShieldCheck
} from 'lucide-react';

interface DraftLeaseModalProps {
  application: RentalApplication;
  currentUser: User | null;
  onClose: () => void;
  onDraftLease: (data: any) => Promise<void>;
}

export const DraftLeaseModal: React.FC<DraftLeaseModalProps> = ({
  application,
  currentUser,
  onClose,
  onDraftLease
}) => {
  const [startDate, setStartDate] = useState(application.moveInDate || '2026-09-01');
  
  // Calculate end date (1 year later)
  const calcEndDate = () => {
    const d = new Date(startDate);
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const [endDate, setEndDate] = useState(calcEndDate());
  const [monthlyRent, setMonthlyRent] = useState(String(application.propertyRent));
  const [depositAmount, setDepositAmount] = useState(String(application.propertyRent));
  const [paymentDueDay, setPaymentDueDay] = useState('1');
  const [terms, setTerms] = useState(
    '12-month fixed residential tenancy. Rent is due on the 1st of each month. Quiet hours are 10:00 PM to 7:00 AM daily. Standard tenant insurance required prior to key handover.'
  );
  const [specialClauses, setSpecialClauses] = useState<string[]>([
    'Tenant is responsible for standard in-unit consumable replacements (bulbs, filters).',
    'No smoking or vaping of any substance inside the premises or balconies.',
    'Security deposit is held in a dedicated escrow account in accordance with state regulations.'
  ]);
  const [newClause, setNewClause] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addClause = () => {
    if (newClause.trim()) {
      setSpecialClauses([...specialClauses, newClause.trim()]);
      setNewClause('');
    }
  };

  const removeClause = (index: number) => {
    setSpecialClauses(specialClauses.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onDraftLease({
        applicationId: application.id,
        propertyId: application.propertyId,
        tenantId: application.tenantId,
        startDate,
        endDate,
        monthlyRent: Number(monthlyRent),
        depositAmount: Number(depositAmount),
        paymentDueDay: Number(paymentDueDay),
        terms,
        specialClauses
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to generate lease');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="draft-lease-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <FileSignature className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Prepare Residential Lease Proposal</h2>
              <p className="text-xs text-slate-500">Draft legal tenancy agreement for {application.tenantName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Selected Property</span>
              <strong className="text-slate-900 font-bold">{application.propertyTitle}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-medium">Prospective Tenant</span>
              <strong className="text-slate-900 font-bold">{application.tenantName}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lease Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lease End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent ($)</label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Security Deposit ($)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rent Due Day</label>
              <select
                value={paymentDueDay}
                onChange={(e) => setPaymentDueDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
              >
                <option value="1">1st of the month</option>
                <option value="5">5th of the month</option>
                <option value="15">15th of the month</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Standard Tenancy Terms</label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Special Clauses & House Rules</label>
            
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newClause}
                onChange={(e) => setNewClause(e.target.value)}
                placeholder="Add custom clause (e.g. Assigned parking spot #4B included)..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={addClause}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-1.5">
              {specialClauses.map((clause, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="flex-1 pr-2">• {clause}</span>
                  <button
                    type="button"
                    onClick={() => removeClause(idx)}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{submitting ? 'Generating...' : 'Issue Lease Proposal to Tenant'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
