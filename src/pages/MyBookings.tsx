import { useState, useEffect, useCallback } from 'react';
import { MapPin, Users, CreditCard, Calendar, Search, Filter, ChevronDown, X, RefreshCw } from 'lucide-react';
import axios, { requestWithRetry } from '../lib/axiosConfig';
import useAuth from '../lib/hooks/useAuth';
import toast from 'react-hot-toast';
import { Venue, getVenuesForBookings } from '../lib/services/venueService';

// Define booking types
enum BookingType {
  ALL = 'All',
  VENUE = 'Venue',
  CATERING = 'Catering',
  MAKEUP = 'Makeup',
  DECORATION = 'Decoration',
  PHOTOGRAPHY = 'Photography',
}

// Define booking status
enum BookingStatus {
  ALL = 'All',
  CONFIRMED = 'Confirmed',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
}

// Define booking time filter
enum BookingTimeFilter {
  ALL = 'All Bookings',
  UPCOMING = 'Upcoming',
  PAST = 'Past',
}

// Booking interface
interface Booking {
  _id: string;
  userId: string;
  serviceType: BookingType;
  serviceName: string;
  date: string;
  location: string;
  guestCount: number;
  status: BookingStatus;
  priceEstimate: number;
  imageUrl: string;
  createdAt: string;
  venueId?: string; // Optional venue ID reference
}

