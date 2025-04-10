import { useState, useEffect } from 'react';
import { Calendar, MapPin, Check, Users, Search, Filter } from 'lucide-react';
import { Venue, SearchFilters } from '../lib/types/venue';
import VenueBooking from '../components/venues/VenueBooking';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

const Booking = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    date: new Date().toISOString().split('T')[0],
    guests: 50,
    location: '',
    priceRange: { min: 50000, max: 200000 }
  });
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      try {
        // Fetch venues from Firestore
        const venuesRef = collection(db, 'venues');
        const venuesQuery = query(venuesRef, limit(10));
        const querySnapshot = await getDocs(venuesQuery);
        
        const venuesData: Venue[] = [];
        querySnapshot.forEach((doc) => {
          venuesData.push({ id: doc.id, ...doc.data() } as Venue);
        });
        
        setVenues(venuesData.length > 0 ? venuesData : getMockVenues());
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching venues:', error);
        setVenues(getMockVenues());
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const handleSearchFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'minPrice' || name === 'maxPrice') {
      setSearchFilters({
        ...searchFilters,
        priceRange: {
          ...searchFilters.priceRange!,
          [name === 'minPrice' ? 'min' : 'max']: parseInt(value)
        }
      });
    } else {
      setSearchFilters({
        ...searchFilters,
        [name]: name === 'guests' ? parseInt(value) : value
      });
    }
  };

  const handleSearch = () => {
    // In a real app, this would filter the venues based on the searchFilters
    // For now, we'll just show a toast message
    toast.success('Search filters applied!');
  };

  const handleBookNow = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedVenue(null);
  };

  const handleBookingSuccess = (bookingId: string) => {
    toast.success(`Booking confirmed! Booking ID: ${bookingId}`);
    setShowBookingModal(false);
    setSelectedVenue(null);
  };

  // Function to format price to INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Mock data for demo purposes
  const getMockVenues = (): Venue[] => {
    return [
      {
        id: '1',
        name: 'Royal Palace Banquet',
        location: 'Delhi, India',
        priceRange: { min: 100000, max: 200000 },
        rating: 4.8,
        reviews: 120,
        capacity: { min: 100, max: 500 },
        mainImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        images: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        ],
        description: 'A luxurious venue with grand halls and beautiful gardens perfect for weddings.',
        tags: ['luxury', 'garden', 'indoor', 'outdoor'],
        hasVirtualTour: true,
        virtualTourImages: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        ],
        amenities: [
          { name: 'Parking', icon: 'parking' },
          { name: 'Catering', icon: 'utensils' },
          { name: 'Decoration', icon: 'palette' },
        ],
        availability: []
      },
      {
        id: '2',
        name: 'Seaside Resort',
        location: 'Mumbai, India',
        priceRange: { min: 80000, max: 150000 },
        rating: 4.5,
        reviews: 95,
        capacity: { min: 50, max: 300 },
        mainImage: 'https://images.unsplash.com/photo-1529290130-4ca3753253ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        images: [
          'https://images.unsplash.com/photo-1529290130-4ca3753253ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        ],
        description: 'A beautiful beachfront venue with panoramic sea views and elegant facilities.',
        tags: ['beach', 'seaside', 'outdoor'],
        hasVirtualTour: false,
        amenities: [
          { name: 'Parking', icon: 'parking' },
          { name: 'Accommodation', icon: 'bed' },
          { name: 'Swimming Pool', icon: 'water' },
        ],
        availability: []
      },
      {
        id: '3',
        name: 'Hillside Retreat',
        location: 'Shimla, India',
        priceRange: { min: 60000, max: 120000 },
        rating: 4.7,
        reviews: 78,
        capacity: { min: 30, max: 200 },
        mainImage: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        images: [
          'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        ],
        description: 'A serene mountain retreat with breathtaking views and cozy indoor spaces.',
        tags: ['mountain', 'scenic', 'indoor', 'outdoor'],
        hasVirtualTour: true,
        virtualTourImages: [
          'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        ],
        amenities: [
          { name: 'Parking', icon: 'parking' },
          { name: 'Accommodation', icon: 'bed' },
          { name: 'Fireplace', icon: 'fire' },
        ],
        availability: []
      }
    ];
  };

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Your Perfect Wedding Venue</h1>
          <p className="mt-2 text-lg text-gray-600">
            Find and book the ideal venue for your special day
          </p>
        </div>

        {/* Search filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Event Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={searchFilters.date}
                  onChange={handleSearchFilterChange}
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
                  placeholder="Any location"
                  value={searchFilters.location}
                  onChange={handleSearchFilterChange}
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
                  placeholder="50"
                  value={searchFilters.guests}
                  onChange={handleSearchFilterChange}
                  min="10"
                  max="1000"
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                />
                <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                &nbsp;
              </label>
              <button
                onClick={handleSearch}
                className="w-full flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-md"
              >
                <Search size={18} className="mr-2" />
                Search Venues
              </button>
            </div>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <button className="flex items-center text-blue-600 hover:text-blue-800">
              <Filter size={18} className="mr-1" />
              More Filters
            </button>
          </div>
        </div>

        {/* Venues grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading venues...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.map((venue) => (
              <div key={venue.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={venue.mainImage}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                  {venue.hasVirtualTour && (
                    <div className="absolute top-2 right-2 bg-rose-500 text-white px-2 py-1 rounded text-xs font-medium">
                      3D Tour Available
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
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{venue.rating}</span>
                      <span className="text-gray-500">({venue.reviews})</span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {venue.capacity.min} - {venue.capacity.max} guests
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {venue.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
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
                      className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-md flex items-center"
                    >
                      <Check size={16} className="mr-1" />
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Booking Modal */}
      {showBookingModal && selectedVenue && (
        <VenueBooking
          venue={selectedVenue}
          onClose={handleCloseBookingModal}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default Booking; 