import { useState, useEffect } from 'react';
import { MessageCircle, X, Plus } from 'lucide-react';
import VenueSearch from '../components/venues/VenueSearch';
import VenueCard from '../components/venues/VenueCard';
import VirtualTour from '../components/venues/VirtualTour';
import VenueDetail from '../components/venues/VenueDetail';
import VenueCompare from '../components/venues/VenueCompare';
import { Venue, SearchFilters } from '../lib/types/venue';

// Mock data - in a real app, this would come from an API
const mockVenues: Venue[] = [
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
      'https://image.wedmegood.com/resized/450X/uploads/member/20925/1711457028_MEL_5017_2.jpg?crop=8,82,2031,1142',
      'https://images.unsplash.com/photo-1574691250077-03a929faece5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526786220381-1d21eedf92bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',      
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
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
    availability: [
      {
        date: '2023-10-15',
        isAvailable: true,
        price: 250000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: false }
        ]
      },
      {
        date: '2023-10-28',
        isAvailable: true,
        price: 200000,
        timeSlots: [
          { time: 'Morning', isAvailable: false },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      }
    ]
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
    mainImage: 'https://images.unsplash.com/photo-1526786220381-1d21eedf92bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      
    ],
    tags: ['Resort', 'Palace', 'Lake View', 'Luxury', 'Pool'],
    description: 'A luxurious resort with breathtaking lake views, perfect for royal weddings and grand celebrations.',
    hasVirtualTour: true,
    virtualTourImages: [
      'https://images.unsplash.com/photo-1526786220381-1d21eedf92bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588015260009-559cbe8e7bf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { name: 'Wi-Fi', icon: 'wifi' },
      { name: 'Lake View', icon: 'view' },
      { name: 'Swimming Pool', icon: 'pool' },
      { name: 'Spa', icon: 'spa' },
      { name: 'Fine Dining', icon: 'restaurant' }
    ],
    availability: [
      {
        date: '2023-10-20',
        isAvailable: true,
        price: 350000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      },
      {
        date: '2023-11-12',
        isAvailable: true,
        price: 400000,
        timeSlots: [
          { time: 'Morning', isAvailable: false },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      }
    ]
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
    hasVirtualTour: true,
    virtualTourImages: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518997351272-4ea05033641c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515923027836-58adb0ef70c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { name: 'Garden', icon: 'garden' },
      { name: 'Parking', icon: 'parking' },
      { name: 'Outdoor Seating', icon: 'outdoor' },
      { name: 'In-house Catering', icon: 'catering' },
      { name: 'DJ', icon: 'music' }
    ],
    availability: [
      {
        date: '2023-10-10',
        isAvailable: true,
        price: 150000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      },
      {
        date: '2023-10-25',
        isAvailable: true,
        price: 180000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: false },
          { time: 'Evening', isAvailable: true }
        ]
      }
    ]
  },
  {
    id: "4a1b3c5d-7e8f-9g0h-1i2j-3k4l5m6n7o8p",
    name: 'Taj Skyline',
    location: 'Delhi, Delhi',
    priceRange: {
      min: 200000,
      max: 600000,
    },
    rating: 4.7,
    reviews: 172,
    capacity: {
      min: 100,
      max: 600,
    },
    mainImage: 'https://images.unsplash.com/photo-1548777121-ec2890161c3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509610973147-232dfea52a97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['Hotel', 'Rooftop', 'City View', '5-Star', 'Indoor'],
    description: 'An elegant hotel with stunning city views from its rooftop venue, ideal for sophisticated ceremonies.',
    hasVirtualTour: false,
    amenities: [
      { name: 'Rooftop', icon: 'building' },
      { name: 'City View', icon: 'view' },
      { name: 'Indoor AC', icon: 'air-conditioning' },
      { name: 'Valet Parking', icon: 'parking' },
      { name: 'Bar Service', icon: 'bar' }
    ],
    availability: [
      {
        date: '2023-10-05',
        isAvailable: true,
        price: 300000,
        timeSlots: [
          { time: 'Morning', isAvailable: false },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      },
      {
        date: '2023-10-15',
        isAvailable: true,
        price: 350000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      }
    ]
  },
  {
    id: "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
    name: 'Beachside Manor',
    location: 'Goa, Goa',
    priceRange: {
      min: 180000,
      max: 450000,
    },
    rating: 4.5,
    reviews: 91,
    capacity: {
      min: 50,
      max: 200,
    },
    mainImage: 'https://images.unsplash.com/photo-1535254973040-607b474fe814?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://r1imghtlak.mmtcdn.com/fe0b3756-c4fd-446a-b0cb-182a9795aaa3.jpg',
      'https://r1imghtlak.mmtcdn.com/36d3d7267c7711ee82020a58a9feac02.jfif',
      'https://r2imghtlak.mmtcdn.com/r2-mmt-htl-image/htl-imgs/200902181022218554-e516a936a6e211ee91330a58a9feac02.jpg',
      'https://r1imghtlak.mmtcdn.com/79d57826914511eeba080a58a9feac02.png',
    ],
    tags: ['Beach', 'Sea View', 'Outdoor', 'Sunset'],
    description: 'A picturesque beachside venue offering stunning sunset views and a relaxed atmosphere.',
    hasVirtualTour: false,
    amenities: [
      { name: 'Beach Access', icon: 'beach' },
      { name: 'Sunset View', icon: 'sun' },
      { name: 'Outdoor Seating', icon: 'outdoor' },
      { name: 'Beach Décor', icon: 'decor' },
      { name: 'Bonfire', icon: 'fire' }
    ],
    availability: [
      {
        date: '2023-10-02',
        isAvailable: true,
        price: 220000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      },
      {
        date: '2023-10-18',
        isAvailable: true,
        price: 250000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      }
    ]
  },
  {
    id: "6d7e8f9a-0b1c-2d3e-4f5g-6h7i8j9k0l1m",
    name: 'Mountain View Retreat',
    location: 'Shimla, Himachal Pradesh',
    priceRange: {
      min: 120000,
      max: 300000,
    },
    rating: 4.7,
    reviews: 84,
    capacity: {
      min: 50,
      max: 250,
    },
    mainImage: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://r2imghtlak.mmtcdn.com/r2-mmt-htl-image/htl-imgs/200808052118502029-bd5b8b70cc6711ec853f0a58a9feac02.jpg',
      'https://r2imghtlak.mmtcdn.com/r2-mmt-htl-image/room-imgs/202312281041556916-31-1850c3ba-805b-4f29-bfea-156930d7f3e2.jpg',
      'https://r1imghtlak.mmtcdn.com/4ecef7c7-d878-4af5-9d81-66270ccf6dfa.jpg',
      'https://r2imghtlak.mmtcdn.com/r2-mmt-htl-image/htl-imgs/200808052118502029-53a195deb1a511edb1c00a58a9feac02.jpg',
    ],
    tags: ['Mountain', 'Hill Station', 'Scenic', 'Cool Weather'],
    description: 'A serene mountain retreat offering breathtaking views and cool weather, perfect for intimate weddings.',
    hasVirtualTour: true,
    virtualTourImages: [
      'https://images.unsplash.com/photo-1507290439931-a861b5a38200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { name: 'Mountain View', icon: 'mountain' },
      { name: 'Fireplace', icon: 'fire' },
      { name: 'Terrace', icon: 'terrace' },
      { name: 'Hiking Trails', icon: 'hiking' },
      { name: 'Bonfire', icon: 'fire' }
    ],
    availability: [
      {
        date: '2023-10-08',
        isAvailable: true,
        price: 150000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: false }
        ]
      },
      {
        date: '2023-10-22',
        isAvailable: true,
        price: 180000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      }
    ]
  },
  {
    id: "7e8f9a0b-1c2d-3e4f-5g6h-7i8j9k0l1m2n",
    name: 'Heritage Haveli',
    location: 'Jaipur, Rajasthan',
    priceRange: {
      min: 220000,
      max: 550000,
    },
    rating: 4.8,
    reviews: 138,
    capacity: {
      min: 100,
      max: 400,
    },
    mainImage: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526786220381-1d21eedf92bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['Palace', 'Heritage', 'Royal', 'Cultural'],
    description: 'An authentic heritage haveli with traditional Rajasthani architecture and royal ambiance.',
    hasVirtualTour: true,
    virtualTourImages: [
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { name: 'Heritage Architecture', icon: 'building' },
      { name: 'Courtyard', icon: 'courtyard' },
      { name: 'Royal Decor', icon: 'decor' },
      { name: 'Cultural Programs', icon: 'music' },
      { name: 'Traditional Catering', icon: 'catering' }
    ],
    availability: [
      {
        date: '2023-10-12',
        isAvailable: true,
        price: 300000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: false },
          { time: 'Evening', isAvailable: true }
        ]
      },
      {
        date: '2023-10-26',
        isAvailable: true,
        price: 350000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      }
    ]
  },
  {
    id: "8f9a0b1c-2d3e-4f5g-6h7i-8j9k0l1m2n3o",
    name: 'Silver Bay Resort',
    location: 'Chennai, Tamil Nadu',
    priceRange: {
      min: 160000,
      max: 400000,
    },
    rating: 4.5,
    reviews: 76,
    capacity: {
      min: 80,
      max: 350,
    },
    mainImage: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/591666268.jpg?k=1240f08deb894e132059b63c37f4287924df495a4b3de7fb48afcbe107d0aece&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/488634406.jpg?k=e3c1f3563ac9800b4ed1ed59bfb2e362bd1257e8ea38904cf46c4e207975c00e&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/508288335.jpg?k=4696698eebc7949608e11148b572a8e7e9491f07f8a33aa8338a740b3851d304&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/602208894.jpg?k=6b330d611ca207784734b2945689ca70887ff8f6d738612c1e9b5d79e4297c2d&o=&hp=1',
    ],
    tags: ['Beach', 'Resort', 'Coastal', 'Poolside'],
    description: 'A coastal resort with beautiful bay views, swimming pools, and spacious event areas.',
    hasVirtualTour: false,
    amenities: [
      { name: 'Swimming Pool', icon: 'pool' },
      { name: 'Bay View', icon: 'view' },
      { name: 'Beach Access', icon: 'beach' },
      { name: 'Spa', icon: 'spa' },
      { name: 'Restaurant', icon: 'restaurant' }
    ],
    availability: [
      {
        date: '2023-10-05',
        isAvailable: true,
        price: 200000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: true }
        ]
      },
      {
        date: '2023-10-19',
        isAvailable: true,
        price: 220000,
        timeSlots: [
          { time: 'Morning', isAvailable: true },
          { time: 'Afternoon', isAvailable: true },
          { time: 'Evening', isAvailable: false }
        ]
      }
    ]
  }
];

