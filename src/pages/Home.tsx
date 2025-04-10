import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';

const Home = () => {
  return (
    <div>
      <div className="pt-16 bg-rose-50 py-24 px-6 text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-800">Plan Your Dream Wedding</h1>
        <p className="text-lg mb-8 text-gray-600 max-w-2xl mx-auto">
          Discover perfect venues, create digital invitations, and find everything you need for your special day.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            to="/venues" 
            className="px-6 py-3 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 transition-colors"
          >
            Explore Venues
          </Link>
          <Link 
            to="/invitation" 
            className="px-6 py-3 bg-white text-rose-500 font-medium rounded-md border border-rose-500 hover:bg-rose-50 transition-colors"
          >
            Create Invitation
          </Link>
        </div>
      </div>
      <Hero />
      <Features />
    </div>
  );
};

export default Home;