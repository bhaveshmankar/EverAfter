import { Mail, Palette, Building2, PartyPopper, UtensilsCrossed, Users, ClipboardList, LineChart, Bot } from 'lucide-react';

const services = [
  {
    icon: <Mail className="h-12 w-12 text-rose-500" />,
    title: 'Digital Invitations',
    description: 'Create and share beautiful digital invitations with RSVP tracking.',
    features: [
      'Customizable templates with elegant designs',
      'Easy sharing via WhatsApp, Email, and Social Media',
      'RSVP tracking and guest list management'
    ]
  },
  {
    icon: <Palette className="h-12 w-12 text-rose-500" />,
    title: 'Beauty & Makeup Services',
    description: 'Connect with professional makeup artists for your perfect look.',
    features: [
      'Professional bridal makeup artists & stylists',
      'Trial makeup sessions & premium bridal packages',
      'Salon and at-home service options'
    ]
  },
  {
    icon: <Building2 className="h-12 w-12 text-rose-500" />,
    title: 'Venue Booking',
    description: 'Find and book the perfect venue for your special day.',
    features: [
      'Search & filter venues by location and budget',
      '360° Virtual Tour and real-time booking',
      'Exclusive deals with premium venues'
    ]
  },
  {
    icon: <PartyPopper className="h-12 w-12 text-rose-500" />,
    title: 'Decoration & Theme Setup',
    description: 'Transform your venue with stunning decorations.',
    features: [
      'Pre-designed themes for every style',
      'Customizable floral and lighting options',
      'Professional decoration services'
    ]
  },
  {
    icon: <UtensilsCrossed className="h-12 w-12 text-rose-500" />,
    title: 'Catering Services',
    description: 'Delight your guests with exceptional cuisine.',
    features: [
      'Wide variety of cuisines available',
      'Customizable packages for any size',
      'Tasting sessions included'
    ]
  },
  {
    icon: <LineChart className="h-12 w-12 text-rose-500" />,
    title: 'Budget Planning', 
    description: 'Keep track of your wedding expenses effortlessly.',
    features: [
      'Smart budget calculator',
      'Real-time expense tracking',
      'Detailed financial reports'
    ]
  },
  {
    icon: <Users className="h-12 w-12 text-rose-500" />,
    title: 'Vendor Management',
    description: 'Work with verified vendors for a smooth experience.',
    features: [
      'Verified vendors with reviews',
      'Direct communication channel',
      'Secure booking & payments'
    ]
  },
  {
    icon: <ClipboardList className="h-12 w-12 text-rose-500" />,
    title: 'Guest Management',
    description: 'Organize your guest list and seating arrangements.',
    features: [
      'Digital guest list management',
      'Automated RSVP tracking',
      'Seating arrangement planner'
    ]
  },
  {
    icon: <Bot className="h-12 w-12 text-rose-500" />,
    title: 'AI Wedding Assistant',
    description: 'Get personalized help with planning your wedding.',
    features: [
      'AI-powered recommendations',
      'Automated task checklist',
      '24/7 chatbot assistance'
    ]
  }
];

const Services = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
            alt="Wedding services"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Our Wedding Services
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Everything you need to plan and execute your perfect wedding day, all in one place.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 text-center mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600">
                      <span className="h-2 w-2 bg-rose-500 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="mt-8 w-full bg-rose-500 text-white py-2 px-4 rounded-md hover:bg-rose-600 transition-colors duration-300">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;