import React, { useState } from 'react';
import { Property, User } from '../types';
import { 
  X, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Heart, 
  Check, 
  Clock, 
  Phone, 
  Mail, 
  UserCheck, 
  Sparkles, 
  AlertCircle,
  Building,
  DollarSign,
  Briefcase,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PropertyDetailsModalProps {
  property: Property;
  currentUser: User | null;
  isShortlisted: boolean;
  onClose: () => void;
  onToggleShortlist: (id: string) => void;
  onRequestVisit: (data: { propertyId: string; date: string; timeSlot: string; visitType: string; notes?: string }) => Promise<void>;
  onSubmitApplication: (data: any) => Promise<void>;
  onVerifyProperty?: (propertyId: string, approved: boolean, notes?: string) => Promise<void>;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  currentUser,
  isShortlisted,
  onClose,
  onToggleShortlist,
  onRequestVisit,
  onSubmitApplication,
  onVerifyProperty
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeActionTab, setActiveActionTab] = useState<'overview' | 'tour' | 'apply' | 'admin_verify'>('overview');

  // Tour Form State
  const [tourDate, setTourDate] = useState('2026-09-02');
  const [tourTimeSlot, setTourTimeSlot] = useState('14:00 - 14:45');
  const [tourType, setTourType] = useState<'IN_PERSON' | 'VIRTUAL'>('IN_PERSON');
  const [tourNotes, setTourNotes] = useState('');
  const [tourSubmitting, setTourSubmitting] = useState(false);
  const [tourSuccess, setTourSuccess] = useState(false);

  // Application Form State
  const [monthlyIncome, setMonthlyIncome] = useState(currentUser?.monthlyIncome ? String(currentUser.monthlyIncome) : '12500');
  const [occupation, setOccupation] = useState(currentUser?.occupation || 'Software Engineer');
  const [employer, setEmployer] = useState(currentUser?.employer || 'Cloud Scale Corp');
  const [creditScore, setCreditScore] = useState(currentUser?.creditScore ? String(currentUser.creditScore) : '760');
  const [moveInDate, setMoveInDate] = useState('2026-09-01');
  const [leaseTermMonths, setLeaseTermMonths] = useState('12');
  const [occupantsCount, setOccupantsCount] = useState('1');
  const [hasPets, setHasPets] = useState(property.petFriendly);
  const [petDetails, setPetDetails] = useState('');
  const [backgroundConsent, setBackgroundConsent] = useState(true);
  const [refName, setRefName] = useState('Sarah Jenkins');
  const [refRel, setRefRel] = useState('Previous Landlord');
  const [refPhone, setRefPhone] = useState('+1 (555) 309-8811');
  const [refEmail, setRefEmail] = useState('sarah.jenkins@rentalmgmt.com');
  const [appMessage, setAppMessage] = useState('Very excited to rent this unit. Clean, quiet, and reliable tenant history.');
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);

  // Admin verification state
  const [adminNotes, setAdminNotes] = useState('Municipal registry & safety inspection verified.');
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTourSubmitting(true);
    try {
      await onRequestVisit({
        propertyId: property.id,
        date: tourDate,
        timeSlot: tourTimeSlot,
        visitType: tourType,
        notes: tourNotes
      });
      setTourSuccess(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.message || 'Failed to schedule tour');
    } finally {
      setTourSubmitting(false);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backgroundConsent) {
      alert('Please agree to the background check authorization');
      return;
    }
    setAppSubmitting(true);
    try {
      await onSubmitApplication({
        propertyId: property.id,
        monthlyIncome: Number(monthlyIncome),
        occupation,
        employer,
        creditScoreEstimate: Number(creditScore),
        moveInDate,
        leaseTermMonths: Number(leaseTermMonths),
        occupantsCount: Number(occupantsCount),
        hasPets,
        petDetails: hasPets ? petDetails : undefined,
        backgroundCheckConsent: backgroundConsent,
        references: refName ? [{ name: refName, relationship: refRel, phone: refPhone, email: refEmail }] : [],
        message: appMessage
      });
      setAppSuccess(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setAppSubmitting(false);
    }
  };

  return (
    <div id="property-details-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs">
              {property.propertyType}
            </div>
            {property.status === 'ACTIVE' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Platform Verified
              </span>
            )}
            {property.status === 'PENDING_VERIFICATION' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Clock className="w-3.5 h-3.5" /> Pending Verification
              </span>
            )}
            {property.status === 'RENTED' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-full">
                <Check className="w-3.5 h-3.5" /> Leased / Rented
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleShortlist(property.id)}
              className={`p-2 rounded-full border transition cursor-pointer ${
                isShortlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-slate-200 text-slate-600 hover:text-rose-500'
              }`}
              title="Bookmark property"
            >
              <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Tabs Selector */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveActionTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeActionTab === 'overview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Property Details & Specs
          </button>
          
          {property.status === 'ACTIVE' && (
            <>
              <button
                onClick={() => setActiveActionTab('tour')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeActionTab === 'tour'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Schedule a Tour
              </button>

              <button
                onClick={() => setActiveActionTab('apply')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeActionTab === 'apply'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" /> Submit Application
              </button>
            </>
          )}

          {currentUser?.role === 'ADMIN' && property.status === 'PENDING_VERIFICATION' && (
            <button
              onClick={() => setActiveActionTab('admin_verify')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeActionTab === 'admin_verify'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-purple-600 hover:text-purple-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Verification
            </button>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeActionTab === 'overview' && (
            <>
              {/* Photo Showcase */}
              <div>
                <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 mb-2 border border-slate-200">
                  <img
                    src={property.images[activeImageIndex] || property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {property.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {property.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                          activeImageIndex === i ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Key Pricing */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{property.title}</h1>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{property.address}, {property.city}, {property.state} {property.zip}</span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">${property.rentAmount.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 ml-1">/ month</span>
                  <p className="text-xs text-slate-400 font-medium">Security Deposit: ${property.depositAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Verified Badge / Compliance Details */}
              {property.verifiedBy && (
                <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Verified Compliance Guarantee</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">{property.verificationNotes || 'Verified ownership deed and safety standards.'}</p>
                    <p className="text-[10px] text-emerald-600 mt-1">Verified by {property.verifiedBy} on {new Date(property.verifiedAt || '').toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {/* Spec Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-slate-400 text-xs font-medium block">Bedrooms</span>
                  <span className="text-base font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <Bed className="w-4 h-4 text-slate-600" /> {property.bedrooms} Beds
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-slate-400 text-xs font-medium block">Bathrooms</span>
                  <span className="text-base font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <Bath className="w-4 h-4 text-slate-600" /> {property.bathrooms} Baths
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-slate-400 text-xs font-medium block">Living Space</span>
                  <span className="text-base font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <Square className="w-4 h-4 text-slate-600" /> {property.squareFeet.toLocaleString()} sqft
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-slate-400 text-xs font-medium block">Available Date</span>
                  <span className="text-base font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                    <Calendar className="w-4 h-4 text-slate-600" /> {property.availableDate}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">About This Property</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* Amenities List */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Amenities & Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Landlord Contact Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {property.ownerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{property.ownerName}</p>
                    <p className="text-[11px] text-slate-500">Verified Property Manager</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a href={`tel:${property.ownerPhone}`} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  <a href={`mailto:${property.ownerEmail}`} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </a>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: SCHEDULE A TOUR */}
          {activeActionTab === 'tour' && (
            <div className="max-w-xl mx-auto py-2">
              {tourSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950">Tour Request Dispatched!</h3>
                  <p className="text-xs text-emerald-800">
                    Your {tourType.toLowerCase().replace('_', ' ')} tour request for <strong>{tourDate} ({tourTimeSlot})</strong> has been sent to {property.ownerName}. You will receive a notification as soon as it is confirmed.
                  </p>
                  <button
                    onClick={() => setActiveActionTab('overview')}
                    className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Back to Property
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTourSubmit} className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Schedule a Property Tour</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Select your preferred date, time slot, and visit format.</p>
                  </div>

                  {/* Visit Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTourType('IN_PERSON')}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                        tourType === 'IN_PERSON' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      🚶 In-Person Walkthrough
                    </button>
                    <button
                      type="button"
                      onClick={() => setTourType('VIRTUAL')}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                        tourType === 'VIRTUAL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      📹 Virtual Live Video
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={tourDate}
                        onChange={(e) => setTourDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Available Time Slot</label>
                      <select
                        value={tourTimeSlot}
                        onChange={(e) => setTourTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="10:00 - 10:45">Morning (10:00 AM - 10:45 AM)</option>
                        <option value="11:30 - 12:15">Midday (11:30 AM - 12:15 PM)</option>
                        <option value="14:00 - 14:45">Afternoon (2:00 PM - 2:45 PM)</option>
                        <option value="16:00 - 16:45">Late Afternoon (4:00 PM - 4:45 PM)</option>
                        <option value="18:00 - 18:45">Evening (6:00 PM - 6:45 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tour Notes or Questions (Optional)</label>
                    <textarea
                      rows={3}
                      value={tourNotes}
                      onChange={(e) => setTourNotes(e.target.value)}
                      placeholder="e.g. Please show the parking spot and rooftop terrace."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={tourSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {tourSubmitting ? 'Submitting Request...' : 'Confirm & Request Tour'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SUBMIT RENTAL APPLICATION */}
          {activeActionTab === 'apply' && (
            <div className="max-w-2xl mx-auto py-2">
              {appSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950">Rental Application Submitted!</h3>
                  <p className="text-xs text-emerald-800">
                    Your complete application and background profile for <strong>{property.title}</strong> has been transmitted. The landlord will review your file and generate the digital lease agreement.
                  </p>
                  <button
                    onClick={() => setActiveActionTab('overview')}
                    className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Back to Property
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">AI Instant Underwriting & Screening</h4>
                      <p className="text-[11px] text-blue-700">Your profile is automatically analyzed against property requirements for swift landlord decision.</p>
                    </div>
                  </div>

                  {/* Section: Financials */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Income & Employment
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Monthly Gross Income ($)</label>
                        <input
                          type="number"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Credit Score Estimate</label>
                        <input
                          type="number"
                          value={creditScore}
                          onChange={(e) => setCreditScore(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Occupation</label>
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Employer / Enterprise</label>
                        <input
                          type="text"
                          value={employer}
                          onChange={(e) => setEmployer(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Lease Details */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> Desired Tenancy Details
                    </h4>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Move-In Date</label>
                        <input
                          type="date"
                          value={moveInDate}
                          onChange={(e) => setMoveInDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Lease Length</label>
                        <select
                          value={leaseTermMonths}
                          onChange={(e) => setLeaseTermMonths(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                        >
                          <option value="12">12 Months</option>
                          <option value="6">6 Months</option>
                          <option value="18">18 Months</option>
                          <option value="24">24 Months</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Total Occupants</label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={occupantsCount}
                          onChange={(e) => setOccupantsCount(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                        <input
                          type="checkbox"
                          checked={hasPets}
                          onChange={(e) => setHasPets(e.target.checked)}
                          className="rounded text-slate-900 focus:ring-0"
                        />
                        <span>I will be bringing pets (dogs, cats, service animals)</span>
                      </label>
                      {hasPets && (
                        <input
                          type="text"
                          placeholder="e.g. 1 golden retriever (35 lbs, trained)"
                          value={petDetails}
                          onChange={(e) => setPetDetails(e.target.value)}
                          className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                        />
                      )}
                    </div>
                  </div>

                  {/* Reference */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-purple-600" /> Reference Contact
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Reference Name"
                          value={refName}
                          onChange={(e) => setRefName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Relationship (e.g. Previous Landlord)"
                          value={refRel}
                          onChange={(e) => setRefRel(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={refPhone}
                          onChange={(e) => setRefPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={refEmail}
                          onChange={(e) => setRefEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Background Consent */}
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={backgroundConsent}
                        onChange={(e) => setBackgroundConsent(e.target.checked)}
                        className="mt-0.5 rounded text-slate-900 focus:ring-0"
                      />
                      <span>I authorize RentMate and the landlord to perform identity, credit, and employment verification checks in compliance with Fair Housing guidelines.</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={appSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {appSubmitting ? 'Evaluating & Submitting Application...' : 'Submit Official Rental Application'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: ADMIN VERIFICATION */}
          {activeActionTab === 'admin_verify' && onVerifyProperty && (
            <div className="max-w-xl mx-auto py-3 space-y-4">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-700" /> Platform Compliance & Deed Verification
                </h3>
                <p className="text-xs text-purple-800 mt-1">
                  Inspect the property ownership records, local rental registry compliance, and habitability standards before authorizing onto the public marketplace.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Auditor Verification Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={adminSubmitting}
                  onClick={async () => {
                    setAdminSubmitting(true);
                    await onVerifyProperty(property.id, true, adminNotes);
                    setAdminSubmitting(false);
                    onClose();
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
                >
                  ✓ Approve & Publish to Active Marketplace
                </button>
                <button
                  type="button"
                  disabled={adminSubmitting}
                  onClick={async () => {
                    setAdminSubmitting(true);
                    await onVerifyProperty(property.id, false, adminNotes);
                    setAdminSubmitting(false);
                    onClose();
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-3 rounded-xl transition cursor-pointer"
                >
                  ✕ Reject Listing
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
