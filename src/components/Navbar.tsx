import { useState } from 'react';
import { Heart, Menu, X, User as UserIcon, Calendar, BookOpen } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../lib/hooks/useAuth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Define available routes to check against
  const availableRoutes = ['/', '/services', '/wedding', '/invitation', '/venues', '/vendors', '/inspiration', '/booking', '/login', '/register', '/my-bookings'];

  const handleSignOut = async () => {
    try {
      logout();
      toast.success('Successfully signed out!');
      navigate('/');
    } catch {
      toast.error('An error occurred while signing out');
    }
  };

  // Check if current route exists
  const isValidRoute = availableRoutes.includes(location.pathname);
  if (!isValidRoute && location.pathname !== '/admin/venues') {
    console.warn(`Warning: Navigating to unknown route: ${location.pathname}`);
  }

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Heart className="h-8 w-8 text-rose-500" />
              <span className="ml-2 text-xl font-semibold">EverAfter</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/services" 
              className={`text-gray-700 hover:text-rose-500 ${location.pathname === '/services' ? 'text-rose-500' : ''}`}
            >
              Services
            </Link>
            <Link 
              to="/wedding" 
              className={`text-gray-700 hover:text-rose-500 ${location.pathname === '/wedding' ? 'text-rose-500' : ''}`}
            >
              Vendors
            </Link>

            <Link 
              to="/venues" 
              className={`text-gray-700 hover:text-rose-500 ${location.pathname === '/venues' ? 'text-rose-500' : ''}`}
            >
              Venues
            </Link>
            <Link 
              to="/booking" 
              className={`text-gray-700 hover:text-rose-500 ${location.pathname === '/booking' ? 'text-rose-500' : ''}`}
            >
              <Calendar className="inline-block h-4 w-4 mr-1" />
              Book Venue
            </Link>

            <Link 
              to="/invitation" 
              className={`text-gray-700 hover:text-rose-500 ${location.pathname === '/invitation' ? 'text-rose-500' : ''}`}
            >
              Invitations
            </Link>
            
            {/* <Link 
              to="/vendors" 
              className={`text-gray-700 hover:text-rose-500 ${location.pathname === '/vendors' ? 'text-rose-500' : ''}`}
            >
              Vendors
            </Link> */}
            <Link 
              to="/inspiration" 
              className={`text-gray-700 hover:text-rose-500 ${location.pathname === '/inspiration' ? 'text-rose-500' : ''}`}
            >
              Inspiration
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/my-bookings"
                  className={`flex items-center text-gray-700 hover:text-rose-500 ${location.pathname === '/my-bookings' ? 'text-rose-500' : ''}`}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  My Bookings
                </Link>
                <button
                  onClick={() => {}}
                  className="flex items-center text-gray-700 hover:text-rose-500"
                >
                  <UserIcon className="h-5 w-5 mr-1" />
                  {user?.name || 'Profile'}
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-rose-500"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/services"
              className="block px-3 py-2 text-gray-700 hover:text-rose-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/wedding"
              className="block px-3 py-2 text-gray-700 hover:text-rose-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Wedding
            </Link>
            <Link
              to="/invitation"
              className="block px-3 py-2 text-gray-700 hover:text-rose-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Invitations
            </Link>
            <Link
              to="/venues"
              className="block px-3 py-2 text-gray-700 hover:text-rose-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Venues
            </Link>
            <Link
              to="/booking"
              className="block px-3 py-2 text-gray-700 hover:text-rose-500 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Venue
            </Link>
            <Link
              to="/vendors"
              className="block px-3 py-2 text-gray-700 hover:text-rose-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Vendors
            </Link>
            <Link
              to="/inspiration"
              className="block px-3 py-2 text-gray-700 hover:text-rose-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Inspiration
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-bookings"
                  className="block px-3 py-2 text-gray-700 hover:text-rose-500 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Bookings
                </Link>
                <button
                  onClick={() => {}}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-rose-500"
                >
                  {user?.name || 'Profile'}
                </button>
                <button
                  onClick={handleSignOut}
                  className="block w-full mt-2 bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-rose-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full mt-2 bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;