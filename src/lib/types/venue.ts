export interface Venue {
  id: string;
  name: string;
  location: string;
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  reviews: number;
  capacity: {
    min: number;
    max: number;
  };
  mainImage: string;
  images: string[];
  description: string;
  tags: string[];
  hasVirtualTour: boolean;
  virtualTourImages?: string[];
  amenities: {
    name: string;
    icon: string;
  }[];
  availability: {
    date: string;
    isAvailable: boolean;
    price: number;
    timeSlots: {
      time: string;
      isAvailable: boolean;
    }[];
  }[];
}

export interface SearchFilters {
  location?: string;
  date?: string;
  guests?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  rating?: number;
  venueType?: string[];
  budget?: string;
  guestCount?: string;
}

export interface AvailabilityDate {
  date: string;
  isAvailable: boolean;
  price: number;
  timeSlots: {
    time: string;
    isAvailable: boolean;
  }[];
}

export interface Booking {
  id?: string;
  venueId: string;
  userId?: string;
  date: string;
  endDate?: string;
  timeSlot: string;
  guestCount: number;
  price: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
  status?: string;
  createdAt?: any;
}

export interface VenueVisitRequest {
  id?: string;
  venueId: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status?: string;
  createdAt?: any;
} 