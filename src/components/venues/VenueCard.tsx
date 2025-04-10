import { useState } from 'react';
import { MapPin, Calendar, Users, Star, Heart, ArrowRight, Eye } from 'lucide-react';
import { Venue } from '../../lib/types/venue';

interface VenueCardProps {
  venue: Venue;
  onViewDetails: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onStartVirtualTour: (id: string) => void;
  isWishlisted: boolean;
}

const VenueCard = ({ 
  venue, 
  onViewDetails, 
  onToggleWishlist, 
  onStartVirtualTour,
  isWishlisted 
}: VenueCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Format price to INR currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Handle image navigation
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:translate-y-[-4px]">
      {/* Image section with navigation */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={venue.images[currentImageIndex]} 
          alt={venue.name} 
          className="w-full h-full object-cover"
        />
        
        {/* Image navigation buttons */}
        {venue.images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}
        
        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          {currentImageIndex + 1}/{venue.images.length}
        </div>
        
        {/* Wishlist button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(venue.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isWishlisted 
              ? 'bg-rose-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
        </button>
        
        {/* Virtual tour button */}
        {venue.hasVirtualTour && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStartVirtualTour(venue.id);
            }}
            className="absolute top-2 left-2 bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50"
          >
            <Eye size={18} />
          </button>
        )}
        
        {/* Tags */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {venue.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {venue.tags.length > 3 && (
            <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
              +{venue.tags.length - 3}
            </span>
          )}
        </div>
      </div>
      
      {/* Venue details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800">{venue.name}</h3>
          <div className="flex items-center">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span className="ml-1 text-gray-700">{venue.rating}</span>
            <span className="text-gray-500 text-sm ml-1">({venue.reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">{venue.location}</span>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex items-center text-gray-600">
            <Users size={16} className="mr-1" />
            <span className="text-sm">{venue.capacity.min} - {venue.capacity.max} guests</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-1" />
            <span className="text-sm">{venue.availability.length} dates available</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Starting from</p>
            <p className="text-xl font-bold text-gray-800">{formatPrice(venue.priceRange.min)}</p>
          </div>
          <button
            onClick={() => onViewDetails(venue.id)}
            className="flex items-center text-rose-600 hover:text-rose-700"
          >
            <span className="mr-1">View Details</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueCard; 