const MyBookings = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [venueDetails, setVenueDetails] = useState<Record<string, Venue>>({});
  const [typeFilter, setTypeFilter] = useState<BookingType>(BookingType.ALL);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>(BookingStatus.ALL);
  const [timeFilter, setTimeFilter] = useState<BookingTimeFilter>(BookingTimeFilter.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add a ref to track if fetch is in progress
  const [isFetchingRef, setIsFetchingRef] = useState(false);

  // Function to fetch venue details - extracted as a separate function
  const fetchVenueDetails = useCallback(async (bookingData: Booking[]) => {
    if (!token || isLoadingVenues) return;
    
    setIsLoadingVenues(true);
    try {
      // Extract venue IDs from bookings
      const venueIds = bookingData
        .filter((booking: Booking) => booking.venueId && booking.serviceType === BookingType.VENUE)
        .map((booking: Booking) => booking.venueId as string); // Safe cast since we filter for defined venueIds
        
      if (venueIds.length > 0) {
        // Use the dedicated venue service to fetch venue details
        const venueDetailsMap = await getVenuesForBookings(venueIds, token);
        
        // Only update if we actually got new data to prevent unnecessary re-renders
        if (Object.keys(venueDetailsMap).length > 0) {
          console.log('Venue details loaded successfully:', Object.keys(venueDetailsMap).length);
          
          // Merge with existing venue details to avoid losing previously loaded venues
          setVenueDetails(prev => ({
            ...prev,
            ...venueDetailsMap
          }));
        }
      }
    } catch (venueError) {
      console.error('Error fetching venue details:', venueError);
      setError('Some venue details could not be loaded. You can try refreshing.');
    } finally {
      setIsLoadingVenues(false);
    }
  }, [token, isLoadingVenues]);

  // Fetch user bookings
  const fetchBookings = useCallback(async () => {
    // Don't attempt to fetch if user is not authenticated or if a fetch is already in progress
    if (!isAuthenticated || !user || !token || isFetchingRef) {
      setIsLoading(false);
      return;
    }

    setIsFetchingRef(true);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Checking API health before fetching bookings...');
      
      // Check API health first
      try {
        const healthResponse = await axios.get('/api/health', { timeout: 5000 });
        console.log('API health check response:', healthResponse.data);
      } catch (healthError) {
        console.error('API health check failed:', healthError);
        toast.error('Server appears to be offline. Please try again later.');
        setIsLoading(false);
        setIsFetchingRef(false);
        setError('Cannot connect to server. Please check your connection and try again.');
        return;
      }
      
      console.log('Fetching bookings for user ID:', user.id);
      
      // Use requestWithRetry instead of regular axios for better resilience
      const response = await requestWithRetry({
        method: 'get',
        url: '/api/bookings',
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 30000 // 30 seconds timeout
      }, 3); // 3 retries
      
      if (response.data) {
        console.log('Bookings fetched successfully:', response.data.length);
        
        const loadedBookings = response.data;
        setBookings(loadedBookings);
        setFilteredBookings(loadedBookings);
        
        // Fetch venue details for the loaded bookings
        if (loadedBookings.length > 0) {
          await fetchVenueDetails(loadedBookings);
        }
      } else {
        console.log('No bookings data received');
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      
      // Specific error handling
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        setError('Server is taking too long to respond. Please try again later.');
        toast.error('Server is taking too long to respond. Please try again later.');
      } else if (error.response?.status === 401) {
        setError('Authentication error. Please log in again.');
        toast.error('Authentication error. Please log in again.');
      } else if (!navigator.onLine) {
        setError('Network connection lost. Please check your internet connection.');
        toast.error('Network connection lost. Please check your internet connection.');
      } else {
        setError('Failed to load your bookings. Please try refreshing the page.');
        toast.error('Failed to load your bookings. Please try refreshing the page.');
      }
      
      setBookings([]);
    } finally {
      setIsLoading(false);
      setIsFetchingRef(false);
    }
  }, [user, token, isAuthenticated, isFetchingRef, fetchVenueDetails]);

  // Initial data loading
  useEffect(() => {
    // Only fetch once on component mount
    if (!bookings.length) {
      fetchBookings();
    }
  }, [fetchBookings, bookings.length]);

  // Function to retry loading venue details
  const handleRetryVenueDetails = () => {
    if (bookings.length > 0 && !isLoadingVenues) {
      fetchVenueDetails(bookings);
    }
  };

  // Function to refresh all bookings data
  const handleRefreshBookings = () => {
    if (!isLoading && !isFetchingRef) {
      fetchBookings();
    }
  };

  // Apply filters
  useEffect(() => {
    let result = bookings;

    // Apply service type filter
    if (typeFilter !== BookingType.ALL) {
      result = result.filter(booking => booking.serviceType === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== BookingStatus.ALL) {
      result = result.filter(booking => booking.status === statusFilter);
    }

    // Apply time filter
    if (timeFilter !== BookingTimeFilter.ALL) {
      const today = new Date();
      
      if (timeFilter === BookingTimeFilter.UPCOMING) {
        result = result.filter(booking => new Date(booking.date) >= today);
      } else if (timeFilter === BookingTimeFilter.PAST) {
        result = result.filter(booking => new Date(booking.date) < today);
      }
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(booking => 
        booking.serviceName.toLowerCase().includes(query) || 
        booking.location.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    result = [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredBookings(result);
  }, [bookings, typeFilter, statusFilter, timeFilter, searchQuery]);

  // Format date to readable string
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format price to INR
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.post(`/api/bookings/${bookingId}/cancel`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Update booking status in frontend
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking._id === bookingId
              ? { ...booking, status: BookingStatus.CANCELLED }
              : booking
          )
        );
        toast.success('Booking cancelled successfully');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        toast.error('Failed to cancel booking');
      }
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-500 text-white';
      case BookingStatus.PENDING:
        return 'bg-yellow-500 text-white';
      case BookingStatus.CANCELLED:
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Reset all filters
  const resetFilters = (): void => {
    setTypeFilter(BookingType.ALL);
    setStatusFilter(BookingStatus.ALL);
    setTimeFilter(BookingTimeFilter.ALL);
    setSearchQuery('');
  };

  // Get venue image for a booking
  const getBookingImage = (booking: Booking): string => {
    // If booking has its own image, use that
    if (booking.imageUrl && booking.imageUrl !== 'undefined' && booking.imageUrl !== 'null') {
      return booking.imageUrl;
    }
    
    // If it's a venue booking and we have venue details, use the venue image
    if (booking.serviceType === BookingType.VENUE && booking.venueId && venueDetails[booking.venueId]) {
      const venue = venueDetails[booking.venueId];
      if (venue.images && venue.images.length > 0 && venue.images[0]) {
        return venue.images[0];
      }
    }
    
    // Default fallback by service type
    return `https://source.unsplash.com/random/600x400/?${booking.serviceType.toLowerCase()}`;
  };

  // Get venue name for a booking
  const getServiceName = (booking: Booking): string => {
    // If it's a venue booking and we have venue details, use the venue name
    if (booking.serviceType === BookingType.VENUE && booking.venueId && venueDetails[booking.venueId]) {
      return venueDetails[booking.venueId].name || booking.serviceName;
    }
    
    // Otherwise use the booking's service name
    return booking.serviceName || 'Unnamed Service';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-lg text-gray-600">
            View and manage all your wedding planning bookings in one place
          </p>
        </div>

        {/* Refresh button and quick filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter(BookingStatus.ALL)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === BookingStatus.ALL 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter(BookingStatus.CONFIRMED)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === BookingStatus.CONFIRMED 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setStatusFilter(BookingStatus.PENDING)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === BookingStatus.PENDING 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setTimeFilter(BookingTimeFilter.UPCOMING)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                timeFilter === BookingTimeFilter.UPCOMING 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
            >
              Upcoming
            </button>
          </div>
          
          <button
            onClick={handleRefreshBookings}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-100 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-500 focus:outline-none focus:text-red-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Venue details loading indicator */}
        {isLoadingVenues && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 flex items-center justify-between">
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading venue details...</span>
            </span>
          </div>
        )}

        {/* Search and filter bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search bar */}
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Filter size={18} />
              <span>Filters</span>
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex flex-wrap gap-4">
                {/* Service type filter */}
                <div className="min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as BookingType)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {Object.values(BookingType).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Status filter */}
                <div className="min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as BookingStatus)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {Object.values(BookingStatus).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Time filter */}
                <div className="min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as BookingTimeFilter)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {Object.values(BookingTimeFilter).map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                {/* Reset button */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-rose-600 hover:text-rose-800 focus:outline-none"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                {/* Booking image with status badge overlay */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={getBookingImage(booking)}
                    alt={getServiceName(booking)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.dataset.fallbackApplied) {
                        target.dataset.fallbackApplied = "true";
                        target.src = `https://source.unsplash.com/random/600x400/?${booking.serviceType.toLowerCase()}`;
                      }
                    }}
                  />
                  
                  {/* Status badge overlay */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(booking.status)} shadow-md`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  {/* Venue loading retry button */}
                  {booking.serviceType === BookingType.VENUE && booking.venueId && 
                   !venueDetails[booking.venueId] && !isLoadingVenues && (
                    <button 
                      onClick={handleRetryVenueDetails}
                      className="absolute bottom-2 right-2 bg-white bg-opacity-80 p-1 rounded-full hover:bg-opacity-100"
                      title="Retry loading venue details"
                    >
                      <RefreshCw size={16} className="text-gray-700" />
                    </button>
                  )}
                </div>

                {/* Booking details */}
                <div className="p-4">
                  {/* Service type badge */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                      {booking.serviceType}
                    </span>
                    <span className="text-sm text-gray-600 font-medium">
                      {new Date(booking.date) > new Date() ? 'Upcoming' : 'Past'}
                    </span>
                  </div>

                  {/* Service name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{getServiceName(booking)}</h3>

                  {/* Booking details with improved layout */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar size={16} className="mr-2 text-rose-500" />
                      <span className="font-medium">{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin size={16} className="mr-2 text-rose-500" />
                      <span className="font-medium">{booking.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Users size={16} className="mr-2 text-rose-500" />
                      <span className="font-medium">{booking.guestCount} Guests</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CreditCard size={16} className="mr-2 text-rose-500" />
                      <span className="font-medium">{formatPrice(booking.priceEstimate)}</span>
                    </div>
                  </div>

                  {/* Venue-specific details when available */}
                  {booking.serviceType === BookingType.VENUE && booking.venueId && venueDetails[booking.venueId] && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Venue Details</h4>
                      <div className="text-sm text-gray-600">
                        {venueDetails[booking.venueId].description && (
                          <p className="line-clamp-2 mb-2">{venueDetails[booking.venueId].description}</p>
                        )}
                        {venueDetails[booking.venueId].amenities && venueDetails[booking.venueId].amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {venueDetails[booking.venueId].amenities.slice(0, 3).map((amenity, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {amenity}
                              </span>
                            ))}
                            {venueDetails[booking.venueId].amenities.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                +{venueDetails[booking.venueId].amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-between mt-4">
                    <button
                      className="px-3 py-2 bg-rose-100 border border-rose-300 rounded-md text-sm font-medium text-rose-700 hover:bg-rose-200 transition-colors"
                      onClick={() => window.alert('View details - To be implemented')}
                    >
                      View Details
                    </button>
                    {booking.status !== BookingStatus.CANCELLED && new Date(booking.date) > new Date() && (
                      <button
                        className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <img
              src="https://illustrations.popsy.co/amber/taking-notes.svg"
              alt="No bookings"
              className="w-64 h-64 mx-auto mb-6"
            />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery || typeFilter !== BookingType.ALL || statusFilter !== BookingStatus.ALL || timeFilter !== BookingTimeFilter.ALL
                ? "No bookings match your current filters. Try adjusting your search criteria."
                : "You haven't made any bookings yet. Explore services to start planning your dream wedding!"}
            </p>
            {searchQuery || typeFilter !== BookingType.ALL || statusFilter !== BookingStatus.ALL || timeFilter !== BookingTimeFilter.ALL ? (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => window.location.href = '/venues'}
                className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
              >
                Explore Venues
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings; 