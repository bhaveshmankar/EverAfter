import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, MapPin, Users, Star, ArrowRight, Search } from 'lucide-react';
import { Venue } from '../lib/types/venue';
import VenueBooking from '../components/venues/VenueBooking';
import toast from 'react-hot-toast';

// Featured venues data (in a real app, this would come from a database)
const featuredVenues: Venue[] = [
  {
    id: "1a2b3c4d-5e6f-7890-abc1-def23456789a",
    name: 'The Grand Palace',
    location: 'Mumbai, Maharashtra',
    priceRange: {
      min: 150000,
      max: 500000,
    },
    rating: 4.8,
    reviews: 156,
    capacity: {
      min: 100,
      max: 500,
    },
    mainImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['Banquet Hall', 'Pool', 'Garden', 'Parking', '5-Star'],
    description: 'An exquisite palace venue with stunning architecture and modern amenities. Perfect for grand celebrations.',
    hasVirtualTour: true,
    virtualTourImages: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { name: 'Wi-Fi', icon: 'wifi' },
      { name: 'Parking', icon: 'parking' },
      { name: 'Air Conditioning', icon: 'air-conditioning' },
      { name: 'Catering', icon: 'catering' },
      { name: 'Bar', icon: 'bar' }
    ],
    availability: []
  },
  {
    id: "2f3e4d5c-6b7a-8901-def2-abc34567890b",
    name: 'Royal Meadows Resort',
    location: 'Udaipur, Rajasthan',
    priceRange: {
      min: 250000,
      max: 800000,
    },
    rating: 4.9,
    reviews: 203,
    capacity: {
      min: 150,
      max: 800,
    },
    mainImage: 'https://r2imghtlak.mmtcdn.com/r2-mmt-htl-image/htl-imgs/202404252230399446-f6588c28-b819-4093-a5c3-0ca86057e1f1.jpg',
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526786220381-1d21eedf92bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['Resort', 'Palace', 'Lake View', 'Luxury', 'Pool'],
    description: 'A luxurious resort with breathtaking lake views, perfect for royal weddings and grand celebrations.',
    hasVirtualTour: true,
    virtualTourImages: [],
    amenities: [
      { name: 'Wi-Fi', icon: 'wifi' },
      { name: 'Lake View', icon: 'view' },
      { name: 'Swimming Pool', icon: 'pool' },
      { name: 'Spa', icon: 'spa' },
      { name: 'Fine Dining', icon: 'restaurant' }
    ],
    availability: []
  },
  {
    id: "3f0c2e6e-8b9a-4c3d-8b5a-c4f6e9e7d8c1",
    name: 'Emerald Gardens',
    location: 'Bangalore, Karnataka',
    priceRange: {
      min: 100000,
      max: 350000,
    },
    rating: 4.6,
    reviews: 118,
    capacity: {
      min: 50,
      max: 300,
    },
    mainImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518997351272-4ea05033641c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515923027836-58adb0ef70c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1597346908500-28cda8acfe4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['Garden', 'Outdoor', 'Poolside', 'Nature'],
    description: 'A lush green garden venue surrounded by natural beauty, perfect for intimate gatherings.',
    hasVirtualTour: false,
    amenities: [
      { name: 'Garden', icon: 'garden' },
      { name: 'Parking', icon: 'parking' },
      { name: 'Outdoor Seating', icon: 'outdoor' },
      { name: 'In-house Catering', icon: 'catering' },
      { name: 'DJ', icon: 'music' }
    ],
    availability: []
  }
];

const BookingLanding = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [guestCount, setGuestCount] = useState<number>(100);
  const [location, setLocation] = useState<string>('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const navigate = useNavigate();

  // Format price to INR currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleBookNow = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowBookingModal(true);
  };

  const handleSearchVenues = () => {
    // In a real app, this would filter venues or navigate to the venues page with filters
    navigate(`/venues?date=${selectedDate}&guests=${guestCount}&location=${location}`);
  };

  const handleBookingSuccess = (bookingId: string) => {
    toast.success(`Booking confirmed! Your booking ID is ${bookingId}`);
    setShowBookingModal(false);
    setSelectedVenue(null);
  };

  return (
    <div className="min-h-screen pt-16 bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-rose-100 to-indigo-100 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
            alt="Wedding backdrop"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Book Your Dream Wedding Venue
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-10">
              Find and book the perfect venue with our simple booking system. 
              Real-time availability, instant confirmation, and special offers.
            </p>
            
            {/* Search box */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="location"
                      name="location"
                      placeholder="City or Region"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                    />
                    <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="guests"
                      name="guests"
                      placeholder="100"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                      min="10"
                      max="1000"
                      className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                    />
                    <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSearchVenues}
                className="w-full mt-4 py-3 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 flex items-center justify-center"
              >
                <Search size={20} className="mr-2" />
                Find Available Venues
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Book With Us
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Availability</h3>
              <p className="text-gray-600">
                See instant availability for all venues. No more waiting for confirmations.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
              <p className="text-gray-600">
                Easy and secure booking process with instant confirmations.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Support</h3>
              <p className="text-gray-600">
                Dedicated venue experts to help you find the perfect match.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured venues section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Featured Venues
            </h2>
            <button
              onClick={() => navigate('/venues')}
              className="flex items-center text-rose-500 hover:text-rose-600"
            >
              View All Venues
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredVenues.map((venue) => (
              <div key={venue.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={venue.mainImage}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                  {venue.hasVirtualTour && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      360° Tour
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin size={14} className="mr-1" />
                    {venue.location}
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-500 mr-1" />
                      <span className="text-gray-700">{venue.rating}</span>
                      <span className="text-gray-500 text-xs ml-1">({venue.reviews})</span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {venue.capacity.min} - {venue.capacity.max} guests
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-gray-900">
                      <span className="font-bold">
                        {formatPrice(venue.priceRange.min)}
                      </span>
                      <span className="text-gray-500 text-sm"> onwards</span>
                    </div>
                    <button
                      onClick={() => handleBookNow(venue)}
                      className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How Booking Works
          </h2>
          
          <div className="flex flex-col md:flex-row justify-center">
            <div className="md:w-1/4 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Search</h3>
              <p className="text-gray-600">
                Find venues that match your date, location, and guest count.
              </p>
            </div>
            
            <div className="md:w-1/4 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Compare</h3>
              <p className="text-gray-600">
                Compare venues, check availability, and see detailed pricing.
              </p>
            </div>
            
            <div className="md:w-1/4 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Book</h3>
              <p className="text-gray-600">
                Secure your venue with our simple booking process.
              </p>
            </div>
            
            <div className="md:w-1/4 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Celebrate</h3>
              <p className="text-gray-600">
                Enjoy your special day at your perfect venue!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="py-16 bg-rose-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Find Your Perfect Venue?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our booking system makes it easy to find and secure the perfect venue for your special day.
          </p>
          <button
            onClick={() => navigate('/venues')}
            className="px-8 py-3 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 inline-flex items-center"
          >
            Browse All Venues
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedVenue && (
        <VenueBooking
          venue={selectedVenue}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default BookingLanding; 