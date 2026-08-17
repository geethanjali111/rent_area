import React, { useState } from 'react';
import { Property, PropertyType, User } from '../types';
import { 
  X, 
  Sparkles, 
  Building, 
  DollarSign, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { api } from '../lib/api';

interface AddPropertyModalProps {
  initialProperty?: Property | null;
  currentUser: User | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const POPULAR_AMENITIES = [
  'Central A/C & Heating',
  'In-Unit Washer & Dryer',
  'EV Charging Station',
  '24/7 Concierge & Security',
  'Rooftop Deck / Balcony',
  'Fitness & Wellness Center',
  'High-Speed Fiber Internet',
  'Dishwasher',
  'Hardwood Flooring',
  'Pet Friendly / Dog Park',
  'Swimming Pool',
  'Secure Garage Parking'
];

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  initialProperty,
  currentUser,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(initialProperty?.title || '');
  const [description, setDescription] = useState(initialProperty?.description || '');
  const [address, setAddress] = useState(initialProperty?.address || '');
  const [city, setCity] = useState(initialProperty?.city || 'Seattle');
  const [state, setState] = useState(initialProperty?.state || 'WA');
  const [zip, setZip] = useState(initialProperty?.zip || '98101');
  const [propertyType, setPropertyType] = useState<PropertyType>(initialProperty?.propertyType || 'APARTMENT');
  const [rentAmount, setRentAmount] = useState(initialProperty?.rentAmount ? String(initialProperty.rentAmount) : '3200');
  const [depositAmount, setDepositAmount] = useState(initialProperty?.depositAmount ? String(initialProperty.depositAmount) : '3200');
  const [bedrooms, setBedrooms] = useState(initialProperty?.bedrooms ? String(initialProperty.bedrooms) : '2');
  const [bathrooms, setBathrooms] = useState(initialProperty?.bathrooms ? String(initialProperty.bathrooms) : '2');
  const [squareFeet, setSquareFeet] = useState(initialProperty?.squareFeet ? String(initialProperty.squareFeet) : '1150');
  const [availableDate, setAvailableDate] = useState(initialProperty?.availableDate || '2026-09-01');
  const [furnished, setFurnished] = useState(Boolean(initialProperty?.furnished));
  const [petFriendly, setPetFriendly] = useState(initialProperty?.petFriendly ?? true);
  const [parkingSpaces, setParkingSpaces] = useState(initialProperty?.parkingSpaces ? String(initialProperty.parkingSpaces) : '1');
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialProperty?.amenities || ['Central A/C & Heating', 'In-Unit Washer & Dryer', 'Dishwasher']
  );
  
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialProperty?.images || [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');

  const [aiGenerating, setAiGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAiGenerate = async () => {
    if (!title || !city) {
      alert('Please enter a title and city first so AI can tailor the listing description.');
      return;
    }
    setAiGenerating(true);
    try {
      const res = await api.aiGenerateDescription({
        title,
        propertyType,
        city,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        amenities: selectedAmenities,
        rentAmount: Number(rentAmount)
      });
      if (res.description) {
        setDescription(res.description);
      }
    } catch (err: any) {
      alert(err.message || 'AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (submitForVerification: boolean) => {
    if (!title || !address || !city || !rentAmount) {
      alert('Please fill in title, address, city, and rent amount');
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        title,
        description,
        address,
        city,
        state,
        zip,
        propertyType,
        rentAmount: Number(rentAmount),
        depositAmount: Number(depositAmount),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        squareFeet: Number(squareFeet),
        availableDate,
        furnished,
        petFriendly,
        parkingSpaces: Number(parkingSpaces),
        amenities: selectedAmenities,
        images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200'],
        submitForVerification
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="add-property-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {initialProperty ? 'Edit Property Listing' : 'List New Rental Property'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter property specifications, upload photos, and request platform verification.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Section 1: Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-700" /> Basic Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Headline / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Luminary Skyline Penthouse with Private Terrace"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white"
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">Single Family House</option>
                  <option value="CONDO">Luxury Condo</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="STUDIO">Studio Flat</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address & Unit</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 888 2nd Avenue, Unit 4202"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Specs */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Pricing & Dimensions
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent ($)</label>
                <input
                  type="number"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Square Feet</label>
                <input
                  type="number"
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available Date</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parking Spaces</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>
              <div className="flex flex-col justify-end gap-1">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={petFriendly}
                    onChange={(e) => setPetFriendly(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span>Pet Friendly</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={furnished}
                    onChange={(e) => setFurnished(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span>Furnished</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Description with AI Assist */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Property Description
              </label>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiGenerating}
                className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                {aiGenerating ? 'AI Generating Copy...' : '✨ AI Generate Description'}
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the unique features, views, and layout of this property..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Section 4: Amenities */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Amenities & Perks
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_AMENITIES.map((amenity, i) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`p-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{amenity}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Photo Gallery URLs */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-700" /> Photo URLs
            </label>
            
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste high-res image URL (e.g. Unsplash)..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={addImageUrl}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto py-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-24 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 group">
                  <img src={url} alt="prop" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(i)}
                    className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{submitting ? 'Submitting...' : 'Submit for Admin Verification'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
