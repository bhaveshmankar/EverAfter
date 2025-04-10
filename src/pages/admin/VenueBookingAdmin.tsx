import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'react-calendar';
import { X, Check, Users, Calendar as CalendarIcon, Clock, Trash } from 'lucide-react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import 'react-calendar/dist/Calendar.css';
import { Booking, Venue, VenueVisitRequest } from '../../lib/types/venue';
import { updateVenueAvailability } from '../../lib/services/bookingService';
import toast from 'react-hot-toast';

const VenueBookingAdmin = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [visitRequests, setVisitRequests] = useState<VenueVisitRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDateAvailable, setIsDateAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'visits' | 'availability'>('bookings');
  
  // Fetch venues on component mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const venuesRef = collection(db, 'venues');
        const venuesSnapshot = await getDocs(venuesRef);
        const venuesList: Venue[] = [];
        
        venuesSnapshot.forEach(doc => {
          const venueData = doc.data() as Venue;
          venuesList.push({ ...venueData, id: doc.id });
        });
        
        setVenues(venuesList);
        
        if (venuesList.length > 0) {
          setSelectedVenue(venuesList[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching venues:', error);
        toast.error('Failed to load venues');
        setIsLoading(false);
      }
    };
    
    fetchVenues();
  }, []);
  
  // Fetch bookings and visit requests when a venue is selected
  useEffect(() => {
    if (!selectedVenue) return;
    
    // Set up real-time listener for bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      orderBy('date', 'desc')
    );
    
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsList: Booking[] = [];
      snapshot.forEach(doc => {
        const bookingData = doc.data() as Booking;
        
        // Only include bookings for the selected venue
        if (bookingData.venueId === selectedVenue.id) {
          bookingsList.push({
            ...bookingData,
            id: doc.id
          } as Booking);
        }
      });
      
      setBookings(bookingsList);
    });
    
    // Set up real-time listener for visit requests
    const visitsQuery = query(
      collection(db, 'venueVisits'),
      orderBy('preferredDate', 'desc')
    );
    
    const unsubscribeVisits = onSnapshot(visitsQuery, (snapshot) => {
      const visitsList: VenueVisitRequest[] = [];
      snapshot.forEach(doc => {
        const visitData = doc.data() as VenueVisitRequest;
        
        // Only include visits for the selected venue
        if (visitData.venueId === selectedVenue.id) {
          visitsList.push({
            ...visitData,
            id: doc.id
          } as VenueVisitRequest & { id: string });
        }
      });
      
      setVisitRequests(visitsList);
    });
    
    return () => {
      unsubscribeBookings();
      unsubscribeVisits();
    };
  }, [selectedVenue]);
  
  // Check if a selected date is available
  useEffect(() => {
    if (!selectedVenue) return;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const availability = selectedVenue.availability?.find(date => date.date === dateString);
    
    if (availability) {
      setIsDateAvailable(availability.isAvailable);
    } else {
      // Default to available if no explicit availability is set
      setIsDateAvailable(true);
    }
  }, [selectedVenue, selectedDate]);
  
  // Format date
  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  };
  
  // Handle venue selection
  const handleVenueChange = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    if (venue) {
      setSelectedVenue(venue);
    }
  };
  
  // Update availability for a date
  const toggleDateAvailability = async () => {
    if (!selectedVenue) return;
    
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      // Update venue in Firestore
      await updateVenueAvailability(selectedVenue.id, dateString, !isDateAvailable);
      
      // Update local state
      setIsDateAvailable(!isDateAvailable);
      if (!isDateAvailable) {
        toast.success(`${dateString} is now available for booking`);
      } else {
        toast.success(`${dateString} is now marked as unavailable`);
      }
      
      // Update local venue object
      if (selectedVenue) {
        setSelectedVenue({
          ...selectedVenue,
          availability: selectedVenue.availability?.map(date =>
            date.date === dateString ? { ...date, isAvailable: !isDateAvailable } : date
          )
        });
      }
    } catch (error) {
      console.error('Error updating date availability:', error);
      toast.error('Failed to update availability');
    }
  };
  
  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: newStatus });
      toast.success(`Booking marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };
  
  // Update visit request status
  const updateVisitStatus = async (visitId: string, newStatus: string) => {
    try {
      const visitRef = doc(db, 'venueVisits', visitId);
      await updateDoc(visitRef, { status: newStatus });
      toast.success(`Visit request marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating visit status:', error);
      toast.error('Failed to update visit status');
    }
  };
  
  // Delete booking
  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }
    
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await deleteDoc(bookingRef);
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };
  
  // Delete visit request
  const deleteVisit = async (visitId: string) => {
    if (!confirm('Are you sure you want to delete this visit request? This action cannot be undone.')) {
      return;
    }
    
    try {
      const visitRef = doc(db, 'venueVisits', visitId);
      await deleteDoc(visitRef);
      toast.success('Visit request deleted successfully');
    } catch (error) {
      console.error('Error deleting visit request:', error);
      toast.error('Failed to delete visit request');
    }
  };
  
  // Calendar tile class based on availability
  const getTileClassName = ({ date }: { date: Date }) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const availability = selectedVenue?.availability?.find(a => a.date === dateString);
    
    if (!availability) return '';
    
    return availability.isAvailable 
      ? 'bg-green-100 hover:bg-green-200' 
      : 'bg-red-100 hover:bg-red-200';
  };
  
  // Handle date selection
  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };
  
  // Render booking status badge
  const renderStatusBadge = (status: string) => {
    let bgColor = 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'confirmed':
        bgColor = 'bg-green-100 text-green-800';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100 text-red-800';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'completed':
        bgColor = 'bg-blue-100 text-blue-800';
        break;
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status}
      </span>
    );
  };
  
  // Render bookings tab
  const renderBookingsTab = () => {
    if (bookings.length === 0) {
      return (
        <div className="text-center py-10">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
          <p className="mt-1 text-sm text-gray-500">There are no bookings for this venue yet.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(booking.date)}
                      </div>
                      {booking.endDate && (
                        <div className="text-sm text-gray-500">
                          to {formatDate(booking.endDate)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {booking.timeSlot}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.contactName}</div>
                  <div className="text-sm text-gray-500">{booking.contactEmail}</div>
                  <div className="text-sm text-gray-500">{booking.contactPhone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{booking.guestCount} guests</span>
                  </div>
                  <div className="text-sm text-gray-900">₹{booking.price.toLocaleString()}</div>
                  {booking.specialRequests && (
                    <div className="text-xs text-gray-500 mt-1">
                      Note: {booking.specialRequests}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatusBadge(booking.status || 'pending')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {booking.status !== 'confirmed' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id as string, 'confirmed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Confirm
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id as string, 'cancelled')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      onClick={() => deleteBooking(booking.id as string)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render visits tab
  const renderVisitsTab = () => {
    if (visitRequests.length === 0) {
      return (
        <div className="text-center py-10">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No visit requests</h3>
          <p className="mt-1 text-sm text-gray-500">There are no visit requests for this venue yet.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preferred Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visitor Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visitRequests.map((visit) => (
              <tr key={visit.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(visit.preferredDate)}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="mr-1 h-3 w-3" />
                        {visit.preferredTime}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{visit.name}</div>
                  <div className="text-sm text-gray-500">{visit.email}</div>
                  <div className="text-sm text-gray-500">{visit.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {visit.notes && (
                    <div className="text-sm text-gray-500">
                      {visit.notes}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatusBadge(visit.status || 'pending')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {visit.status !== 'approved' && (
                      <button 
                        onClick={() => updateVisitStatus(visit.id as string, 'approved')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                    )}
                    {visit.status !== 'completed' && visit.status === 'approved' && (
                      <button 
                        onClick={() => updateVisitStatus(visit.id as string, 'completed')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Complete
                      </button>
                    )}
                    {visit.status !== 'cancelled' && (
                      <button 
                        onClick={() => updateVisitStatus(visit.id as string, 'cancelled')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      onClick={() => deleteVisit(visit.id as string)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render availability tab
  const renderAvailabilityTab = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Calendar</h3>
          <Calendar 
            onChange={handleDateChange}
            value={selectedDate}
            tileClassName={getTileClassName}
            className="w-full border rounded-md"
          />
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 mr-2 rounded-sm"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 mr-2 rounded-sm"></div>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Date</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Availability Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isDateAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isDateAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <button
                onClick={toggleDateAvailability}
                className={`mt-4 inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDateAvailable
                    ? 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500'
                    : 'border-green-300 text-green-700 bg-white hover:bg-green-50 focus:ring-green-500'
                }`}
              >
                {isDateAvailable ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Mark as Unavailable
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Available
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Existing Bookings for this Date</div>
              {bookings.filter(b => b.date === format(selectedDate, 'yyyy-MM-dd')).length > 0 ? (
                <ul className="space-y-3">
                  {bookings
                    .filter(b => b.date === format(selectedDate, 'yyyy-MM-dd'))
                    .map(booking => (
                      <li key={booking.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{booking.contactName}</div>
                            <div className="text-sm text-gray-500">{booking.guestCount} guests</div>
                          </div>
                          {renderStatusBadge(booking.status || 'pending')}
                        </div>
                      </li>
                    ))
                  }
                </ul>
              ) : (
                <div className="text-sm text-gray-500">No bookings for this date.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Venue Booking Management</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Venue selector */}
          <div className="mb-6">
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
              Select Venue
            </label>
            <select
              id="venue"
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedVenue?.id || ''}
              onChange={(e) => handleVenueChange(e.target.value)}
            >
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.location}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'visits'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Visit Requests
              </button>
              <button
                onClick={() => setActiveTab('availability')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'availability'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Availability Calendar
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="mt-6">
            {activeTab === 'bookings' && renderBookingsTab()}
            {activeTab === 'visits' && renderVisitsTab()}
            {activeTab === 'availability' && renderAvailabilityTab()}
          </div>
        </>
      )}
    </div>
  );
};

export default VenueBookingAdmin; 