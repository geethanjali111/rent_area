import React, { useState } from 'react';
import { PaymentInvoice, User } from '../types';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building, 
  ShieldCheck, 
  Receipt, 
  Download, 
  ArrowUpRight, 
  Calendar,
  Lock,
  Landmark,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentsViewProps {
  invoices: PaymentInvoice[];
  currentUser: User | null;
  onPayInvoice: (invoiceId: string, paymentMethod: string) => Promise<void>;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  invoices,
  currentUser,
  onPayInvoice
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<PaymentInvoice | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'ACH' | 'CARD' | 'ESCROW'>('ACH');
  const [paying, setPaying] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState<PaymentInvoice | null>(null);

  const isOwner = currentUser?.role === 'OWNER';
  const isAdmin = currentUser?.role === 'ADMIN';

  const filteredInvoices = invoices.filter(inv => {
    if (filterType === 'ALL') return true;
    return inv.status === filterType;
  });

  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0);
  const totalDepositEscrow = invoices.filter(i => i.invoiceType === 'SECURITY_DEPOSIT' && i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);

  const handlePay = async () => {
    if (!activePaymentInvoice) return;
    setPaying(true);
    try {
      await onPayInvoice(activePaymentInvoice.id, selectedMethod);
      const updatedInv = { ...activePaymentInvoice, status: 'PAID' as const, paidAt: new Date().toISOString() };
      setPaidReceipt(updatedInv);
      setActivePaymentInvoice(null);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setPaying(false);
    }
  };

  const getStatusBadge = (status: PaymentInvoice['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled & Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Due
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Overdue
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="payments-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payments & Escrow Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isOwner
              ? 'Track incoming rental disbursements, security deposits in escrow, and payment history.'
              : 'Pay monthly rent, view official receipts, and manage security deposit escrows.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterType(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                filterType === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Invoices' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isOwner ? 'Total Revenue Settled' : 'Total Rent Paid'}
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">${totalPaid.toLocaleString()}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">✓ 100% Real-Time Settlement</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isOwner ? 'Outstanding Invoices' : 'Pending Rent Due'}
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">${totalPending.toLocaleString()}</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{invoices.filter(i => i.status === 'PENDING').length} Invoices Pending</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Deposit Escrow</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">${totalDepositEscrow.toLocaleString()}</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">🛡️ FDIC-Insured Escrow Account</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Invoice Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Payment Ledger & Invoices</h3>
          <span className="text-xs text-slate-500 font-medium">{filteredInvoices.length} records</span>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No invoices matching the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map(inv => {
              const isPaid = inv.status === 'PAID';
              const canPay = !isPaid && (currentUser?.role === 'TENANT' || currentUser?.role === 'ADMIN');

              return (
                <div key={inv.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{inv.description}</span>
                      <span className="text-[10px] font-mono text-slate-400">#{inv.id.slice(0, 8)}</span>
                      {getStatusBadge(inv.status)}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Property: <strong className="text-slate-700">{inv.propertyTitle}</strong></span>
                      <span>Due: <strong className="text-slate-700">{new Date(inv.dueDate).toLocaleDateString()}</strong></span>
                      {isPaid && inv.paidAt && (
                        <span className="text-emerald-700 font-medium">Paid on {new Date(inv.paidAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">${inv.amount.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{inv.invoiceType.replace('_', ' ')}</p>
                    </div>

                    {canPay && (
                      <button
                        onClick={() => setActivePaymentInvoice(inv)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Pay Now</span>
                      </button>
                    )}

                    {isPaid && (
                      <button
                        onClick={() => setPaidReceipt(inv)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pay Modal */}
      {activePaymentInvoice && (
        <div id="payment-checkout-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Secure Payment Checkout</h3>
                <p className="text-xs text-slate-400">RentMate Escrow & Payment Processing</p>
              </div>
              <button onClick={() => setActivePaymentInvoice(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Amount Due</span>
                <h2 className="text-3xl font-black text-slate-900 mt-1">${activePaymentInvoice.amount.toLocaleString()}</h2>
                <p className="text-xs text-slate-600 font-medium mt-1">{activePaymentInvoice.description}</p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Select Payment Method</label>
                
                <div
                  onClick={() => setSelectedMethod('ACH')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedMethod === 'ACH' ? 'border-slate-900 bg-slate-900/5 font-semibold text-slate-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold">Direct ACH Bank Debit</p>
                      <p className="text-[10px] text-slate-500">Chase Premier Checking (•••• 4920) • No Fee</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">0% Fee</span>
                </div>

                <div
                  onClick={() => setSelectedMethod('CARD')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedMethod === 'CARD' ? 'border-slate-900 bg-slate-900/5 font-semibold text-slate-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold">Credit / Debit Card</p>
                      <p className="text-[10px] text-slate-500">Visa ending in •••• 8841</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">Instant</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>256-bit encrypted bank connection. Receipts are logged to your tenancy record.</span>
              </div>

              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{paying ? 'Authorizing & Settling...' : `Authorize & Pay $${activePaymentInvoice.amount.toLocaleString()}`}</span>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {paidReceipt && (
        <div id="payment-receipt-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            
            <div className="p-6 text-center bg-emerald-50 border-b border-emerald-100">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-emerald-950">Payment Settled Successfully</h3>
              <p className="text-xs text-emerald-700">Official Electronic Receipt</p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono text-slate-800 font-bold">{paidReceipt.transactionRef || 'TXN-' + paidReceipt.id.slice(0, 10)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Invoice Purpose</span>
                <span className="text-slate-800 font-bold">{paidReceipt.description}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Property</span>
                <span className="text-slate-800 font-bold">{paidReceipt.propertyTitle}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Payment Amount</span>
                <span className="text-slate-900 font-extrabold text-sm">${paidReceipt.amount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Settled On</span>
                <span className="text-slate-800 font-medium">{new Date(paidReceipt.paidAt || '').toLocaleString()}</span>
              </div>

              <button
                onClick={() => setPaidReceipt(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer mt-2"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
