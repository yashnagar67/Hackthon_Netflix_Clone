import React, { useRef, useState } from 'react';
import { Play, Info } from 'lucide-react';

const MovieSlider = ({ title, movies }) => {
  const sliderRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="rowContainer mb-8">
      <h2 className="text-xl md:text-2xl font-bold mb-4 px-4 md:px-8">{title}</h2>
      <div className="relative group">
        <div 
          className="sliderMask overflow-hidden px-4 md:px-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            ref={sliderRef}
            className="sliderContent flex gap-2 transition-transform duration-300"
          >
            {movies.map((movie, index) => (
              <div 
                key={movie.id}
                className="slider-item w-[calc(50%-0.2vw)] sm:w-[calc(33.333%-0.2vw)] md:w-[calc(25%-0.2vw)] lg:w-[calc(20%-0.2vw)] xl:w-[calc(16.666%-0.2vw)] flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:z-10"
              >
                <div className="relative aspect-video group">
                  <img 
                    src={movie.desktopImage} 
                    alt={movie.title}
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center gap-2">
                      <button className="bg-white text-black p-2 rounded-full hover:bg-white/90">
                        <Play size={20} />
                      </button>
                      <button className="bg-gray-500/50 text-white p-2 rounded-full hover:bg-gray-500/70">
                        <Info size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation buttons */}
        {isHovered && (
          <>
            <button 
              onClick={() => handleScroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              &lt;
            </button>
            <button 
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              &gt;
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieSlider; 