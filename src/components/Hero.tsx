import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative pt-16">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
          alt="Wedding backdrop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Perfect Day, <br />
            Perfectly Planned
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Plan your dream wedding with our all-in-one platform. From venues to vendors,
            we've got everything you need to make your special day unforgettable.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/booking">
            <button className="bg-rose-500 text-white px-8 py-3 rounded-md hover:bg-rose-600 text-lg">
              Start Planning
            </button></Link>

            <Link to="/venues"><button className="bg-white text-gray-900 px-8 py-3 rounded-md hover:bg-gray-100 text-lg">
              Browse Venues
            </button></Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;