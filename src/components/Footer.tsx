import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-rose-500" />
              <span className="ml-2 text-xl font-semibold">EverAfter</span>
            </div>
            <p className="mt-4 text-gray-600">
              Making wedding planning simple, beautiful, and stress-free.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Services</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-rose-500">Venues</a></li>
              <li><a href="#" className="text-gray-600 hover:text-rose-500">Vendors</a></li>
              <li><a href="#" className="text-gray-600 hover:text-rose-500">Photography</a></li>
              <li><a href="#" className="text-gray-600 hover:text-rose-500">Catering</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-rose-500">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-rose-500">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-rose-500">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-rose-500">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-rose-500">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-rose-500">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-rose-500">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} EverAfter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;