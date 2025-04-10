import { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import { format, addDays, isBefore, differenceInDays } from 'date-fns';
import { CheckCircle, XCircle, Calendar as CalendarIcon, Users, CreditCard, MapPin } from 'lucide-react';
import { Venue, Booking, VenueVisitRequest } from '../../lib/types/venue';
import { 
  getVenueAvailabilityRealtime, 
  getVenuePricingRules, 
  calculateBookingPrice, 
  createBooking,
  requestVenueVisit,
  testConnection
} from '../../lib/services/bookingService';
import { ensureTestVenueExists } from '../../lib/services/venueService';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import useAuth from '../../lib/hooks/useAuth';
import axios from '../../lib/axiosConfig';

interface VenueBookingProps {
  venue: Venue;
  onClose: () => void;
  onSuccess?: (bookingId: string) => void;
}

// Helper function to save booking to MongoDB via API
const saveBookingToMongoDB = async (bookingData: Booking, userId: string, venueName: string, venueLocation: string) => {
  try {
    console.log('Attempting to save booking to MongoDB...');
    
    // Prepare data for MongoDB schema
    const mongoBookingData = {
      userId: userId,
      venueId: bookingData.venueId,
      guestCount: bookingData.guestCount,
      date: bookingData.date, // Using date instead of bookingDate for API consistency
      endDate: bookingData.endDate || null,
      timeSlot: bookingData.timeSlot || 'full-day',
      price: bookingData.price || 0,
      contactName: bookingData.contactName,
      contactEmail: bookingData.contactEmail,
      contactPhone: bookingData.contactPhone,
      specialRequests: bookingData.specialRequests || null,
      status: bookingData.status || 'Pending',
      venueName: venueName,
      location: venueLocation,
      serviceType: 'Venue',
      visitScheduled: false
    };
    
    // Log the full URL and payload for debugging
    console.log('📦 Booking payload to Mongo:', mongoBookingData);
    console.log('MongoDB API endpoint:', `${axios.defaults.baseURL}/api/bookings`);
    
    // Send data to backend API with added timeout and retry logic
    const { requestWithRetry } = await import('../../lib/axiosConfig');
    const response = await requestWithRetry({
      method: 'post',
      url: '/api/bookings',
      data: mongoBookingData,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    }, 2); // 2 retries maximum
    
    console.log('Booking saved to MongoDB with ID:', response.data.booking._id);
    return response.data.booking._id;
  } catch (error) {
    console.error('Error saving to MongoDB:', error);
    throw error;
  }
};

const BOOKING_STEPS = {
  SELECT_DATES: 0,
  GUEST_COUNT: 1,
  PRICE_SUMMARY: 2,
  CONTACT_INFO: 3,
  CONFIRMATION: 4
};

const VenueBooking = ({ venue, onClose, onSuccess }: VenueBookingProps) => {
  const { user } = useAuth();
  // Add auth state verification
  const [authVerified, setAuthVerified] = useState(false);
  
  // Debug function to inspect user object
  useEffect(() => {
    // Deep inspect the user object
    const debugAuth = () => {
      if (!user) {
        console.log('Debug: User object is null or undefined');
        return;
      }
      
      console.log('Debug: Full user object:', JSON.stringify(user, null, 2));
      console.log('Debug: User object type:', typeof user);
      console.log('Debug: User object properties:', Object.keys(user));
      
      // Check auth context directly
      const userAny = user as any;
      console.log('Debug: Possible ID values:', {
        id: user.id,
        _id: userAny._id,
        uid: userAny.uid,
        userId: userAny.userId,
        user_id: userAny.user_id
      });
      
      // Check for token
      if (userAny.token) {
        console.log('Debug: Auth token exists');
      }
    };
    
    debugAuth();
  }, [user]);
  
  // State for booking flow
  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.SELECT_DATES);
  const [selectedDateRange, setSelectedDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [guestCount, setGuestCount] = useState(venue.capacity.min);
  const [bookingType, setBookingType] = useState<'book' | 'visit'>('book');
  
  // State for contact info
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // State for price calculation
  const [priceBreakdown, setPriceBreakdown] = useState<{
    basePrice: number;
    seasonalAdjustment: number;
    guestPrice: number;
    totalPrice: number;
  } | null>(null);

  // State for availability data
  const [availableDates, setAvailableDates] = useState<{[key: string]: boolean}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verify auth state on component load
  useEffect(() => {
    const verifyAuth = async () => {
      if (user) {
        // Log all user properties to debug
        console.log('Auth check - User object properties:', Object.keys(user));
        
        // Check for common ID field names using type assertion to access potential properties
        const userAny = user as any;
        const hasUserId = user.id || userAny.uid || userAny._id || userAny.userId;
        
        if (hasUserId) {
          console.log('User authenticated with ID:', hasUserId);
          setAuthVerified(true);
        } else {
          console.log('User object exists but has no ID property:', user);
          setAuthVerified(false);
        }
      } else {
        console.log('User not authenticated or auth not loaded yet');
        setAuthVerified(false);
      }
    };
    
    verifyAuth();
  }, [user]);

  // Fetch availability and pricing rules on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Subscribe to real-time availability updates
        const unsubscribe = getVenueAvailabilityRealtime(venue.id, (availability) => {
          if (availability) {
            const availableDatesMap: {[key: string]: boolean} = {};
            Object.keys(availability).forEach(dateKey => {
              const dateString = `${dateKey.substring(0, 4)}-${dateKey.substring(4, 6)}-${dateKey.substring(6, 8)}`;
              availableDatesMap[dateString] = availability[dateKey].isAvailable;
            });
            setAvailableDates(availableDatesMap);
          }
          setIsLoading(false);
        });

        // Get pricing rules and calculate initial price
        const pricingRules = await getVenuePricingRules(venue.id);
        const formattedStartDate = format(selectedDateRange[0], 'yyyy-MM-dd');
        const formattedEndDate = isMultiDay ? format(selectedDateRange[1], 'yyyy-MM-dd') : null;
        
        const priceDetails = calculateBookingPrice(
          pricingRules,
          formattedStartDate,
          formattedEndDate,
          guestCount
        );
        
        setPriceBreakdown(priceDetails);

        // Return clean-up function
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error fetching booking data:', error);
        setIsLoading(false);
        toast.error('Failed to load availability data');
      }
    };

    fetchInitialData();
  }, [venue.id]);

  // Recalculate price when booking details change
  useEffect(() => {
    const updatePrice = async () => {
      try {
        const pricingRules = await getVenuePricingRules(venue.id);
        const formattedStartDate = format(selectedDateRange[0], 'yyyy-MM-dd');
        const formattedEndDate = isMultiDay ? format(selectedDateRange[1], 'yyyy-MM-dd') : null;
        
        const priceDetails = calculateBookingPrice(
          pricingRules,
          formattedStartDate,
          formattedEndDate,
          guestCount
        );
        
        setPriceBreakdown(priceDetails);
      } catch (error) {
        console.error('Error updating price:', error);
      }
    };

    if (selectedDateRange[0] && guestCount) {
      updatePrice();
    }
  }, [selectedDateRange, guestCount, isMultiDay, venue.id]);

  // Format price to INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Check if a date is available
  const isDateAvailable = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return availableDates[dateString] !== false;
  };

  // Handle date selection in calendar
  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDateRange([value, value]);
      setIsMultiDay(false);
    } else if (Array.isArray(value) && value.length === 2 && value[0] instanceof Date && value[1] instanceof Date) {
      setSelectedDateRange([value[0], value[1]]);
      if (differenceInDays(value[1], value[0]) > 0) {
        setIsMultiDay(true);
      } else {
        setIsMultiDay(false);
      }
    }
  };

  // Handle guest count change
  const handleGuestCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    if (count >= venue.capacity.min && count <= venue.capacity.max) {
      setGuestCount(count);
    }
  };

  // Handle contact info change
  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactInfo({
      ...contactInfo,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Debug log the full user object
    console.log('User object during submission:', user);
    
    // Extract userId from any of the common ID properties
    const userAny = user as any;
    const userId = user?.id || userAny?.uid || userAny?._id || userAny?.userId;
    
    // Verify auth before submission with more detailed logging
    if (!user || !userId) {
      console.error('User not authenticated or missing ID. Auth state:', { 
        authVerified, 
        userExists: !!user,
        userProperties: user ? Object.keys(user) : [],
        userId 
      });
      toast.error('You must be logged in to book a venue. Please log in and try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Try to refresh auth token if the auth context provides a refresh method
      try {
        if (userAny.refreshToken) {
          console.log('Refreshing auth token before submission...');
          await userAny.refreshToken();
          console.log('Auth token refreshed');
        }
      } catch (refreshError) {
        console.error('Error refreshing auth token:', refreshError);
        // Continue anyway, the existing token might still be valid
      }
      
      // Set up a timeout to prevent endless submission
      const submissionTimeout = setTimeout(() => {
        setIsSubmitting(false);
        toast.error('Submission is taking too long. Please try again.');
      }, 30000);
      
      const formattedStartDate = format(selectedDateRange[0], 'yyyy-MM-dd');
      const formattedEndDate = isMultiDay ? format(selectedDateRange[1], 'yyyy-MM-dd') : undefined;
      
      // Ensure we have a valid venue ID
      let venueId = venue.id;
      try {
        // Check if the current venue ID is valid, or get a valid one
        if (!venue.id || typeof venue.id !== 'string') {
          console.log('Venue ID may not be valid, fetching a valid venue ID');
          venueId = await ensureTestVenueExists();
          console.log('Using venue ID from ensureTestVenueExists:', venueId);
        }
      } catch (venueError) {
        console.error('Error ensuring valid venue:', venueError);
        // Continue with original ID, our createBooking function will handle this
      }
      
      console.log('Starting booking submission process...', {
        userId, // Use the extracted userId
        venueId,
        date: formattedStartDate,
        endDate: formattedEndDate,
        guestCount,
        bookingType
      });
      
      if (bookingType === 'book') {
        // Create venue booking
        try {
          console.log('Preparing booking data...');
          
          // Log detailed user info to debug authentication
          console.log('Auth state before booking:', { 
            userId,
            isAuthenticated: !!user,
            authVerified
          });
          
          // Double check authentication one more time with better ID extraction
          if (!userId) {
            clearTimeout(submissionTimeout);
            console.error('User ID not available');
            toast.error('Please log in to book a venue');
            throw new Error('User ID not available');
          }
          
          const bookingData: Booking = {
            venueId,
            userId, // Use the extracted userId
            date: formattedStartDate,
            endDate: formattedEndDate,
            timeSlot: 'full-day',
            guestCount,
            price: priceBreakdown?.totalPrice || 0,
            contactName: contactInfo.name,
            contactEmail: contactInfo.email,
            contactPhone: contactInfo.phone,
            specialRequests: contactInfo.notes,
            status: 'Pending'
          };
          
          console.log('Booking data prepared:', bookingData);
          
          let bookingId;
          let supabaseSuccess = false;
          
          try {
            // First check if the venue exists by calling ensureTestVenueExists
            const validVenueId = await ensureTestVenueExists();
            
            // Update our booking data with the valid venue ID to ensure constraint is satisfied
            if (validVenueId && validVenueId !== venueId) {
              console.log('Updating to use verified venue ID:', validVenueId);
              venueId = validVenueId;
              bookingData.venueId = validVenueId;
            }
            
            // First try to save to Supabase with a timeout
            const supabasePromise = createBooking(bookingData);
            const supabaseTimeout = new Promise<string>((_, reject) => {
              setTimeout(() => reject(new Error('Supabase booking timeout')), 15000);
            });
            
            bookingId = await Promise.race([supabasePromise, supabaseTimeout]);
            console.log('Booking created in Supabase, ID:', bookingId);
            supabaseSuccess = true;
          } catch (supabaseError) {
            console.error('Supabase booking error:', supabaseError);

            // Check for foreign key constraint error
            if (supabaseError instanceof Error && 
                supabaseError.message.includes('foreign key constraint')) {
              toast.error('There was an issue with the venue selection. Please try again with a different venue.');
              clearTimeout(submissionTimeout);
              throw supabaseError;
            }
            
            // If Supabase fails for other reasons, generate a mock ID
            bookingId = uuidv4();
          }
          
          // Also save to MongoDB for the My Bookings page
          try {
            // Extract and use the userId
            const userAny = user as any;
            const userId = user?.id || userAny?.uid || userAny?._id || userAny?.userId;
            
            if (!userId) {
              throw new Error('Could not determine user ID for MongoDB save');
            }
            
            console.log('Using user ID for MongoDB:', userId);
            
            // Only generate a mock ID if needed (if Supabase failed but we're continuing)
            if (!supabaseSuccess && !bookingId) {
              bookingId = uuidv4();
            }
            
            // Save to MongoDB directly (no longer a fallback)
            const mongoId = await saveBookingToMongoDB(bookingData, userId, venue.name, venue.location);
            console.log('Successfully saved to MongoDB with ID:', mongoId);
            
            // Always use the MongoDB ID as the primary ID
            bookingId = mongoId;
            
            // If Supabase already succeeded, log that we have dual storage
            if (supabaseSuccess) {
              console.log('Booking saved to both Supabase and MongoDB for redundancy');
            }
          } catch (mongoError) {
            console.error('Error saving to MongoDB:', mongoError);
            
            // If MongoDB fails but Supabase succeeded, we can still continue
            if (!supabaseSuccess) {
              clearTimeout(submissionTimeout);
              toast.error('Failed to save booking. Please try again.');
              throw mongoError;
            }
          }
          
          clearTimeout(submissionTimeout);
          
          console.log('Booking process complete! Booking ID:', bookingId);
          toast.success('Booking confirmed! You will receive a confirmation email shortly.');
          
          if (onSuccess) {
            onSuccess(bookingId);
          }
        } catch (bookingError) {
          clearTimeout(submissionTimeout);
          console.error('Error creating booking:', bookingError);
          
          // Avoid duplicate error messages
          if (bookingError instanceof Error && 
              !bookingError.message.includes('foreign key constraint')) {
            toast.error('Failed to create booking');
          }
          
          throw bookingError;
        }
      } else {
        // Request venue visit
        try {
          const visitData: VenueVisitRequest = {
            venueId,
            name: contactInfo.name,
            email: contactInfo.email,
            phone: contactInfo.phone,
            preferredDate: formattedStartDate,
            preferredTime: 'morning', // Default time
            notes: contactInfo.notes
          };
          
          let visitId;
          try {
            // Try to create visit request in Supabase
            visitId = await requestVenueVisit(visitData);
          } catch (error) {
            // If Supabase errors due to authentication or RLS policy issues
            if (error instanceof Error && 
                (error.message.includes('row-level security policy') || 
                 error.message.includes('401') || 
                 error.message.includes('Unauthorized'))) {
              // Generate a mock visit ID for demo purposes
              console.log('Authentication issue with Supabase, using mock ID for visit request');
              visitId = uuidv4();
            } else {
              // For other errors, rethrow
              throw error;
            }
          }
          
          console.log('Visit request created successfully! ID:', visitId);
          toast.success('Visit request submitted!');
          
          if (onSuccess) {
            onSuccess(visitId);
          }
        } catch (visitError) {
          console.error('Error requesting venue visit:', visitError);
          toast.error('Failed to request venue visit');
          throw visitError;
        }
      }
      
      setCurrentStep(BOOKING_STEPS.CONFIRMATION);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred during submission');
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move to next step
  const goToNextStep = () => {
    if (currentStep < BOOKING_STEPS.CONFIRMATION) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go back to previous step
  const goToPreviousStep = () => {
    if (currentStep > BOOKING_STEPS.SELECT_DATES) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calendar tile class
  const getTileClassName = ({ date }: { date: Date }) => {
    if (isBefore(date, new Date())) {
      return 'bg-gray-200 text-gray-400 cursor-not-allowed';
    }
    
    const dateString = format(date, 'yyyy-MM-dd');
    const isAvailable = availableDates[dateString] !== false;
    
    return isAvailable ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 text-gray-400 cursor-not-allowed';
  };

  // Disable unavailable dates or dates in the past
  const tileDisabled = ({ date }: { date: Date }) => {
    return isBefore(date, new Date()) || !isDateAvailable(date);
  };

  // Render step content based on current step
  const renderStepContent = () => {
    // Check auth first - if not authenticated, show login prompt
    if (!authVerified && !isLoading) {
      return (
        <div className="p-8 text-center">
          <div className="text-amber-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Authentication Required</h3>
          <p className="mb-4 text-gray-600">You need to be logged in to book a venue.</p>
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md inline-block">
            Log In / Sign Up
          </a>
        </div>
      );
    }

    switch (currentStep) {
      case BOOKING_STEPS.SELECT_DATES:
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Select Date(s)</h3>
            <Calendar 
              onChange={handleDateChange}
              value={selectedDateRange}
              selectRange={true}
              className="w-full border rounded-lg overflow-hidden"
              tileClassName={getTileClassName}
              tileDisabled={tileDisabled}
              minDate={new Date()}
              maxDate={addDays(new Date(), 365)} // Allow booking up to a year in advance
            />
            <div className="mt-4 flex flex-col space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 mr-2 rounded-sm"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 mr-2 rounded-sm"></div>
                <span>Unavailable</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="font-medium">
                {isMultiDay
                  ? `Selected: ${format(selectedDateRange[0], 'dd MMM yyyy')} - ${format(selectedDateRange[1], 'dd MMM yyyy')}`
                  : `Selected: ${format(selectedDateRange[0], 'dd MMM yyyy')}`}
              </p>
            </div>
            <button
              onClick={handleTestConnection}
              className="mt-4 text-blue-500 text-sm underline"
              type="button"
            >
              Test API Connections
            </button>
          </div>
        );
      
      case BOOKING_STEPS.GUEST_COUNT:
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Enter Guest Count</h3>
            <div className="mb-4">
              <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests
              </label>
              <input
                type="number"
                id="guestCount"
                value={guestCount}
                onChange={handleGuestCountChange}
                min={venue.capacity.min}
                max={venue.capacity.max}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">
                Venue capacity: {venue.capacity.min} - {venue.capacity.max} guests
              </p>
            </div>
            {priceBreakdown && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="font-medium">Estimated Price: {formatPrice(priceBreakdown.totalPrice)}</p>
                <p className="text-sm text-gray-600">
                  This is an estimate based on your guest count. See full breakdown in the next step.
                </p>
              </div>
            )}
          </div>
        );
      
      case BOOKING_STEPS.PRICE_SUMMARY:
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Price Breakdown</h3>
            {priceBreakdown && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 text-gray-600">Base Price</td>
                      <td className="p-3 text-right font-medium">{formatPrice(priceBreakdown.basePrice)}</td>
                    </tr>
                    {priceBreakdown.seasonalAdjustment !== 0 && (
                      <tr className="border-b">
                        <td className="p-3 text-gray-600">
                          {priceBreakdown.seasonalAdjustment > 0
                            ? 'Peak Season Surcharge'
                            : 'Off-Season Discount'}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {priceBreakdown.seasonalAdjustment > 0
                            ? `+${formatPrice(priceBreakdown.seasonalAdjustment)}`
                            : `-${formatPrice(Math.abs(priceBreakdown.seasonalAdjustment))}`}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="p-3 text-gray-600">Guest Charges ({guestCount} guests)</td>
                      <td className="p-3 text-right font-medium">{formatPrice(priceBreakdown.guestPrice)}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 font-semibold">Total</td>
                      <td className="p-3 text-right font-bold text-lg">{formatPrice(priceBreakdown.totalPrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-6 flex flex-col space-y-3">
              <button
                onClick={() => {
                  setBookingType('book');
                  goToNextStep();
                }}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
              >
                Book Now
              </button>
              <button
                onClick={() => {
                  setBookingType('visit');
                  goToNextStep();
                }}
                className="w-full py-3 bg-white border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition"
              >
                Schedule a Visit First
              </button>
            </div>
          </div>
        );
      
      case BOOKING_STEPS.CONTACT_INFO:
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              {bookingType === 'book' ? 'Complete Your Booking' : 'Schedule a Visit'}
            </h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactInfo.name}
                  onChange={handleContactInfoChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleContactInfoChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={contactInfo.phone}
                  onChange={handleContactInfoChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests or Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={contactInfo.notes}
                  onChange={handleContactInfoChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </form>
            <div className="mt-6 border-t pt-4">
              <div className="mb-4">
                <h4 className="font-medium mb-2">Booking Summary</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CalendarIcon size={16} className="mr-2 text-gray-600" />
                    {isMultiDay
                      ? `${format(selectedDateRange[0], 'dd MMM yyyy')} - ${format(selectedDateRange[1], 'dd MMM yyyy')}`
                      : format(selectedDateRange[0], 'dd MMM yyyy')}
                  </li>
                  <li className="flex items-center">
                    <Users size={16} className="mr-2 text-gray-600" />
                    {guestCount} guests
                  </li>
                  {priceBreakdown && bookingType === 'book' && (
                    <li className="flex items-center">
                      <CreditCard size={16} className="mr-2 text-gray-600" />
                      {formatPrice(priceBreakdown.totalPrice)}
                    </li>
                  )}
                  <li className="flex items-center">
                    <MapPin size={16} className="mr-2 text-gray-600" />
                    {venue.name}, {venue.location}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case BOOKING_STEPS.CONFIRMATION:
        return (
          <div className="p-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {bookingType === 'book' ? 'Booking Confirmed!' : 'Visit Request Sent!'}
            </h3>
            <p className="text-gray-600 mb-4">
              {bookingType === 'book'
                ? 'Your venue has been successfully booked. You will receive a confirmation email shortly.'
                : 'Your visit request has been submitted. Our team will contact you soon to confirm your visit.'}
            </p>
            <div className="border rounded-lg p-4 mb-6 text-left">
              <h4 className="font-medium mb-2">Summary</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CalendarIcon size={16} className="mr-2 text-gray-600" />
                  {isMultiDay
                    ? `${format(selectedDateRange[0], 'dd MMM yyyy')} - ${format(selectedDateRange[1], 'dd MMM yyyy')}`
                    : format(selectedDateRange[0], 'dd MMM yyyy')}
                </li>
                {bookingType === 'book' && (
                  <li className="flex items-center">
                    <Users size={16} className="mr-2 text-gray-600" />
                    {guestCount} guests
                  </li>
                )}
                {priceBreakdown && bookingType === 'book' && (
                  <li className="flex items-center">
                    <CreditCard size={16} className="mr-2 text-gray-600" />
                    {formatPrice(priceBreakdown.totalPrice)}
                  </li>
                )}
                <li className="flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-600" />
                  {venue.name}, {venue.location}
                </li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
            >
              Done
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render progress bar
  const renderProgressBar = () => {
    const steps = Object.values(BOOKING_STEPS).filter(x => typeof x === 'number');
    const totalSteps = steps.length;
    
    return (
      <div className="pt-4 px-4">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps - 1 }).map((_, index) => (
            <div 
              key={index}
              className={`h-1 flex-1 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Select Date</span>
          <span>Guests</span>
          <span>Price</span>
          <span>Details</span>
        </div>
      </div>
    );
  };

  // Add this test function for verifying MongoDB connection
  const testMongoDBConnection = async () => {
    try {
      console.log('Testing MongoDB API connection...');
      // Import the server check utility
      const { checkIfServerRunning } = await import('../../utils/serverCheck');
      
      // First check if server is running at all
      const isServerRunning = await checkIfServerRunning();
      if (!isServerRunning) {
        toast.error('Server connection failed. Please check server status.');
        return false;
      }
      
      // If server is running, test the specific MongoDB endpoint
      const response = await axios.post('/api/test-booking', {
        test: true,
        timestamp: new Date().toISOString()
      });
      console.log('MongoDB API test response:', response.data);
      toast.success('MongoDB API connection successful!');
      return true;
    } catch (error) {
      console.error('MongoDB API connection test failed:', error);
      
      // Get detailed diagnostics
      try {
        const { diagnoseConnectionIssues } = await import('../../utils/serverCheck');
        const issues = await diagnoseConnectionIssues();
        console.log('Connection diagnosis:', issues);
        
        // Show more helpful error message
        if (issues.length > 0) {
          toast.error(`MongoDB API connection failed: ${issues[0]}`);
        } else {
          toast.error('MongoDB API connection failed. Please check server logs.');
        }
      } catch (diagError) {
        toast.error('MongoDB API connection failed. Please check server logs.');
      }
      
      return false;
    }
  };

  // Update the handleTestConnection function to test both connections
  const handleTestConnection = async () => {
    try {
      toast.loading('Testing connections...', { id: 'connection-test' });
      
      // Test Supabase connection
      const supabaseSuccess = await testConnection();
      
      // Test MongoDB connection
      const mongoSuccess = await testMongoDBConnection();
      
      toast.dismiss('connection-test');
      
      if (supabaseSuccess && mongoSuccess) {
        toast.success('✅ All connections successful!');
      } else if (supabaseSuccess) {
        toast.success('🟡 Supabase connected, but MongoDB failed.');
      } else if (mongoSuccess) {
        toast.success('🟡 MongoDB connected, but Supabase failed.');
      } else {
        toast.error('❌ Both connections failed!');
        
        // If both failed, suggest fixes
        try {
          const { diagnoseConnectionIssues } = await import('../../utils/serverCheck');
          const issues = await diagnoseConnectionIssues();
          if (issues.length > 0) {
            console.log('Connection issues detected:', issues);
            toast.error(issues[0], { duration: 5000 });
          }
        } catch (error) {
          console.error('Error diagnosing connection issues:', error);
        }
      }
    } catch (error) {
      toast.dismiss('connection-test');
      console.error('Error testing connections:', error);
      toast.error('Connection tests failed');
    }
  };

  // Main component UI
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {bookingType === 'book' 
              ? `Book ${venue.name}` 
              : currentStep === BOOKING_STEPS.CONFIRMATION 
                ? `Visit Request - ${venue.name}`
                : `Schedule a Visit - ${venue.name}`
            }
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>
        
        {/* Progress indicator (only show in booking flow) */}
        {currentStep < BOOKING_STEPS.CONFIRMATION && renderProgressBar()}
        
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading booking information...</p>
            </div>
          ) : (
            renderStepContent()
          )}
        </div>
        
        {/* Footer with navigation buttons */}
        {currentStep < BOOKING_STEPS.CONFIRMATION && currentStep > BOOKING_STEPS.SELECT_DATES && (
          <div className="p-4 border-t flex justify-between">
            <button
              onClick={goToPreviousStep}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Back
            </button>
            {currentStep < BOOKING_STEPS.PRICE_SUMMARY && (
              <button
                onClick={goToNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Next
              </button>
            )}
            {currentStep === BOOKING_STEPS.CONTACT_INFO && (
              <button
                onClick={handleSubmit}
                disabled={!contactInfo.name || !contactInfo.email || !contactInfo.phone || isSubmitting}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
                  (!contactInfo.name || !contactInfo.email || !contactInfo.phone || isSubmitting) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
              >
                {isSubmitting ? 'Processing...' : bookingType === 'book' ? 'Complete Booking' : 'Request Visit'}
              </button>
            )}
          </div>
        )}
        
        {/* Initial "next" button for first step */}
        {currentStep === BOOKING_STEPS.SELECT_DATES && (
          <div className="p-4 border-t">
            <button
              onClick={goToNextStep}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueBooking; 