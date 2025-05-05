import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Play, Plus, ThumbsUp, ChevronDown, VolumeX, Volume2, X, Info } from 'lucide-react';

// Import movie data from separate file
import { dummyMovies } from '../MovieData';

// Enhanced Movie Card Component with Netflix-style hover preview
const MovieCard = ({ movie, hoveredId, setHoveredId }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });
  const [showTrailer, setShowTrailer] = useState(false);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [trailerError, setTrailerError] = useState(false);
  const [showDelayedFetch, setShowDelayedFetch] = useState(false);
  const [shouldShowPreview, setShouldShowPreview] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const timerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const popupRef = useRef(null);
  const fetchTimerRef = useRef(null);

  // Initial loading simulation
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000 + Math.random() * 500); // Random delay for more natural loading effect
    return () => clearTimeout(timer);
  }, []);

  // Calculate position of popup card
  const calculatePosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Adjust left position to ensure popup doesn't go off-screen
      let leftPos = rect.left + window.scrollX - 40;
      const popupWidth = 350; // Width of the popup
      
      if (leftPos + popupWidth > viewportWidth) {
        leftPos = viewportWidth - popupWidth - 20; // Keep 20px margin from right edge
      }
      
      // Also ensure not too far left
      if (leftPos < 20) {
        leftPos = 20;
      }
      
      setPreviewPos({
        top: rect.top + window.scrollY - 60,
        left: leftPos
      });
    }
  };

  // Card skeleton component
  const CardSkeleton = () => (
    <div className="relative w-32 h-48 sm:w-40 sm:h-60 md:w-50 md:h-70 lg:w-55 lg:h-80 rounded overflow-hidden netflix-skeleton">
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent"></div>
    </div>
  );

  // Unified mouse enter/leave handlers for both card and popup
  const handleMouseEnter = () => {
    if (isLoading) return;
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    
    calculatePosition();
    
    // Set a delay before showing the preview
    hoverTimerRef.current = setTimeout(() => {
      setShouldShowPreview(true);
      setHoveredId(movie.id);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      setShouldShowPreview(false);
      setHoveredId(null);
      if (videoRef.current) videoRef.current.pause();
    }, 120); // 120ms delay prevents flicker
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };
  
  // Function to fetch movie trailer from TMDB
  const fetchTrailer = async (movieId) => {
    setTrailerError(false);
    try {
      // In a real implementation with TMDB API, you would use:
      // const apiKey = "your_tmdb_api_key";
      // const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`);
      // const data = await response.json();
      // const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
      
      // For demo purposes, we'll simulate an API call with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample trailer URLs based on movie ID
      const trailers = {
        1: "https://www.youtube.com/embed/nsC5PhXS19Y?autoplay=1", // Chhaava - Updated with correct ID
        2: "https://www.youtube.com/embed/q0nzehAEgbw?autoplay=1", // Lucky Baskhar
        3: "https://www.youtube.com/embed/I6lB-sF0l7s?autoplay=1", // Jewel Thief
        4: "https://www.youtube.com/embed/EXeTwQWrcwY?autoplay=1", // MAID
        5: "https://www.youtube.com/embed/H6yoXriLAwc?autoplay=1", // Pushpa
        6: "https://www.youtube.com/embed/2PK0uxiDHyQ?autoplay=1", // Court
      };
      
      const trailerUrl = trailers[movieId];
      if (trailerUrl) {
        setTrailerUrl(trailerUrl);
      } else {
        // If no trailer is found, throw an error
        throw new Error("No trailer found for this movie");
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
      setTrailerError(true);
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  const handlePlayTrailer = (e) => {
    e.stopPropagation();
    setShowTrailer(true);
    setIsLoadingTrailer(true);
    setShowDelayedFetch(false);
    
    // Clear any existing timer
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }
    
    // First show the loading indicator for 3 seconds
    fetchTimerRef.current = setTimeout(() => {
      setShowDelayedFetch(true);
      // After another 2 seconds, actually fetch the trailer
      setTimeout(() => {
        fetchTrailer(movie.id);
      }, 2000);
    }, 3000);
  };

  const closeTrailer = (e) => {
    if (e) e.stopPropagation();
    setShowTrailer(false);
    setTrailerUrl('');
    setShowDelayedFetch(false);
    
    // Clear any pending timers
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }
  };

  // Handle video loading events
  const handleVideoLoaded = () => {
    setVideoReady(true);
    // Ensure video plays smoothly after loading
    if (videoRef.current) {
      // Set playback rate slightly slower for smoother experience if needed
      videoRef.current.playbackRate = 1.0;
      
      // Reduce resolution if needed
      if (videoRef.current.videoHeight > 720) {
        console.log("High resolution video detected, optimizing for performance");
      }
      
      // Start playback
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
  };

  const handleVideoError = () => {
    console.error("Video playback error");
    setVideoReady(false);
  };

  // Ensure video plays when popup becomes visible
  useEffect(() => {
    if (shouldShowPreview && hoveredId === movie.id && videoRef.current) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        videoRef.current.play().catch(err => {
          console.error("Error auto-playing video:", err);
        });
      }, 100);
    }
  }, [shouldShowPreview, hoveredId, movie.id]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, []);

  // Handle click outside to close trailer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) && showTrailer) {
        closeTrailer();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTrailer]);
  
  // Format the movie genres for display
  const genreDisplay = movie.genre ? movie.genre.slice(0, 3).join(' • ') : '';
  
  // Fallback poster URL for when images fail to load
  const fallbackPosterUrl = "https://via.placeholder.com/342x513?text=No+Image";

  return (
    <>
      <div
        ref={cardRef}
        className="relative flex-shrink-0 cursor-pointer netflix-card-hover group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base Movie Card */}
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <div className="relative w-55 h-30 sm:w-40 sm:h-60 md:w-50 md:h-10 lg:w-55 lg:h-30 rounded overflow-hidden transition-shadow duration-300">
            {/* Image with Loading State */}
            <div className="w-full h-full">
              {!posterLoaded && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm10 6c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z" fill="currentColor" opacity="0.3"/>
                    <path d="M12 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="currentColor"/>
                  </svg>
                </div>
              )}
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className={`w-full h-full object-cover ${posterLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setPosterLoaded(true)}
                onError={(e) => {
                  // If the image fails to load, replace with fallback
                  console.error(`Failed to load image for ${movie.title}:`, e);
                  e.target.src = fallbackPosterUrl;
                  setPosterLoaded(true);
                }}
              />
            </div>
            {/* Dark overlay for better text readability on hover */}
            <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-25"></div>
            {/* Top 10 Badge */}
            {movie.isTopTen && (
              <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl font-bold">
                TOP 10
              </div>
            )}
            {/* Recently Added Banner */}
            {movie.recentlyAdded && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-xs py-0 text-center font-medium">
                New
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hover Preview Popup */}
      {shouldShowPreview && hoveredId === movie.id && createPortal(
        <div
          className="absolute bg-neutral-900 text-white rounded-md shadow-2xl netflix-popup"
          style={{
            top: previewPos.top,
            left: previewPos.left,
            position: 'absolute',
            width: '350px',
            zIndex: 9999,
            transformOrigin: 'center top',
            transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out',
            opacity: 1,
            transform: 'scale(1)'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Preview Image/Video */}
          <div className="relative w-full aspect-[16/9] bg-gray-800 rounded-t-md overflow-hidden">
            {movie.previewUrl ? (
              <>
                {!videoReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="w-8 h-8 border-2 border-gray-600 border-t-red-600 rounded-full animate-spin"></div>
                  </div>
                )}
              <video
                ref={videoRef}
                  src={movie.previewUrl}
                poster={movie.posterUrl || fallbackPosterUrl}
                muted={isMuted}
                  autoPlay
                  playsInline
                  loop
                  preload="auto"
                  className={`w-full h-full object-cover ${videoReady ? 'opacity-100' : 'opacity-0'}`}
                  style={{ 
                    transition: 'opacity 0.3s ease',
                    objectFit: 'cover',
                    backgroundColor: '#000'
                  }}
                  onLoadedData={handleVideoLoaded}
                  onError={handleVideoError}
                  onStalled={() => console.log("Video playback stalled")}
                  onWaiting={() => console.log("Video waiting for data")}
                >
                  {/* Add alternate formats for wider compatibility */}
                  <source src={movie.previewUrl} type="video/mp4" />
                </video>
              </>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay for better readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
                {/* Netflix N Logo */}
                <div className="absolute top-3 left-3">
                  <svg className="w-5 h-5 text-red-600 fill-current" viewBox="0 0 111 30">
                    <path d="M105.06233,14.2806261 L110.999156,30 C109.249227,29.7497422 107.500234,29.4366857 105.718437,29.1554972 L102.374168,20.4686475 L98.9371075,28.4375293 C97.2499766,28.1563408 95.5928391,28.061674 93.9057081,27.8432843 L99.9372012,14.0931671 L94.4680851,-5.68434189e-14 L99.5313525,-5.68434189e-14 L102.593495,7.87421502 L105.874965,-5.68434189e-14 L110.999156,-5.68434189e-14 L105.06233,14.2806261 Z M90.4686475,-5.68434189e-14 L85.8749649,-5.68434189e-14 L85.8749649,27.2499766 C87.3746368,27.3437061 88.9371075,27.4055675 90.4686475,27.5930265 L90.4686475,-5.68434189e-14 Z M81.9055207,26.93692 C77.7186241,26.6557316 73.5307901,26.4064111 69.250164,26.3117443 L69.250164,-5.68434189e-14 L73.9366389,-5.68434189e-14 L73.9366389,21.8745899 C76.6248008,21.9373887 79.3120255,22.1557784 81.9055207,22.2804387 L81.9055207,26.93692 Z M64.2496954,10.6561065 L64.2496954,15.3435186 L57.8442216,15.3435186 L57.8442216,25.9996251 L53.2186709,25.9996251 L53.2186709,-5.68434189e-14 L66.3436123,-5.68434189e-14 L66.3436123,4.68741213 L57.8442216,4.68741213 L57.8442216,10.6561065 L64.2496954,10.6561065 Z M45.3435186,4.68741213 L45.3435186,26.2498828 C43.7810479,26.2498828 42.1876465,26.2498828 40.6561065,26.3117443 L40.6561065,4.68741213 L35.8121661,4.68741213 L35.8121661,-5.68434189e-14 L50.2183897,-5.68434189e-14 L50.2183897,4.68741213 L45.3435186,4.68741213 Z M30.749836,15.5928391 C28.687787,15.5928391 26.2498828,15.5928391 24.4999531,15.6875059 L24.4999531,22.6562939 C27.2499766,22.4678976 30,22.2495079 32.7809542,22.1557784 L32.7809542,26.6557316 L19.812541,27.6876933 L19.812541,-5.68434189e-14 L32.7809542,-5.68434189e-14 L32.7809542,4.68741213 L24.4999531,4.68741213 L24.4999531,10.9991564 C26.3126816,10.9991564 29.0936358,10.9054269 30.749836,10.9054269 L30.749836,15.5928391 Z M4.78114163,12.9684132 L4.78114163,29.3429562 C3.09401069,29.5313525 1.59340144,29.7497422 0,30 L0,-5.68434189e-14 L4.4690224,-5.68434189e-14 L10.562377,17.0315868 L10.562377,-5.68434189e-14 L15.2497891,-5.68434189e-14 L15.2497891,28.061674 C13.5935889,28.3437998 11.906458,28.4375293 10.1246602,28.6868498 L4.78114163,12.9684132 Z"></path>
                  </svg>
                </div>
              </div>
            )}
            {/* Sound icon overlay */}
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors z-10"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
            
            {/* Close button overlay - NEW */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShouldShowPreview(false);
                setHoveredId(null);
                if (videoRef.current) videoRef.current.pause();
              }}
              className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors z-10"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePlayTrailer}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
              >
              <Play className="w-5 h-5 text-black" />
            </button>
              <button className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors">
              <Plus className="w-5 h-5 text-white" />
            </button>
              <button className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors">
              <ThumbsUp className="w-5 h-5 text-white" />
            </button>
            </div>
            <button className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors">
              <ChevronDown className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Info Section */}
          <div className="px-4 pb-4">
            {/* Title and Year */}
            <h3 className="text-lg font-bold mb-1">{movie.title} <span className="font-normal text-gray-400">({movie.year})</span></h3>
            
            {/* Rating & Quality */}
            <div className="flex items-center gap-2 mb-2 text-sm">
              <span className="text-green-500 font-medium">97% Match</span>
              <span className="border border-gray-500 text-xs px-1">{movie.year >= 2020 ? 'U/A 16+' : 'A'}</span>
              <span>{movie.year}</span>
              <span className="border border-gray-500 text-xs px-1">HD</span>
            </div>

            {/* Description */}
            {movie.description && (
              <p className="text-sm text-gray-300 mb-2 line-clamp-3">
                {movie.description}
              </p>
            )}
            
            {/* Genres */}
            {genreDisplay && (
              <div className="text-xs text-gray-400">
                {genreDisplay}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Trailer Modal */}
      {showTrailer && createPortal(
        <div 
          className="fixed inset-0 bg-black flex items-center justify-center z-[1100]"
          style={{
            animation: 'fadeIn 0.8s ease-in-out forwards',
            backdropFilter: 'blur(3px)',
            backgroundColor: 'rgba(0, 0, 0, 0.85)'
          }}
          onClick={closeTrailer}
        >
          <div 
            ref={popupRef}
            className="relative w-11/12 max-w-4xl aspect-video bg-black rounded-md shadow-2xl"
            style={{
              animation: 'scaleIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards',
              opacity: 0,
              transform: 'scale(0.95)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {isLoadingTrailer ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-16 relative">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-red-600 rounded-full animate-spin"></div>
                  <div 
                    className="absolute inset-0 flex items-center justify-center text-white text-sm"
                    style={{ animation: 'fadeIn 0.5s ease-in-out 0.5s forwards', opacity: 0 }}
                  >
                    Loading
                  </div>
                </div>
                <p 
                  className="text-gray-400 mt-4 text-sm" 
                  style={{ animation: 'fadeIn 0.5s ease-in-out 0.8s forwards', opacity: 0 }}
                >
                  {showDelayedFetch ? 'Fetching movie trailer...' : 'Preparing trailer...'}
                </p>
                <div className="mt-4 w-64 h-1 bg-gray-800 overflow-hidden rounded-full">
                  <div 
                    className="h-full bg-red-600" 
                    style={{
                      width: '0%',
                      animation: showDelayedFetch ? 'progress 2s linear forwards' : 'progress 3s linear forwards',
                    }}
                  ></div>
                </div>
              </div>
            ) : trailerError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <svg className="w-12 h-12 text-red-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
                </svg>
                <p className="text-lg font-medium">Sorry, trailer not available</p>
                <button 
                  onClick={closeTrailer} 
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <iframe
                src={trailerUrl}
                className="w-full h-full rounded-md"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ opacity: 0, animation: 'fadeIn 0.5s ease-in-out forwards' }}
              ></iframe>
            )}
            <button 
              onClick={closeTrailer}
              className="absolute -top-12 right-0 text-white p-2 hover:bg-black hover:bg-opacity-50 rounded-full transition-colors"
              style={{ animation: 'fadeIn 0.5s ease-in-out 0.5s forwards', opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// Movie Row Component
const MovieRow = ({ title, movies }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const rowRef = useRef(null);
  
  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulating network delay
    return () => clearTimeout(timer);
  }, []);
  
  const scroll = (direction) => {
    if (rowRef.current) {
      const { current } = rowRef;
      const scrollAmount = direction === 'left' 
        ? current.scrollLeft - (current.offsetWidth - 100) 
        : current.scrollLeft + (current.offsetWidth - 100);
        
      current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Skeleton for movie row
  const MovieRowSkeleton = () => (
    <>
      {/* Title Skeleton */}
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="h-8 w-48 netflix-skeleton rounded"></div>
        <div className="h-5 w-24 netflix-skeleton rounded"></div>
      </div>
      
      {/* Cards Skeleton */}
      <div className="flex overflow-x-hidden py-6 px-4 gap-2 md:gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex-shrink-0" style={{ width: '180px' }}>
            <div 
              className={`w-full aspect-[2/3] rounded-md netflix-skeleton staggered-delay-${index % 5 + 1}`}
            ></div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div 
      className="mb-8 relative py-4" 
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading ? (
        <MovieRowSkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            <button className="text-gray-400 hover:text-white text-sm">Explore All</button>
          </div>
          
          <div className="relative">
            {/* Left Control */}
            {showControls && (
              <button 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                onClick={() => scroll('left')}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            
            {/* Movie Cards Container */}
            <div 
              ref={rowRef}
              className="flex overflow-x-scroll no-scrollbar scroll-smooth py-6 px-4 gap-2 md:gap-4"
            >
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} hoveredId={hoveredId} setHoveredId={setHoveredId} />
              ))}
            </div>
            
            {/* Right Control */}
            {showControls && (
              <button 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                onClick={() => scroll('right')}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Netflix Page Component with multiple rows
const NetflixBrowse = () => {
  return (
    <div className="bg-black min-h-screen text-white  pb-4">
      <MovieRow title="Made in India" movies={dummyMovies.madeInIndia} />
      <MovieRow title="Critically Acclaimed TV Shows" movies={dummyMovies.criticallyAcclaimed} />
      <MovieRow title="International TV Shows Dubbed in English" movies={dummyMovies.international} />
    </div>
  );
};

// Custom CSS for no scrollbar and animations
const customStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-x: none;
    scrollbar-width: none;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.95);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes progress {
    from { width: 0; }
    to { width: 100%; }
  }
  
  @keyframes netflix-pulse {
    0% {
      opacity: 0.6;
      background-position: 0% 0%;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      opacity: 0.6;
      background-position: -135% 0%;
    }
  }
  
  .netflix-skeleton {
    background: linear-gradient(
      90deg, 
      #1a1a1a 0%, 
      #2a2a2a 50%, 
      #1a1a1a 100%
    );
    background-size: 400% 100%;
    animation: netflix-pulse 1.8s ease-in-out infinite;
  }
  
  .staggered-delay-1 { animation-delay: 0.1s; }
  .staggered-delay-2 { animation-delay: 0.2s; }
  .staggered-delay-3 { animation-delay: 0.3s; }
  .staggered-delay-4 { animation-delay: 0.4s; }
  .staggered-delay-5 { animation-delay: 0.5s; }
`;

export default () => (
  <>
    <style>{customStyles}</style>
    <NetflixBrowse />
  </>
);