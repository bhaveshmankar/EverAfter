import { Calendar, Camera, Utensils, MapPin, Users, Palette } from 'lucide-react';

const features = [
  {
    icon: <Calendar className="h-8 w-8 text-rose-500" />,
    title: 'Event Planning',
    description: 'Comprehensive planning tools to keep track of every detail of your special day.'
  },
  {
    icon: <Camera className="h-8 w-8 text-rose-500" />,
    title: 'Photography',
    description: 'Connect with top photographers to capture your precious moments.'
  },
  {
    icon: <Utensils className="h-8 w-8 text-rose-500" />,
    title: 'Catering',
    description: 'Find the perfect caterer and create your dream wedding menu.'
  },
  {
    icon: <MapPin className="h-8 w-8 text-rose-500" />,
    title: 'Venues',
    description: 'Discover and book beautiful venues that match your style and budget.'
  },
  {
    icon: <Users className="h-8 w-8 text-rose-500" />,
    title: 'Guest Management',
    description: 'Easily manage your guest list, RSVPs, and seating arrangements.'
  },
  {
    icon: <Palette className="h-8 w-8 text-rose-500" />,
    title: 'Decoration',
    description: 'Browse through decoration themes and connect with expert decorators.'
  }
];

const Features = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From planning to execution, we provide all the tools and services you need
            to create your perfect wedding day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;