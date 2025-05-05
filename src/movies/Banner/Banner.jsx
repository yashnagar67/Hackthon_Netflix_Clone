import React, { useEffect, useState } from 'react';
import { Play, Info } from 'lucide-react';

const Banner = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Dummy movie data
  const movie = {
    title: "Stranger Things",
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    backdrop_path: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    mobile_backdrop_path: "https://image.tmdb.org/t/p/w780/56v2KjBlU4XaOv9rVYEQypROD7P.jpg"
  };

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setIsLoaded(true);
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background Image with Loading State */}
      <div className="absolute inset-0">
        {!imageLoaded && (
          <div className="w-full h-full bg-gray-900 animate-pulse"></div>
        )}
        <img
          src={isMobile ? movie.mobile_backdrop_path : movie.backdrop_path}
          alt={movie.title}
          className={`w-full h-full object-cover ${isMobile ? 'object-top' : 'object-center'} transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.error("Image error, using fallback:", e);
            e.target.src = movie.backdrop_path;
            setImageLoaded(true);
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
      </div>

      {/* Content */}
      <div className={`relative h-full flex items-end transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="container mx-auto px-4 md:px-8 pb-16 md:pb-24">
          <div className="max-w-2xl">
            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {movie.title}
            </h1>
            
            {/* Description */}
            <p className="text-sm md:text-lg text-white/90 mb-6 line-clamp-2">
              {movie.description}
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors duration-200">
                <Play className="w-5 h-5" />
                <span className="font-medium">Play</span>
              </button>
              
              <button className="flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-700/70 text-white px-6 py-2 rounded transition-colors duration-200">
                <Info className="w-5 h-5" />
                <span className="font-medium">More Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner; 