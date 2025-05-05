import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Info, Plus, ThumbsUp, ChevronDown, VolumeX, Volume2, X } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });
  const [shouldShowPreview, setShouldShowPreview] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState('');
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const timerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const popupRef = useRef(null);
  
  // Calculate position of popup card
  const calculatePosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Adjust left position to ensure popup doesn't go off-screen
      let leftPos = rect.left + window.scrollX - 40;
      const popupWidth = viewportWidth < 640 ? 280 : 350; // Smaller width on mobile
      
      if (leftPos + popupWidth > viewportWidth) {
        leftPos = viewportWidth - popupWidth - 20; // Keep 20px margin from right edge
      }
      
      // Also ensure not too far left
      if (leftPos < 20) {
        leftPos = 20;
      }
      
      setPreviewPos({
        top: rect.top + window.scrollY - (viewportWidth < 640 ? 40 : 60), // Reduce distance on mobile
        left: leftPos
      });
    }
  };

  // Unified mouse enter/leave handlers for both card and popup
  const handleMouseEnter = () => {
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
      if (movie.previewUrl && movie.previewUrl.includes('drive.google.com')) {
        // For Google Drive embeds, we can't directly control the mute
        // We could potentially use postMessage API but for simplicity
        // we'll just show the mute state visually
        console.log("Mute toggled for Google Drive embed");
      } else {
        videoRef.current.muted = !isMuted;
      }
    }
  };
  
  // Handle video loading events
  const handleVideoLoaded = () => {
    setVideoReady(true);
    // Ensure video plays smoothly after loading
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
  };

  const handleVideoError = () => {
    console.error("Video playback error");
    setVideoReady(false);
  };
  
  // Fetch movie trailer
  const fetchTrailer = async (movieId) => {
    // For demo purposes, we'll simulate a trailer URL
    const trailers = {
      1: "https://www.youtube.com/embed/nsC5PhXS19Y?autoplay=1", // Sample trailer URL
      2: "https://www.youtube.com/embed/q0nzehAEgbw?autoplay=1",
      3: "https://www.youtube.com/embed/I6lB-sF0l7s?autoplay=1",
      4: "https://www.youtube.com/embed/EXeTwQWrcwY?autoplay=1",
      5: "https://www.youtube.com/embed/H6yoXriLAwc?autoplay=1",
      6: "https://www.youtube.com/embed/2PK0uxiDHyQ?autoplay=1",
    };
    
    const url = trailers[movieId] || "https://www.youtube.com/embed/KK8FHdFluOQ?autoplay=1";
    setTrailerUrl(url);
  };
  
  const handlePlayTrailer = (e) => {
    e.stopPropagation();
    setShowTrailer(true);
    fetchTrailer(movie.id);
  };
  
  const closeTrailer = (e) => {
    if (e) e.stopPropagation();
    setShowTrailer(false);
    setTrailerUrl('');
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
  
  return (
    <>
      <div
        ref={cardRef}
        className="relative flex-shrink-0 cursor-pointer netflix-card-hover group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base Movie Card */}
        <div className="relative w-55 h-30 sm:w-32 sm:h-48 md:w-40 md:h-60 lg:w-55 lg:h-30 rounded overflow-hidden transition-shadow duration-300 shadow-lg">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-fill"
          />
          {/* Dark overlay for better text readability on hover */}
          <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-25"></div>
          
          {/* Recommendation tag always visible */}
          <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 z-10 shadow-lg" 
            style={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
            AI Recommended
          </div>
          
          {/* Top 10 Badge */}
          {movie.isTopTen && (
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-bl font-bold">
              TOP 10
            </div>
          )}
          
          {/* Recently Added Banner */}
          {movie.recentlyAdded && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-[10px] sm:text-xs py-0 text-center font-medium">
              Recently added
            </div>
          )}
        </div>

        {/* Mobile title display for better accessibility */}
        <div className="block md:hidden mt-1 max-w-[7rem] sm:max-w-[8rem]">
          <p className="text-[11px] sm:text-xs text-white/80 truncate">{movie.title}</p>
        </div>
      </div>

      {/* Hover Preview Popup */}
      {shouldShowPreview && hoveredId === movie.id && createPortal(
        <div
          className="absolute bg-neutral-900 text-white rounded-md shadow-2xl netflix-popup"
          style={{
            top: previewPos.top,
            left: previewPos.left,
            position: 'absolute',
            width: window.innerWidth < 640 ? '280px' : '350px',
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
                {movie.previewUrl.includes('drive.google.com') ? (
                  <iframe
                    ref={videoRef}
                    src={movie.previewUrl}
                    className={`w-full h-full object-cover ${videoReady ? 'opacity-100' : 'opacity-0'}`}
                    style={{ 
                      transition: 'opacity 0.3s ease',
                      backgroundColor: '#000'
                    }}
                    allow="autoplay"
                    onLoad={handleVideoLoaded}
                    onError={handleVideoError}
                    frameBorder="0"
                  ></iframe>
                ) : (
                  <video
                    ref={videoRef}
                    src={movie.previewUrl}
                    poster={movie.posterUrl}
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
                  >
                    <source src={movie.previewUrl} type="video/mp4" />
                  </video>
                )}
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
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button 
                onClick={handlePlayTrailer}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </button>
              <button className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
              <button className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors">
                <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
            <button className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors">
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>

          {/* Info Section */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            {/* Title and Year */}
            <h3 className="text-base sm:text-lg font-bold mb-1">{movie.title} <span className="font-normal text-gray-400">({movie.year})</span></h3>
            
            {/* Rating & Quality */}
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 text-xs sm:text-sm">
              <span className="text-green-500 font-medium">97% Match</span>
              <span className="border border-gray-500 text-xs px-1">{movie.year >= 2020 ? 'U/A 16+' : 'A'}</span>
              <span>{movie.year}</span>
              <span className="border border-gray-500 text-xs px-1">HD</span>
            </div>

            {/* Description */}
            {movie.description && (
              <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2 line-clamp-3">
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
            {!trailerUrl ? (
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
                  Fetching movie trailer...
                </p>
                <div className="mt-4 w-64 h-1 bg-gray-800 overflow-hidden rounded-full">
                  <div 
                    className="h-full bg-red-600" 
                    style={{
                      width: '0%',
                      animation: 'progress 2s linear forwards',
                    }}
                  ></div>
                </div>
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

const RecommendationSection = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  
  // Set up event listener on mount
  useEffect(() => {
    console.log('Setting up event listener for recommendations');
    
    // Define the handler function
    function handleRecommendEvent(event) {
      console.log('Recommendation event received!', event.detail);
      if (event.detail && event.detail.movies) {
        setRecommendations(event.detail.movies);
        setSelectedGenres(event.detail.genres || []);
        setIsVisible(true);
        
        // Scroll to recommendation section after a short delay
        setTimeout(() => {
          const anchor = document.getElementById('recommendation-anchor');
          if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth' });
            console.log('Scrolling to recommendation anchor');
          } else {
            console.warn('Recommendation anchor not found');
          }
        }, 100);
      }
    }
    
    // Add the event listener
    window.addEventListener('movieRecommendations', handleRecommendEvent);
    document.addEventListener('movieRecommendations', handleRecommendEvent);
    
    // Simulate receiving recommendations to test (remove in production)
    console.log('Testing event receiver setup');
    
    return () => {
      console.log('Cleaning up event listeners');
      window.removeEventListener('movieRecommendations', handleRecommendEvent);
      document.removeEventListener('movieRecommendations', handleRecommendEvent);
    };
  }, []);
  
  // Separate effect for localStorage
  useEffect(() => {
    // Save to local storage when recommendations change
    if (recommendations) {
      console.log('Saving recommendations to localStorage');
      localStorage.setItem('lastRecommendations', JSON.stringify(recommendations));
      localStorage.setItem('lastSelectedGenres', JSON.stringify(selectedGenres));
    }
  }, [recommendations, selectedGenres]);
  
  // Load from local storage on component mount
  useEffect(() => {
    const savedRecommendations = localStorage.getItem('lastRecommendations');
    const savedGenres = localStorage.getItem('lastSelectedGenres');
    
    if (savedRecommendations && savedGenres) {
      setRecommendations(JSON.parse(savedRecommendations));
      setSelectedGenres(JSON.parse(savedGenres));
      setIsVisible(true);
    }
  }, []);
  
  if (!isVisible || !recommendations || recommendations.length === 0) {
    return null;
  }
  
  return (
    <div 
      id="recommendSection" 
      className="w-full px-2 sm:px-4 md:px-12 animate-fadeIn pt-4 sm:pt-0 md:pt-0 md:bg-transparent bg-[#0a0a0a] rounded-t-lg"
      style={{
        animation: 'fadeIn 0.5s ease-in-out'
      }}
    >
      {/* Section title and separator for mobile and tablet */}
     
      
      <div className="flex overflow-x-auto space-x-2 sm:space-x-4 pb-2 sm:pb-4 scrollbar-hide -mx-1 px-1">
        {recommendations.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationSection;

// CSS Animation - Only add once to avoid duplication
if (!document.getElementById('recommendation-styles')) {
  const style = document.createElement('style');
  style.id = 'recommendation-styles';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes progress {
      from { width: 0%; }
      to { width: 100%; }
    }
    
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    .netflix-card-hover:hover {
      z-index: 50;
    }
  `;
  document.head.appendChild(style);
} 