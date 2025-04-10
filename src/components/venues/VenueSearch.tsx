import { useState } from 'react';
import { Search, MapPin, Calendar, Users, Filter as FilterIcon, ChevronDown, X } from 'lucide-react';
import { SearchFilters } from '../../lib/types/venue';

// City options for location filter
const cityOptions = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Jaipur', 'Udaipur', 'Goa'
];

// Venue type options
const venueTypes = [
  'Banquet Hall', 'Resort', 'Hotel', 'Garden', 'Beach', 
  'Palace', 'Destination', 'Farmhouse', 'Club', 'Temple'
];

// Budget ranges
const budgetRanges = [
  { label: 'Under ₹50,000', value: '0-50000' },
  { label: '₹50,000 - ₹1,00,000', value: '50000-100000' },
  { label: '₹1,00,000 - ₹3,00,000', value: '100000-300000' },
  { label: '₹3,00,000 - ₹5,00,000', value: '300000-500000' },
  { label: '₹5,00,000 - ₹10,00,000', value: '500000-1000000' },
  { label: 'Above ₹10,00,000', value: '1000000-' }
];

// Guest capacity ranges
const guestCapacityRanges = [
  { label: 'Less than 100', value: '0-100' },
  { label: '100 - 250', value: '100-250' },
  { label: '250 - 500', value: '250-500' },
  { label: '500 - 1000', value: '500-1000' },
  { label: 'Above 1000', value: '1000-' }
];

interface VenueSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

const VenueSearch = ({ onSearch }: VenueSearchProps) => {
  // State for filters
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    venueType: [],
    date: '',
    budget: '',
    guestCount: '',
    rating: undefined
  });
  
  // State for showing filter dropdown
  const [showFilters, setShowFilters] = useState(false);
  
  // State for showing location suggestions
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  // Filter city suggestions based on input
  const filteredCities = cityOptions.filter(city => 
    city.toLowerCase().includes(filters.location?.toLowerCase() || '')
  );
  
  // Handle filter changes
  const handleFilterChange = (filterName: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Handle venue type toggle
  const handleVenueTypeToggle = (type: string) => {
    setFilters(prev => {
      const newVenueTypes = prev.venueType?.includes(type)
        ? prev.venueType.filter(t => t !== type)
        : [...(prev.venueType || []), type];
        
      return {
        ...prev,
        venueType: newVenueTypes
      };
    });
  };
  
  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };
  
  return (
    <div className="w-full">
      {/* Main search bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Search input with location icon */}
          <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-gray-200">
            <span className="pl-4 text-gray-400">
              <MapPin size={20} />
            </span>
            <input
              type="text"
              placeholder="Search for venues or locations"
              className="w-full p-4 focus:outline-none"
              value={filters.location}
              onChange={(e) => {
                handleFilterChange('location', e.target.value);
                setShowLocationSuggestions(true);
              }}
            />
            {filters.location && (
              <button
                type="button" 
                className="pr-4 text-gray-400 hover:text-gray-600"
                onClick={() => handleFilterChange('location', '')}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Date picker */}
          <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-gray-200">
            <span className="pl-4 text-gray-400">
              <Calendar size={20} />
            </span>
            <input
              type="date"
              placeholder="Wedding Date"
              className="w-full p-4 focus:outline-none"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />
          </div>
          
          {/* Guest count dropdown */}
          <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-gray-200">
            <span className="pl-4 text-gray-400">
              <Users size={20} />
            </span>
            <select
              className="w-full p-4 focus:outline-none appearance-none bg-transparent"
              value={filters.guestCount}
              onChange={(e) => handleFilterChange('guestCount', e.target.value)}
            >
              <option value="">Guest Count</option>
              {guestCapacityRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <span className="pr-4 text-gray-400 pointer-events-none">
              <ChevronDown size={16} />
            </span>
          </div>
          
          {/* More filters button */}
          <div className="md:w-auto">
            <button
              type="button"
              className="w-full md:w-auto px-6 py-4 flex items-center justify-center text-rose-600 hover:bg-rose-50"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon size={20} className="mr-2" />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Search button */}
          <div className="md:w-auto">
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-medium flex items-center justify-center"
            >
              <Search size={20} className="mr-2" />
              <span>Search</span>
            </button>
          </div>
        </div>
        
        {/* Location suggestions dropdown */}
        {showLocationSuggestions && filters.location && filteredCities.length > 0 && (
          <div className="absolute z-10 left-0 right-0 bg-white shadow-lg rounded-b-lg mt-1 max-h-60 overflow-y-auto">
            <ul>
              {filteredCities.map(city => (
                <li 
                  key={city} 
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => {
                    handleFilterChange('location', city);
                    setShowLocationSuggestions(false);
                  }}
                >
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  {city}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
      
      {/* Advanced filters panel */}
      {showFilters && (
        <div className="mt-4 p-6 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Advanced Filters</h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setShowFilters(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Budget filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Budget Range</h4>
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={filters.budget}
                onChange={(e) => handleFilterChange('budget', e.target.value)}
              >
                <option value="">Any Budget</option>
                {budgetRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Venue type filter */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Venue Type</h4>
              <div className="flex flex-wrap gap-2">
                {venueTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.venueType?.includes(type)
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => handleVenueTypeToggle(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rating filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h4>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    className={`p-1 ${filters.rating && rating <= filters.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => handleFilterChange('rating', rating)}
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </button>
                ))}
                {filters.rating && (
                  <button
                    type="button"
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={() => handleFilterChange('rating', null)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 mr-2"
              onClick={() => {
                setFilters({
                  location: '',
                  venueType: [],
                  date: '',
                  budget: '',
                  guestCount: '',
                  rating: undefined
                });
              }}
            >
              Reset Filters
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
              onClick={() => {
                onSearch(filters);
                setShowFilters(false);
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueSearch; 