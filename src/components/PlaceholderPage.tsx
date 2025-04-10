import React from 'react';

interface PlaceholderPageProps {
  title: string;
  message: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, message }) => {
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{title}</h1>
        <p className="text-xl text-gray-600 mb-8">{message}</p>
        <div className="w-24 h-1 bg-rose-500 mx-auto mb-8"></div>
        <img 
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          alt="Construction"
          className="rounded-lg shadow-lg max-w-lg mx-auto"
        />
      </div>
    </div>
  );
};

export default PlaceholderPage; 