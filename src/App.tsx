import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Services from './pages/Services';
import Wedding from './pages/Wedding';
import Invitation from './pages/Invitation';
import Venues from './pages/Venues';
import BookingLanding from './pages/BookingLanding';
import Footer from './components/Footer';
import VenueBookingAdmin from './pages/admin/VenueBookingAdmin';
import DatabaseSetup from './pages/admin/FirebaseSetup';
// Import placeholder pages for now
import PlaceholderPage from './components/PlaceholderPage';
// Auth components
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './lib/context/AuthContext';
import MyBookings from './pages/MyBookings';
// Server error detection
import ServerErrorBanner from './components/ServerErrorBanner';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-white">
          <Toaster position="top-right" />
          <ServerErrorBanner 
            supabaseUrl="http://localhost:5002" 
            apiUrl="http://localhost:5002" 
          />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/wedding" element={<Wedding />} />
            <Route path="/invitation" element={<Invitation />} />
            <Route path="/venues" element={<Venues />} />
            
            {/* Protected Booking Routes */}
            <Route path="/booking" element={
              <ProtectedRoute message="Please login to access booking features">
                <BookingLanding />
              </ProtectedRoute>
            } />
            <Route path="/book-venue/:id" element={
              <ProtectedRoute message="Please login to book this venue">
                <BookingLanding />
              </ProtectedRoute>
            } />
            
            {/* My Bookings Route */}
            <Route path="/my-bookings" element={
              <ProtectedRoute message="Please login to view your bookings">
                <MyBookings />
              </ProtectedRoute>
            } />
            
            {/* <Route path="/vendors" element={<PlaceholderPage title="Vendors" message="Find the perfect vendors for your special day. Coming soon!" />} /> */}
            <Route path="/inspiration" element={<PlaceholderPage title="Inspiration" message="Get inspired with wedding ideas and trends. Coming soon!" />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin/venues" element={
              <ProtectedRoute>
                <VenueBookingAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/database-setup" element={
              <ProtectedRoute>
                <DatabaseSetup />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App