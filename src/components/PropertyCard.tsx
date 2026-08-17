import React from 'react';
import { Property, User } from '../types';
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Calendar, 
  FileText, 
  Check, 
  Sparkles,
  PawPrint,
  Armchair,
  Car
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  currentUser: User | null;
  isShortlisted: boolean;
  onToggleShortlist: (id: string) => void;
  onSelectProperty: (property: Property) => void;
  onOpenBookTour?: (property: Property) => void;
  onOpenApply?: (property: Property) => void;
  onEditProperty?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  currentUser,
  isShortlisted,
  onToggleShortlist,
  onSelectProperty,
  onOpenBookTour,
  onOpenApply,
  onEditProperty
}) => {
  const isOwner = currentUser?.id === property.ownerId;
  const isAdmin = currentUser?.role === 'ADMIN';

  const getStatusBadge = () => {
    switch (property.status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur-md shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            Verified Listing
          </span>
        );
      case 'RENTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-amber-300 backdrop-blur-md shadow-xs">
            <Check className="w-3.5 h-3.5" />
            Currently Rented
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Under Verification
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/90 text-slate-200 backdrop-blur-md shadow-xs">
            Draft
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-600/90 text-white backdrop-blur-md shadow-xs">
            Changes Requested
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      id={`property-card-${property.id}`}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
          <img
            src={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {getStatusBadge()}
            {property.featured && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-900 uppercase tracking-wider shadow-xs">
                Featured
              </span>
            )}
          </div>

          {/* Shortlist Heart Button */}
          <button
            id={`shortlist-btn-${property.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleShortlist(property.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition cursor-pointer ${
              isShortlisted
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
            }`}
            title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
          >
            <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Bottom Property Type Tag */}
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[11px] font-semibold text-white">
            {property.propertyType}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Price Header */}
          <div className="flex items-baseline justify-between mb-1.5">
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                ${property.rentAmount.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium ml-1">/ month</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Deposit: ${property.depositAmount.toLocaleString()}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectProperty(property)}
            className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition line-clamp-1 cursor-pointer"
            title={property.title}
          >
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{property.address}, {property.city}, {property.state}</span>
          </div>

          {/* Key Specs Row */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.squareFeet.toLocaleString()} sqft</span>
            </div>
          </div>

          {/* Quick Perks Pill Row */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3 text-[11px] text-slate-600">
            {property.petFriendly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                <PawPrint className="w-3 h-3" /> Pet Friendly
              </span>
            )}
            {property.furnished && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                <Armchair className="w-3 h-3" /> Furnished
              </span>
            )}
            {property.parkingSpaces > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                <Car className="w-3 h-3" /> {property.parkingSpaces} Parking
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2 flex items-center gap-2">
        <button
          id={`view-details-btn-${property.id}`}
          onClick={() => onSelectProperty(property)}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-center"
        >
          View Details
        </button>

        {property.status === 'ACTIVE' && (
          <>
            {onOpenBookTour && (
              <button
                id={`book-tour-btn-${property.id}`}
                onClick={() => onOpenBookTour(property)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer"
                title="Schedule a Tour"
              >
                <Calendar className="w-4 h-4" />
              </button>
            )}
            {onOpenApply && (
              <button
                id={`apply-btn-${property.id}`}
                onClick={() => onOpenApply(property)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Apply Now
              </button>
            )}
          </>
        )}

        {(isOwner || isAdmin) && onEditProperty && (
          <button
            id={`edit-property-btn-${property.id}`}
            onClick={() => onEditProperty(property)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Manage
          </button>
        )}
      </div>
    </div>
  );
};
