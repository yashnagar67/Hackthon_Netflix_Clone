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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const timerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const popupRef = useRef(null);
  
  // Check device type
  useEffect(() => {
    const checkDeviceType = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);
  
  // Calculate position of popup card
  const calculatePosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (isMobile) {
        // For mobile: center the popup in the viewport
        setPreviewPos({
          top: Math.max(window.scrollY + 70, window.scrollY + rect.top - 30),
          left: viewportWidth / 2 - 175, // Center the 350px wide popup
        });
      } else if (isTablet) {
        // For tablet: adjust position based on space available
        let leftPos = rect.left + window.scrollX - 40;
        const popupWidth = 350;
        
        if (leftPos + popupWidth > viewportWidth) {
          leftPos = viewportWidth - popupWidth - 20;
        }
        
        if (leftPos < 20) {
          leftPos = 20;
        }
        
        setPreviewPos({
          top: rect.top + window.scrollY - 50,
          left: leftPos
        });
      } else {
        // For desktop: original positioning
        let leftPos = rect.left + window.scrollX - 40;
        const popupWidth = 350;
        
        if (leftPos + popupWidth > viewportWidth) {
          leftPos = viewportWidth - popupWidth - 20;
        }
        
        if (leftPos < 20) {
          leftPos = 20;
        }
        
        setPreviewPos({
          top: rect.top + window.scrollY - 60,
          left: leftPos
        });
      }
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
    }, isMobile || isTablet ? 100 : 500); // Faster response on mobile/tablet
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

  // Handle mobile tap
  const handleCardTap = () => {
    if (isMobile || isTablet) {
      if (shouldShowPreview && hoveredId === movie.id) {
        // If preview is already visible, close it or play the movie
        setShouldShowPreview(false);
        setHoveredId(null);
      } else {
        // First tap shows the preview
        calculatePosition();
        setShouldShowPreview(true);
        setHoveredId(movie.id);
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
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
        onClick={handleCardTap}
      >
        {/* Base Movie Card */}
        <div className="relative w-28 h-40 sm:w-32 sm:h-48 md:w-40 md:h-60 lg:w-45 lg:h-65 rounded overflow-hidden transition-shadow duration-300">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability on hover */}
          <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-25"></div>
          
          {/* Recommendation tag always visible */}
          <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-2 py-0.5 z-10 shadow-lg" 
            style={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
            AI Pick
          </div>
          
          {/* Top 10 Badge */}
          {movie.isTopTen && (
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-bl font-bold">
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
      </div>

      {/* Hover Preview Popup */}
      {shouldShowPreview && hoveredId === movie.id && createPortal(
        <div
          ref={popupRef}
          className="fixed sm:absolute bg-neutral-900 text-white rounded-md shadow-2xl netflix-popup z-[9999]"
          style={{
            top: isMobile ? '50%' : previewPos.top,
            left: isMobile ? '50%' : previewPos.left,
            transform: isMobile ? 'translate(-50%, -50%)' : 'none',
            position: isMobile ? 'fixed' : 'absolute',
            width: isMobile ? 'calc(100vw - 40px)' : '350px',
            maxWidth: '90vw',
            maxHeight: isMobile ? '80vh' : 'none',
            overflow: isMobile ? 'auto' : 'visible',
            transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out',
            opacity: 1,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Close button for mobile */}
          {isMobile && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShouldShowPreview(false);
                setHoveredId(null);
              }}
              className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center"
            >
              <X size={16} />
            </button>
          )}

          {/* Preview Image/Video */}
          <div className="relative w-full aspect-[16/9] bg-gray-800 rounded-t-md overflow-hidden">
            {!videoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            )}
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
            />
            
            {/* Sound toggle */}
            <button 
              className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/70 hover:bg-black/90"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX size={isMobile ? 16 : 18} /> : <Volume2 size={isMobile ? 16 : 18} />}
            </button>
            
            {/* Maturity Rating Badge */}
            <div className="absolute top-3 right-3 bg-gray-800/90 text-white text-xs py-0.5 px-2 rounded">
              {movie.maturityRating || "16+"}
            </div>
          </div>

          {/* Movie Info */}
          <div className="p-3 sm:p-4">
            {/* Title and Match Row */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-bold text-base sm:text-lg flex-1 truncate">{movie.title}</h3>
              <div className="ml-2 flex-shrink-0">
                <span className="text-green-500 font-medium text-sm">{movie.match || "97%"} Match</span>
              </div>
            </div>
            
            {/* Metadata Row */}
            <div className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3">
              <span>{movie.year || "2023"}</span>
              <span className="text-gray-500">•</span>
              <span>{movie.duration || "2h 3m"}</span>
              <span className="text-gray-500">•</span>
              <span className="truncate max-w-[150px]">{genreDisplay || "Drama • Action • Thriller"}</span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-white hover:bg-white/90 text-black px-2 sm:px-4 py-1.5 sm:py-2 rounded font-medium text-xs sm:text-sm transition-colors"
                onClick={handlePlayTrailer}
              >
                <Play size={isMobile ? 12 : 18} />
                <span>Play</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600/40 hover:bg-gray-600/60">
                <Plus size={isMobile ? 14 : 18} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600/40 hover:bg-gray-600/60">
                <ThumbsUp size={isMobile ? 14 : 18} />
              </button>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600/40 hover:bg-gray-600/60 ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("More info for:", movie.title);
                }}
              >
                <ChevronDown size={isMobile ? 14 : 18} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Trailer Modal */}
      {showTrailer && createPortal(
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]"
          onClick={closeTrailer}
        >
          <div 
            className="relative w-full h-full sm:w-4/5 sm:h-auto max-w-4xl aspect-video p-4 sm:p-0"
            ref={popupRef}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 sm:-top-10 sm:-right-10 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center"
              onClick={closeTrailer}
            >
              <X />
            </button>
            
            {/* Iframe for Trailer */}
            {trailerUrl && (
              <iframe
                src={trailerUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

const RecommendationSection = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const rowRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Simulate loading recommendations
    setIsLoading(true);
    const timeout = setTimeout(() => {
      // Sample recommendation data
      const sampleRecommendations = [
        {
          id: 1,
          title: 'Chhaava',
          posterUrl: 'https://assetscdn1.paytm.com/images/cinema/Chhaava-1-214x366-e7404440-8f16-11ee-bad3-a13961e0d339.jpg',
          previewUrl: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
          match: 98,
          year: 2023,
          maturityRating: '16+',
          duration: '2h 30m',
          genre: ['Drama', 'History', 'Action'],
          description: 'A young warrior rises to prominence through historical battles.',
          isTopTen: true
        },
        {
          id: 2,
          title: 'Lucky Baskhar',
          posterUrl: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/lucky-baskhar-et00365846-1700464074.jpg',
          previewUrl: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
          match: 95,
          year: 2023,
          maturityRating: 'PG-13',
          duration: '2h 15m',
          genre: ['Drama', 'Comedy', 'Crime'],
          recentlyAdded: true
        },
        {
          id: 3,
          title: 'Jewel Thief',
          posterUrl: 'https://1.bp.blogspot.com/-PocW8zY5l5o/YYgolc9bkzI/AAAAAAAAXuw/6TG8YlPZDEE4uP5SXNM3ZBjEPQw_K0UpwCNcBGAsYHQ/s1080/Jewel-Thief-1967-movie-posters.jpg',
          previewUrl: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
          match: 92,
          year: 1967,
          maturityRating: 'U',
          duration: '2h 40m',
          genre: ['Mystery', 'Thriller', 'Classic']
        },
        {
          id: 4,
          title: 'MAID',
          posterUrl: 'https://upload.wikimedia.org/wikipedia/en/8/82/Maid_miniseries.jpg',
          previewUrl: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
          match: 97,
          year: 2021,
          maturityRating: '18+',
          duration: 'Limited Series',
          genre: ['Drama', 'Women', 'Social Issue'],
          recentlyAdded: true
        },
        {
          id: 5,
          title: 'Pushpa: The Rise',
          posterUrl: 'https://upload.wikimedia.org/wikipedia/en/7/72/Pushpa_-_The_Rise_%282021_film%29_poster.jpg',
          previewUrl: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
          match: 94,
          year: 2021,
          maturityRating: '16+',
          duration: '2h 59m',
          genre: ['Action', 'Crime', 'Thriller'],
          isTopTen: true
        },
        {
          id: 6,
          title: 'Court',
          posterUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Court_%282014_film%29.jpg',
          previewUrl: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
          match: 96,
          year: 2014,
          maturityRating: 'PG-13',
          duration: '1h 56m',
          genre: ['Drama', 'Legal', 'Social']
        }
      ];
      
      setRecommendations(sampleRecommendations);
      setIsLoading(false);
      
    }, 1500); // Simulate network delay
    
    return () => clearTimeout(timeout);
  }, []);

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current && rowRef.current) {
        setIsScrollable(contentRef.current.scrollWidth > rowRef.current.clientWidth);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [recommendations, isLoading]);

  // Track recommendation clicks
  function handleRecommendEvent(event) {
    // In a real app, you would send analytics data about the recommendation click
    console.log('Recommendation clicked:', event);
    // Could send to analytics service here
  }

  // Scroll logic
  const scroll = (direction) => {
    if (contentRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      const newPosition = scrollPosition + scrollAmount;
      
      // Calculate bounds
      const maxScroll = contentRef.current.scrollWidth - rowRef.current.clientWidth;
      const boundedPosition = Math.max(0, Math.min(newPosition, maxScroll));
      
      setScrollPosition(boundedPosition);
      contentRef.current.scrollTo({
        left: boundedPosition,
        behavior: 'smooth'
      });
    }
  };

  // Loading skeleton
  const RecommendationSkeleton = () => (
    <div className="p-4 sm:p-6">
      <div className="h-6 w-48 bg-gray-800 animate-pulse mb-4"></div>
      <div className="h-4 w-64 bg-gray-800 animate-pulse mb-6"></div>
      
      <div className="flex overflow-x-hidden space-x-3 sm:space-x-4">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 bg-gray-800 animate-pulse rounded" 
            style={{ 
              width: '150px',
              height: '200px',
              animationDelay: `${i * 0.1}s` 
            }}
          ></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-black text-white pb-8 relative">
      <div className="container mx-auto px-4 pt-6">
        {isLoading ? (
          <RecommendationSkeleton />
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-lg sm:text-2xl font-bold mb-2">Recommended For You</h2>
              <p className="text-xs sm:text-sm text-gray-400">Based on your watching history and preferences</p>
            </div>
            
            {/* Recommendations Row */}
            <div className="relative py-2" ref={rowRef}>
              {/* Left Scroll Button */}
              {isScrollable && scrollPosition > 20 && (
                <button 
                  className="absolute left-0 z-10 h-full flex items-center justify-center pl-1 pr-2 bg-black/30 hover:bg-black/60"
                  onClick={() => scroll('left')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {/* Recommendation Cards */}
              <div 
                ref={contentRef}
                className="flex space-x-3 sm:space-x-4 overflow-x-auto scrollbar-hide"
                style={{ 
                  scrollBehavior: 'smooth',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none'
                }}
              >
                {recommendations.map(movie => (
                  <div 
                    key={movie.id} 
                    className="flex-shrink-0"
                    style={{ width: 'calc(33.333% - 12px)', maxWidth: '180px' }}
                    onClick={() => handleRecommendEvent(movie)}
                  >
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
              
              {/* Right Scroll Button */}
              {isScrollable && scrollPosition < (contentRef.current?.scrollWidth - rowRef.current?.clientWidth - 20) && (
                <button 
                  className="absolute right-0 top-0 z-10 h-full flex items-center justify-center pl-2 pr-1 bg-black/30 hover:bg-black/60"
                  onClick={() => scroll('right')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </>
        )}
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