import React, { useState, useRef, useEffect } from 'react';
import { Play, Info } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosterLoaded, setIsPosterLoaded] = useState(false);
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const timerRef = useRef(null);

  // Initial loading state
  useEffect(() => {
    setIsLoading(true);
    if (movie) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Simulating network delay
      return () => clearTimeout(timer);
    }
  }, [movie]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Handle hover start
  const startHover = () => {
    setIsHovered(true);
    // Start the delay timer
    timerRef.current = setTimeout(() => {
      setShowPreview(true);
      if (videoRef.current) {
        videoRef.current.play().catch(error => {
          console.error("Error playing video:", error);
        });
      }
    }, 3000);
  };

  // Handle hover end
  const endHover = () => {
    setIsHovered(false);
    setShowPreview(false);
    // Clear the timer if it exists
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Reset video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Card Skeleton Component
  const CardSkeleton = () => (
    <div className="relative overflow-hidden rounded-md">
      <div 
        className="w-full h-full aspect-[2/3] bg-gray-800 animate-pulse"
        style={{ minHeight: '180px' }}
      ></div>
    </div>
  );

  return (
    <div
      ref={cardRef}
      className="relative cursor-pointer"
      onMouseEnter={startHover}
      onMouseLeave={endHover}
    >
      {/* Main Card Container - Fixed dimensions to prevent layout shifts */}
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div 
          className="relative overflow-hidden rounded-md"
          style={{ 
            width: '100%',
            height: '100%',
            willChange: 'transform',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transformOrigin: 'center center',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: isHovered ? 10 : 1
          }}
        >
          {/* Video Preview Container - Always present but hidden */}
          <div 
            className="absolute inset-0"
            style={{ 
              opacity: showPreview ? 1 : 0,
              transform: showPreview ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              pointerEvents: 'none'
            }}
          >
            <video
              ref={videoRef}
              src={movie.videoPreview}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              onLoadedData={() => setIsVideoLoaded(true)}
              style={{ 
                opacity: isVideoLoaded ? 1 : 0,
                transition: 'opacity 0.2s ease-out',
                willChange: 'opacity'
              }}
            />
            
            {/* Video Loading Indicator */}
            {showPreview && !isVideoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Poster Image with Loading Skeleton */}
          <div className="relative w-full h-full">
            {!isPosterLoaded && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm10 6c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z" fill="currentColor" opacity="0.3"/>
                  <path d="M12 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="currentColor"/>
                </svg>
              </div>
            )}
            <img
              src={movie.desktopImage}
              alt={movie.title}
              className={`w-full h-full object-cover ${isPosterLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsPosterLoaded(true)}
              onError={() => setIsPosterLoaded(true)}
              style={{ 
                opacity: showPreview ? 0 : 1,
                transition: 'opacity 0.2s ease-out',
                willChange: 'opacity',
                backfaceVisibility: 'hidden'
              }}
            />
          </div>

          {/* Gradient Overlay - Always present */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            style={{ 
              opacity: showPreview ? 1 : 0,
              transition: 'opacity 0.2s ease-out',
              willChange: 'opacity',
              backfaceVisibility: 'hidden'
            }}
          />

          {/* Content - Always present */}
          <div 
            className="absolute bottom-0 left-0 right-0 p-4"
            style={{ 
              transform: showPreview ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="flex flex-col gap-2">
              {/* Title */}
              <h3 className="text-white text-lg font-bold">{movie.title}</h3>
              
              {/* Match Percentage */}
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-semibold">{movie.matchPercentage}% Match</span>
                <span className="text-white/70">{movie.maturityRating}</span>
                <span className="text-white/70">{movie.year}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-2">
                <button className="flex items-center justify-center gap-1 bg-white hover:bg-white/90 text-black px-3 py-1 rounded font-medium text-sm transition-colors duration-200">
                  <Play className="w-4 h-4" />
                  <span>Play</span>
                </button>
                <button className="flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded font-medium text-sm transition-colors duration-200">
                  <Info className="w-4 h-4" />
                  <span>More Info</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard; 