import React, { useState } from 'react';
import { Lease, User } from '../types';
import { 
  X, 
  ShieldCheck, 
  FileCheck, 
  DollarSign, 
  Calendar, 
  Check, 
  Lock, 
  Download, 
  Building, 
  UserCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeaseModalProps {
  lease: Lease;
  currentUser: User | null;
  onClose: () => void;
  onSignLease: (leaseId: string, signatureName: string) => Promise<void>;
}

export const LeaseModal: React.FC<LeaseModalProps> = ({
  lease,
  currentUser,
  onClose,
  onSignLease
}) => {
  const [signatureName, setSignatureName] = useState(currentUser?.name || lease.tenantName || '');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(lease.status === 'ACTIVE');

  const isTenantSigner = currentUser?.id === lease.tenantId || currentUser?.role === 'ADMIN';

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim()) {
      alert('Please type your legal full name for the digital signature');
      return;
    }
    if (!agreedTerms) {
      alert('Please check the box confirming you have read and agree to all terms');
      return;
    }

    setSigning(true);
    try {
      await onSignLease(lease.id, signatureName.trim());
      setSignedSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      alert(err.message || 'Failed to sign lease');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div id="lease-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Residential Tenancy Agreement</h2>
              <p className="text-xs text-slate-400">Standard Legal Lease Contract • Binding Agreement</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document Scroll Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 bg-slate-50/50">
          
          {/* Status Alert Banner */}
          {lease.status === 'ACTIVE' ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Fully Executed & Legally Active</h4>
                <p className="text-xs text-emerald-800">
                  Signed by Landlord ({lease.ownerName}) and Tenant ({lease.tenantSignatureName || lease.tenantName}) on {new Date(lease.tenantSignedAt || lease.updatedAt).toLocaleDateString()}.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center gap-3">
              <Lock className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">Awaiting Tenant Digital Signature</h4>
                <p className="text-xs text-purple-800">
                  Review the full covenant terms, financial schedule, and sign below to activate your tenancy.
                </p>
              </div>
            </div>
          )}

          {/* Core Contract Terms Card */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Section 1: Tenancy Particulars</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Demised Premises (Property)</span>
                <strong className="text-slate-900 font-bold text-sm">{lease.propertyTitle}</strong>
                <p className="text-slate-600 mt-0.5">{lease.propertyAddress}</p>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Lease Term & Validity</span>
                <strong className="text-slate-900 font-bold text-sm">
                  {new Date(lease.startDate).toLocaleDateString()} — {new Date(lease.endDate).toLocaleDateString()}
                </strong>
                <p className="text-slate-600 mt-0.5">12-Month Renewable Fixed Term</p>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Lessor (Landlord / Property Manager)</span>
                <strong className="text-slate-900 font-bold">{lease.ownerName}</strong>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Lessee (Designated Tenant)</span>
                <strong className="text-slate-900 font-bold">{lease.tenantName}</strong> ({lease.tenantEmail})
              </div>
            </div>
          </div>

          {/* Financial Schedule */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Section 2: Rent & Security Deposit Schedule</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs block">Monthly Base Rent</span>
                <span className="text-lg font-black text-slate-900">${lease.monthlyRent.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Due on {lease.paymentDueDay}st of each month</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs block">Security Deposit Escrow</span>
                <span className="text-lg font-black text-slate-900">${lease.depositAmount.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Refundable upon lease conclusion</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs block">Security Deposit Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                  lease.securityDepositPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {lease.securityDepositPaid ? '✓ Paid into Escrow' : 'Pending Payment'}
                </span>
              </div>
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Section 3: Statutory Covenants & Special Clauses</h3>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {lease.terms}
            </p>

            <ul className="space-y-1.5 pt-2">
              {lease.specialClauses.map((clause, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{clause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Digital Signature Pad Area */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-700" /> Digital Signatures & Execution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Landlord signature */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Landlord Signature</span>
                <p className="font-serif italic text-base text-slate-900 mt-1">{lease.ownerName}</p>
                <p className="text-[10px] text-slate-500 mt-1">Authenticated on {new Date(lease.ownerSignedAt).toLocaleDateString()}</p>
              </div>

              {/* Tenant signature */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Tenant Signature</span>
                {lease.status === 'ACTIVE' ? (
                  <>
                    <p className="font-serif italic text-base text-emerald-700 mt-1">{lease.tenantSignatureName || lease.tenantName}</p>
                    <p className="text-[10px] text-emerald-600 mt-1">
                      Authenticated: {new Date(lease.tenantSignedAt || lease.updatedAt).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-amber-700 font-semibold mt-1">Pending signature below</p>
                )}
              </div>
            </div>

            {/* Signature Form if not active */}
            {lease.status !== 'ACTIVE' && isTenantSigner && (
              <form onSubmit={handleSign} className="pt-3 border-t border-slate-100 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Type Your Legal Full Name to Authenticate Digital Signature
                  </label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    required
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 font-serif italic focus:border-slate-900 focus:outline-hidden bg-amber-50/40"
                  />
                </div>

                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    required
                    className="mt-0.5 rounded text-slate-900"
                  />
                  <span>
                    I confirm that I have reviewed the entirety of this Residential Tenancy Agreement, accept all covenants and rent obligations, and consent to executing this document as a legally binding contract.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={signing}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>{signing ? 'Executing Lease...' : 'Digitally Sign & Activate Lease Agreement'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">Contract ID: {lease.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            Close Agreement
          </button>
        </div>

      </div>
    </div>
  );
};
