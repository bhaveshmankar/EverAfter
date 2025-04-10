import { useState } from 'react';
import { 
  MapPin, Calendar, Star, Heart, X, Check, 
  ChevronLeft, Phone, Eye
} from 'lucide-react';
import { Venue } from '../../lib/types/venue';
import VenueBooking from './VenueBooking';
import useAuth from '../../lib/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface VenueDetailProps {
  venue: Venue;
  onClose: () => void;
  onStartVirtualTour: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
}

// Mock amenities data
const amenities = [
  { name: 'Parking', available: true },
  { name: 'WiFi', available: true },
  { name: 'Catering', available: true },
  { name: 'Decoration', available: true },
  { name: 'DJ/Music', available: true },
  { name: 'Accommodation', available: false },
  { name: 'Air Conditioning', available: true },
  { name: 'Alcohol License', available: false },
  { name: 'Bridal Room', available: true },
];

const VenueDetail = ({ 
  venue, 
  onClose, 
  onStartVirtualTour,
  onToggleWishlist,
  isWishlisted
}: VenueDetailProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Format price to INR currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Handle image navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length);
  };
  
  // Handle booking success
  const handleBookingSuccess = (bookingId: string) => {
    console.log('Booking successful!', bookingId);
    setShowBookingModal(false);
  };
  
  // Handle booking button click
  const handleBookNowClick = () => {
    if (isAuthenticated) {
      setShowBookingModal(true);
    } else {
      toast.error('Please login to book this venue');
      // Get the current URL path for redirect after login
      const redirectPath = `/venues?venue=${venue.id}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl overflow-hidden">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md z-10"
          >
            <X size={24} />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Image gallery section (1/3 on desktop) */}
            <div className="md:col-span-2 relative">
              <div className="h-64 md:h-full relative">
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
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full rotate-180"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full">
                  {currentImageIndex + 1}/{venue.images.length}
                </div>
                
                {/* 360 tour button */}
                {venue.hasVirtualTour && (
                  <button 
                    onClick={() => onStartVirtualTour(venue.id)}
                    className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full flex items-center"
                  >
                    <Eye size={18} className="mr-2" />
                    <span>360° Tour</span>
                  </button>
                )}
                
                {/* Wishlist button */}
                <button 
                  onClick={() => onToggleWishlist(venue.id)}
                  className={`absolute top-4 left-36 p-2 rounded-full flex items-center ${
                    isWishlisted 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-white text-gray-700'
                  }`}
                >
                  <Heart size={18} className={isWishlisted ? 'fill-current mr-2' : 'mr-2'} />
                  <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                </button>
              </div>
              
              {/* Thumbnail gallery */}
              <div className="flex overflow-x-auto p-2 bg-gray-100">
                {venue.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-14 mx-1 rounded overflow-hidden ${
                      currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Details & Booking section (2/3 on desktop) */}
            <div className="p-6 max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{venue.name}</h2>
              
              <div className="flex items-center mb-4">
                <MapPin size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-600">{venue.location}</span>
                <div className="ml-auto flex items-center">
                  <Star size={16} className="text-yellow-500 mr-1" />
                  <span className="font-medium">{venue.rating}</span>
                  <span className="text-gray-500 ml-1">({venue.reviews} reviews)</span>
                </div>
              </div>
              
              <div className="border-t border-b py-4 my-4">
                <div className="flex flex-wrap -mx-2">
                  <div className="px-2 w-1/2">
                    <div className="mb-4">
                      <h3 className="text-sm text-gray-500 mb-1">Price Range</h3>
                      <p className="font-semibold">
                        {formatPrice(venue.priceRange.min)} - {formatPrice(venue.priceRange.max)}
                      </p>
                    </div>
                  </div>
                  <div className="px-2 w-1/2">
                    <div className="mb-4">
                      <h3 className="text-sm text-gray-500 mb-1">Capacity</h3>
                      <p className="font-semibold">{venue.capacity.min} - {venue.capacity.max} guests</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="my-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{venue.description}</p>
              </div>
              
              <div className="my-6">
                <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity, index) => (
                    <div 
                      key={index}
                      className="flex items-center"
                    >
                      {amenity.available ? (
                        <Check size={16} className="text-green-500 mr-2" />
                      ) : (
                        <X size={16} className="text-red-500 mr-2" />
                      )}
                      <span className={amenity.available ? 'text-gray-700' : 'text-gray-400'}>
                        {amenity.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleBookNowClick}
                  className="w-full py-3 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 flex items-center justify-center"
                >
                  <Calendar className="mr-2" size={18} />
                  Check Availability & Book Now
                </button>
              </div>

              {/* Display call support option */}
              <div className="mt-4 flex items-center justify-center">
                <Phone size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-500 text-sm">Need help? Call our Venue Expert</span>
              </div>

              {/* VenueBooking Modal */}
              {showBookingModal && (
                <VenueBooking
                  venue={venue}
                  onClose={() => setShowBookingModal(false)}
                  onSuccess={handleBookingSuccess}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetail; 