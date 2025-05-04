import React, { useState, useEffect, useRef } from 'react';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../config/tmdb';
import { Play, Info } from 'lucide-react';

const MovieSuggestionCard = ({ movie, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const popupRef = useRef(null);
  const cardRef = useRef(null);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cache details in sessionStorage to avoid refetching
  const detailsCacheKey = `movie-details-${movie.id}`;

  // Fetch movie details with caching
  useEffect(() => {
    if (isHovered && !movieDetails) {
      const fetchMovieDetails = async () => {
        try {
          // Check cache first
          const cachedDetails = sessionStorage.getItem(detailsCacheKey);
          
          if (cachedDetails) {
            setMovieDetails(JSON.parse(cachedDetails));
            return;
          }

          // Fetch movie details if not in cache
          const detailsResponse = await fetch(
            `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}`
          );
          const details = await detailsResponse.json();
          setMovieDetails(details);
          sessionStorage.setItem(detailsCacheKey, JSON.stringify(details));
        } catch (error) {
          console.error('Error fetching movie details:', error);
        }
      };

      // Small delay before fetching to prevent unnecessary API calls on quick hover
      hoverTimeoutRef.current = setTimeout(fetchMovieDetails, 300);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovered, movie.id, movieDetails, detailsCacheKey]);

  // Handle hover state and popup visibility with delay
  useEffect(() => {
    if (isHovered && !isMobile) {
      setIsPopupVisible(false);
    } else {
      const timer = setTimeout(() => {
        setIsPopupVisible(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isHovered, isMobile]);

  // Handle clicks outside the popup to close it properly
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target) && 
          cardRef.current && !cardRef.current.contains(e.target)) {
        setIsHovered(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate popup position with improved positioning logic
  const getPopupPosition = () => {
    if (!cardRef.current) return {};

    const cardRect = cardRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Larger popup dimensions (Netflix-style)
    const popupHeight = 440; // Increased height
    const popupWidth = 360;  // Increased width

    // Calculate distance from each edge of screen
    const distanceFromBottom = viewportHeight - cardRect.bottom;
    const distanceFromTop = cardRect.top;
    const distanceFromRight = viewportWidth - cardRect.right;
    const distanceFromLeft = cardRect.left;
    
    // Determine best position based on available space
    if (distanceFromBottom >= popupHeight + 20) {
      // Show below
      return { 
        top: '100%', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        marginTop: '10px'
      };
    } 
    else if (distanceFromTop >= popupHeight + 20) {
      // Show above
      return { 
        bottom: '100%', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        marginBottom: '10px'
      };
    }
    else if (distanceFromRight >= popupWidth + 20) {
      // Show to the right
      return { 
        top: '0', 
        left: '100%', 
        marginLeft: '10px'
      };
    }
    else if (distanceFromLeft >= popupWidth + 20) {
      // Show to the left
      return { 
        top: '0', 
        right: '100%', 
        marginRight: '10px'
      };
    }
    
    // Default fallback - center and adjust to fit viewport
    return { 
      top: `calc(50% - ${Math.min(popupHeight/2, distanceFromBottom)}px)`,
      left: '100%', 
      marginLeft: '10px'
    };
  };

  // Genres formatter function
  const formatGenres = (genres) => {
    if (!genres || genres.length === 0) return '';
    return genres.slice(0, 3).map(g => g.name).join(', ');
  };

  return (
    <div 
      className={`relative ${isHovered ? 'z-50' : 'z-0'}`}
      ref={cardRef}
    >
      {/* Main Card */}
      <div
        className="netflix-card-hover w-full cursor-pointer"
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onClick={() => isMobile ? onSelect(movie) : null}
      >
        <div className="p-4 flex items-center gap-5 bg-gradient-to-r from-gray-900 to-black/90 hover:from-gray-800 hover:to-gray-900/90 group">
          {/* Poster */}
          <div className="relative w-20 h-28 flex-shrink-0 overflow-hidden rounded-md">
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Image'}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/342x513?text=No+Image';
              }}
            />
          </div>
          
          {/* Basic Info */}
          <div className="flex-1 text-left">
            <h3 className="text-white font-bold text-lg group-hover:text-red-500 transition-colors duration-200 truncate">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Netflix-style Popup (without trailer) */}
      {!isMobile && (
        <div
          className={`netflix-popup absolute bg-black rounded-lg overflow-hidden 
            ${isPopupVisible ? 'netflix-popup-visible visible' : 'netflix-popup-hidden invisible'}
          `}
          style={{
            width: '360px',
            ...getPopupPosition(),
          }}
          ref={popupRef}
        >
          {/* Backdrop Image */}
          <div className="relative w-full aspect-[16/9] bg-black">
            <img
              src={movie.backdrop_path 
                ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` 
                : (movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` 
                    : 'https://via.placeholder.com/780x439?text=No+Image')}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/780x439?text=No+Image';
              }}
            />
            
            {/* Maturity Rating Badge */}
            <div className="absolute top-3 right-3 bg-gray-800/90 text-white text-xs py-0.5 px-2 rounded">
              {movieDetails?.adult ? '18+' : 'PG-13'}
            </div>
          </div>

          {/* Movie Details Section */}
          <div className="p-5">
            {/* Title and Metadata Row */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-bold text-lg flex-1 truncate">{movie.title}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="flex items-center text-green-400 font-medium">
                  {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Metadata Row */}
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
              <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
              {movieDetails?.runtime && (
                <>
                  <span className="text-gray-500">•</span>
                  <span>
                    {Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m
                  </span>
                </>
              )}
              {movieDetails?.genres && movieDetails.genres.length > 0 && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="truncate max-w-[120px]">{formatGenres(movieDetails.genres)}</span>
                </>
              )}
            </div>
            
            {/* Description */}
            {movieDetails && (
              <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                {movieDetails.overview || 'No description available.'}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button 
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black px-4 py-2 rounded font-medium transition-colors"
                onClick={() => onSelect(movie)}
              >
                <Play size={18} />
                <span>Play</span>
              </button>
              <button 
                className="flex-1 flex items-center justify-center gap-2 bg-gray-600/60 hover:bg-gray-600/80 text-white px-4 py-2 rounded font-medium transition-colors"
                onClick={() => onSelect(movie)}
              >
                <Info size={18} />
                <span>More Info</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieSuggestionCard;