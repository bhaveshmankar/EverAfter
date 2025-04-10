import { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for vendors
const vendors = [
  {
    id: 1,
    name: 'Elegant Events',
    category: 'Planner',
    rating: 4.9,
    reviews: 128,
    price: '$$',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Luxury wedding planning services tailored to your needs',
  },
  {
    id: 2,
    name: 'Blooming Bouquets',
    category: 'Florist',
    rating: 4.8,
    reviews: 94,
    price: '$$$',
    image: 'https://mlri412iwjbc.i.optimole.com/cb:c8wx~30e01/w:800/h:533/q:mauto/f:best/https://www.davidaustin.com/wp-content/uploads/2024/11/find-your-wedding-florist.jpg',
    description: 'Stunning floral arrangements that will make your day unforgettable',
  },
  {
    id: 3,
    name: 'Delicious Delights',
    category: 'Catering',
    rating: 4.7,
    reviews: 156,
    price: '$$',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Gourmet catering for weddings and special events',
  },
  {
    id: 4,
    name: 'Dreamy Venues',
    category: 'Venue',
    rating: 4.9,
    reviews: 203,
    price: '$$$',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Beautiful wedding venues for your perfect day',
  },
  {
    id: 5,
    name: 'Capture Forever',
    category: 'Photography',
    rating: 4.8,
    reviews: 112,
    price: '$$$',
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Capturing your special moments with artistic expertise',
  },
  {
    id: 6,
    name: 'Sweet Creations',
    category: 'Cake',
    rating: 4.6,
    reviews: 87,
    price: '$$',
    image: 'https://cityhall.wedding/wp-content/uploads/2023/03/rsz_depositphotos_30355391_s.jpg',
    description: 'Custom wedding cakes that taste as good as they look',
  },
];

const categories = ['All', 'Planner', 'Florist', 'Catering', 'Venue', 'Photography', 'Cake'];
const priceOptions = ['Any', '$', '$$', '$$$'];
const eventTypes = ['Wedding', 'Engagement', 'Bridal Shower', 'Bachelor/Bachelorette', 'Rehearsal Dinner'];

const Wedding = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('Any');
  const [selectedEvent, setSelectedEvent] = useState('Wedding');
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
    const matchesPrice = selectedPrice === 'Any' || vendor.price === selectedPrice;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero section with background image */}
      <div className="relative">
        <div 
          className="h-[500px] bg-cover bg-center flex items-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1523438885200-e635ba2c371e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)' }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">Find Perfect Vendors for Your Special Day</h1>
            <p className="text-white text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Connect with top-rated wedding professionals to make your dream wedding a reality
            </p>
            
            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-full overflow-hidden shadow-lg">
                <div className="px-4 py-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for vendors..."
                  className="flex-1 py-3 px-4 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                {/* Event type dropdown */}
                <div className="relative border-l border-gray-200">
                  <button 
                    className="px-4 py-3 flex items-center text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowEventDropdown(!showEventDropdown)}
                  >
                    {selectedEvent} <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  
                  {showEventDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20">
                      {eventTypes.map((event) => (
                        <button
                          key={event}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventDropdown(false);
                          }}
                        >
                          {event}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Filter button */}
                <button 
                  className="px-4 py-3 bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5 mr-1" />
                  Filters
                </button>
              </div>
              
              {/* Filters dropdown */}
              {showFilters && (
                <div className="bg-white mt-2 p-4 rounded-lg shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <button
                            key={category}
                            className={`px-3 py-1 rounded-full text-sm ${
                              selectedCategory === category
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                      <div className="flex flex-wrap gap-2">
                        {priceOptions.map((price) => (
                          <button
                            key={price}
                            className={`px-3 py-1 rounded-full text-sm ${
                              selectedPrice === price
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                            onClick={() => setSelectedPrice(price)}
                          >
                            {price}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Vendor listings */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Top Wedding Vendors</h2>
        
        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={vendor.image} 
                    alt={vendor.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{vendor.name}</h3>
                      <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                        {vendor.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-500 font-bold">{vendor.price}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{vendor.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(vendor.rating) ? 'fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-gray-600 text-sm">{vendor.rating}</span>
                      </div>
                      <span className="text-gray-500 text-sm ml-2">({vendor.reviews} reviews)</span>
                    </div>
                    <button className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">No vendors found matching your criteria</h3>
            <button 
              className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedPrice('Any');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Digital Invitation CTA Section */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Invite Your Guests?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Create beautiful digital invitations for your wedding with our easy-to-use invitation builder.
            Customize templates, manage RSVPs, and share with your guests in minutes.
          </p>
          <Link 
            to="/invitation" 
            className="inline-block px-8 py-4 bg-pink-600 text-white rounded-full text-lg font-medium hover:bg-pink-700 transform hover:scale-105 transition-all shadow-lg"
          >
            Create Your Digital Invitation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wedding; 