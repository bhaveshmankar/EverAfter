import { X, ArrowRight, MapPin, Users, Calendar, Star, Heart } from 'lucide-react';
import { Venue } from '../../lib/types/venue';

interface VenueCompareProps {
  venues: Venue[];
  onClose: () => void;
  onRemoveVenue: (id: string) => void;
  onViewDetails: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  wishlistedVenues: string[];
}

// Comparison parameters
const comparisonParams = [
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'capacity', label: 'Capacity', icon: Users },
  { id: 'price', label: 'Price Range', icon: null },
  { id: 'rating', label: 'Rating', icon: Star },
  { id: 'tags', label: 'Features', icon: null },
  { id: 'availability', label: 'Available Dates', icon: Calendar },
];

const VenueCompare = ({ 
  venues, 
  onClose, 
  onRemoveVenue, 
  onViewDetails,
  onToggleWishlist,
  wishlistedVenues
}: VenueCompareProps) => {
  // Format price to INR currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex flex-col overflow-y-auto">
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Compare Venues ({venues.length})</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-[200px_repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {/* Parameter labels column */}
            <div className="bg-gray-50 rounded-lg p-4 sticky left-0 z-10">
              <div className="h-40 flex items-end mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Compare Parameters</h3>
              </div>
              
              {comparisonParams.map(param => (
                <div key={param.id} className="py-4 border-t border-gray-200 flex items-center">
                  {param.icon && <param.icon size={18} className="mr-2 text-gray-500" />}
                  <span className="font-medium text-gray-700">{param.label}</span>
                </div>
              ))}
              
              <div className="py-4 border-t border-gray-200">
                <span className="font-medium text-gray-700">Actions</span>
              </div>
            </div>
            
            {/* Venue columns */}
            {venues.map(venue => (
              <div key={venue.id} className="bg-white rounded-lg shadow p-4 relative min-w-[250px]">
                {/* Remove venue button */}
                <button
                  onClick={() => onRemoveVenue(venue.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={18} />
                </button>
                
                {/* Venue image and name */}
                <div className="h-40 mb-4 relative">
                  <img 
                    src={venue.images[0]} 
                    alt={venue.name} 
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-md"></div>
                  <h3 className="absolute bottom-2 left-2 text-white font-bold">{venue.name}</h3>
                  
                  {/* Wishlist button */}
                  <button 
                    onClick={() => onToggleWishlist(venue.id)}
                    className={`absolute top-2 left-2 p-1 rounded-full ${
                      wishlistedVenues.includes(venue.id) 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    <Heart size={16} className={wishlistedVenues.includes(venue.id) ? 'fill-current' : ''} />
                  </button>
                </div>
                
                {/* Comparison data */}
                <div className="py-4 border-t border-gray-200 flex items-center">
                  <MapPin size={18} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">{venue.location}</span>
                </div>
                
                <div className="py-4 border-t border-gray-200 flex items-center">
                  <Users size={18} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">{venue.capacity.min} - {venue.capacity.max} guests</span>
                </div>
                
                <div className="py-4 border-t border-gray-200">
                  <span className="text-gray-700">{formatPrice(venue.priceRange.min)} - {formatPrice(venue.priceRange.max)}</span>
                </div>
                
                <div className="py-4 border-t border-gray-200 flex items-center">
                  <div className="flex items-center">
                    <Star size={18} className="mr-1 text-yellow-400 fill-current" />
                    <span className="text-gray-700">{venue.rating}</span>
                    <span className="text-gray-500 text-sm ml-1">({venue.reviews} reviews)</span>
                  </div>
                </div>
                
                <div className="py-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {venue.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="py-4 border-t border-gray-200 flex items-center">
                  <Calendar size={18} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">{venue.availability.length} dates available</span>
                </div>
                
                <div className="py-4 border-t border-gray-200">
                  <button
                    onClick={() => onViewDetails(venue.id)}
                    className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  >
                    <span className="mr-1">View Details</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueCompare; 