// Mock tour images (in a real app, these would be actual 360° images)
const mockTourImages = [
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
];

// Create a Spinner component for loading states
const Spinner = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
  </div>
);

const Venues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for venues to compare
  const [compareVenues, setCompareVenues] = useState<Venue[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  
  // State for virtual tour
  const [tourVenue, setTourVenue] = useState<Venue | null>(null);
  const [showTour, setShowTour] = useState(false);
  
  // State for venue details
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  // State for wishlist
  const [wishlistedVenues, setWishlistedVenues] = useState<string[]>([]);
  
  // State for showing chat
  const [showChat, setShowChat] = useState(false);
  
  // Load venues with a simulated delay on component mount
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setVenues(mockVenues);
      setFilteredVenues(mockVenues);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to handle search
  const handleSearch = (filters: SearchFilters) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filtered = [...venues];
      
      // Filter by location
      if (filters.location) {
        filtered = filtered.filter(venue => 
          venue.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      
      // Filter by date
      if (filters.date) {
        filtered = filtered.filter(venue => 
          venue.availability.some(avail => avail.date === filters.date)
        );
      }
      
      // Filter by guest count
      if (filters.guestCount) {
        const [min, max] = filters.guestCount.split('-').map(Number);
        filtered = filtered.filter(venue => {
          if (!max) return venue.capacity.min >= min; // "Above X" case
          return venue.capacity.min <= max && venue.capacity.max >= min;
        });
      }
      
      // Filter by budget
      if (filters.budget) {
        const [min, max] = filters.budget.split('-').map(Number);
        filtered = filtered.filter(venue => {
          if (!max) return venue.priceRange.min >= min; // "Above X" case
          return venue.priceRange.min >= min && venue.priceRange.min <= max;
        });
      }
      
      // Filter by venue type
      if (filters.venueType && filters.venueType.length > 0) {
        filtered = filtered.filter(venue => 
          filters.venueType!.some(type => venue.tags.includes(type))
        );
      }
      
      // Filter by rating
      if (filters.rating) {
        filtered = filtered.filter(venue => venue.rating >= filters.rating!);
      }
      
      setFilteredVenues(filtered);
      setIsLoading(false);
    }, 1000); // Simulate 1 second delay
  };
  
  // Handle venue detail view
  const handleViewDetails = (id: string) => {
    const venue = venues.find(v => v.id === id);
    if (venue) {
      setSelectedVenue(venue);
    }
  };
  
  // Handle toggling venue in wishlist
  const handleToggleWishlist = (id: string) => {
    setWishlistedVenues(prev => {
      if (prev.includes(id)) {
        return prev.filter(venueId => venueId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle starting virtual tour
  const handleStartVirtualTour = (id: string) => {
    const venue = venues.find(v => v.id === id);
    if (venue) {
      setTourVenue(venue);
      setShowTour(true);
    }
  };
  
  // Handle adding venue to compare
  const handleAddToCompare = (id: string) => {
    const venue = venues.find(v => v.id === id);
    
    if (venue && !compareVenues.some(v => v.id === id)) {
      if (compareVenues.length < 4) {
        setCompareVenues(prev => [...prev, venue]);
      } else {
        alert('You can compare up to 4 venues at a time');
      }
    }
  };
  
  // Handle removing venue from compare
  const handleRemoveFromCompare = (id: string) => {
    setCompareVenues(prev => prev.filter(venue => venue.id !== id));
    
    if (compareVenues.length <= 1) {
      setShowCompare(false);
    }
  };
  
  // Check if the venue is in compare list
  const isInCompare = (id: string) => {
    return compareVenues.some(venue => venue.id === id);
  };
  
  return (
    <div className="min-h-screen pt-16 bg-white">
      {/* Hero section with search */}
      <div className="bg-gradient-to-r from-rose-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">Find Your Perfect Wedding Venue</h1>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-8">
            Discover and book the ideal venue for your special day with our advanced search,
            virtual tours, and real-time availability checker.
          </p>
          
          {/* Search component */}
          <div className="max-w-4xl mx-auto">
            <VenueSearch onSearch={handleSearch} />
          </div>
        </div>
      </div>
      
      {/* Venue listings */}
      <div className="container mx-auto px-4 py-10">
        {/* Results info and compare button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isLoading ? 'Searching...' : `${filteredVenues.length} Venues Found`}
          </h2>
          
          {compareVenues.length > 0 && (
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full"
            >
              Compare {compareVenues.length} Venues
            </button>
          )}
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <Spinner />
        )}
        
        {/* Show empty state when no results */}
        {!isLoading && filteredVenues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <img 
              src="https://illustrations.popsy.co/amber/not-found.svg" 
              alt="No results found" 
              className="w-64 h-64 mb-6"
            />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No venues found</h3>
            <p className="text-gray-600 max-w-md mb-6">
              We couldn't find any venues matching your criteria. Try adjusting your filters or search for something else.
            </p>
            <button
              onClick={() => {
                // Reset all filters
                setFilteredVenues(venues);
              }}
              className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
            >
              Clear All Filters
            </button>
          </div>
        )}
        
        {/* Venue cards grid */}
        {!isLoading && filteredVenues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map(venue => (
              <div key={venue.id} className="relative">
                <VenueCard
                  venue={venue}
                  onViewDetails={handleViewDetails}
                  onToggleWishlist={handleToggleWishlist}
                  onStartVirtualTour={handleStartVirtualTour}
                  isWishlisted={wishlistedVenues.includes(venue.id)}
                />
                
                {/* Compare button */}
                {isInCompare(venue.id) ? (
                  <button
                    onClick={() => handleRemoveFromCompare(venue.id)}
                    className="absolute bottom-4 left-4 p-2 bg-blue-600 text-white rounded-full flex items-center shadow-md"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddToCompare(venue.id)}
                    className="absolute bottom-4 left-4 p-2 bg-white text-blue-600 rounded-full flex items-center shadow-md"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Chat support button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowChat(!showChat)}
          className={`p-4 rounded-full shadow-lg ${
            showChat ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
          }`}
        >
          {showChat ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
        
        {/* Chat panel */}
        {showChat && (
          <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="font-medium">Chat with Venue Expert</h3>
              <p className="text-sm text-blue-100">We typically reply in a few minutes</p>
            </div>
            <div className="h-80 p-4 overflow-y-auto bg-gray-50">
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg rounded-bl-none mb-4 max-w-[80%]">
                Hi there! 👋 How can I help you find the perfect wedding venue today?
              </div>
              <div className="flex justify-end">
                <div className="bg-white text-gray-800 p-3 rounded-lg rounded-br-none shadow mb-4 max-w-[80%]">
                  I'm looking for a venue with a garden area in Mumbai.
                </div>
              </div>
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                Great choice! I can help you with that. We have several beautiful garden venues in Mumbai. 
                Are you looking for something specific in terms of capacity or budget?
              </div>
            </div>
            <div className="p-3 border-t flex">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 p-2 border rounded-l-md focus:outline-none"
              />
              <button className="bg-blue-600 text-white p-2 rounded-r-md">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Virtual tour modal */}
      {showTour && tourVenue && (
        <VirtualTour
          venueId={tourVenue.id}
          venueName={tourVenue.name}
          tourImages={mockTourImages}
          onClose={() => {
            setShowTour(false);
            setTourVenue(null);
          }}
        />
      )}
      
      {/* Venue details modal */}
      {selectedVenue && (
        <VenueDetail
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          onStartVirtualTour={handleStartVirtualTour}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlistedVenues.includes(selectedVenue.id)}
        />
      )}
      {/* Venue comparison modal */}
      {showCompare && compareVenues.length > 0 && (
        <VenueCompare
          venues={compareVenues}
          onClose={() => setShowCompare(false)}
          onRemoveVenue={handleRemoveFromCompare}
          onViewDetails={handleViewDetails}
          onToggleWishlist={handleToggleWishlist}
          wishlistedVenues={wishlistedVenues}
        />
      )}
    </div>
  );
};

export default Venues; 