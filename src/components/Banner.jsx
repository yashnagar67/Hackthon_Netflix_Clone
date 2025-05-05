import React, { useState, useEffect, useRef } from "react";
import { Play, Info, VolumeX, Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import { useMood } from "../context/MoodContext";

// Updated movie data to use Stranger Things
const movies = [
  {
    id: 1,
    title: "Mickey 17",
    desktopImage: "https://image.tmdb.org/t/p/original/iimkH5M5VfkIegy68LrJiFXOnza.jpg", // Official poster
    mobileImage: "https://image.tmdb.org/t/p/w780/iimkH5M5VfkIegy68LrJiFXOnza.jpg", // Using optimized image for mobile
    logoImage: "/api/placeholder/300/120",
    videoPreview: "mickey17.mp4", // Local or CDN video preview
    description: "An expendable named Mickey 17 is sent on a dangerous mission to colonize an ice world, only to uncover dark secrets about his existence and the colony's future.",
    rating: 8.5,
    year: "2025",
    maturityRating: "PG-13",
    seasons: null, // It's a movie, so no seasons
    topTen: true,
    genre: ["Sci-Fi", "Thriller", "Drama"],
    tags: ["Mind-Bending", "Suspenseful", "Epic Scale"],
    matchPercentage: 95,
    origin: "Made in U.S."
  },
  {
    id: 4,
    title: "Squid Game",
    desktopImage: "https://media.themoviedb.org/t/p/w1000_and_h563_face/hOsTmukXHBNsxbTfwGYTzMTOkS1.jpg",
    mobileImage: "https://media.themoviedb.org/t/p/w780/hOsTmukXHBNsxbTfwGYTzMTOkS1.jpg",
    logoImage: "/api/placeholder/300/120",
    videoPreview: "Squid_games.mp4",
    description: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits — with deadly high stakes.",
    rating: 8.1,
    year: "2021",
    maturityRating: "TV-MA",
    seasons: 1,
    topTen: true,
    genre: ["Thriller", "Drama", "Survival"],
    tags: ["Suspenseful", "Intense", "Social Commentary"],
    matchPercentage: 94,
    origin: "Made in South Korea"
  },
  // Stranger Things
{
  id: 2,
  title: "Stranger Things",
  desktopImage: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  mobileImage: "https://image.tmdb.org/t/p/w780/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  logoImage: "/api/placeholder/300/120",
  videoPreview: "Stanger_things.mp4",
  description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
  rating: 8.7,
  year: "2016",
  maturityRating: "TV-14",
  seasons: 4,
  topTen: true,
  genre: ["Sci-Fi", "Horror", "Drama"],
  tags: ["Suspenseful", "Nostalgic", "Ensemble Cast"],
  matchPercentage: 97,
  origin: "Made in U.S."
},

// Money Heist
{
  id: 3,
  title: "Money Heist",
  desktopImage: "https://media.themoviedb.org/t/p/w1000_and_h563_face/mxFvdWtK26oR7jR8suZKro6GT9U.jpg",
  mobileImage: "https://media.themoviedb.org/t/p/w780/mxFvdWtK26oR7jR8suZKro6GT9U.jpg",
  logoImage: "/api/placeholder/300/120",
  videoPreview: "Money_heist.mp4",
  description: "Eight thieves take hostages and lock themselves in the Royal Mint of Spain as a criminal mastermind manipulates the police to carry out his plan.",
  rating: 8.3,
  year: "2017",
  maturityRating: "TV-MA",
  seasons: 5,
  topTen: true,
  genre: ["Crime", "Thriller", "Drama"],
  tags: ["Exciting", "Suspenseful", "Heist"],
  matchPercentage: 96,
  origin: "Made in Spain"
},

// Chhava
{
  id: 4,
  title: "Chhava",
  desktopImage: "https://media.themoviedb.org/t/p/w1000_and_h563_face/kKOV3Y3FlWVNzbM7cXKKeN4ZbfW.jpg",
  mobileImage: "https://media.themoviedb.org/t/p/w780/kKOV3Y3FlWVNzbM7cXKKeN4ZbfW.jpg",
  logoImage: "/api/placeholder/300/120",
  videoPreview: "Chhaava.mp4",
  description: "An epic historical drama depicting the bravery, leadership, and sacrifice of Chhatrapati Sambhaji Maharaj in the Maratha Empire.",
  rating: 9.0,
  year: "2025",
  maturityRating: "U/A 16+",
  seasons: 1,
  topTen: true,
  genre: ["Historical", "Action", "Drama"],
  tags: ["Epic", "Based on Real Life", "Period Piece"],
  matchPercentage: 98,
  origin: "Made in India"
}

];

export default function NetflixBanner() {
  const [isLoaded, setIsLoaded] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { currentMood, moodThemes } = useMood();
  
  const videoRef = useRef(null);
  const slideTimerRef = useRef(null);
  const posterTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const previewDurationRef = useRef(null);
  
  const currentMovie = movies[currentIndex];
  const INITIAL_POSTER_DELAY = 1000; // 2 seconds
  const PREVIEW_DURATION = 20000; // 20 seconds (increased from previous setting)
  const TRANSITION_DURATION = 800; // 0.8 seconds for smooth fade

  // Get current mood colors for neon effects
  const moodColors = moodThemes[currentMood]?.colors || moodThemes.default.colors;
  const neonPrimary = moodColors.primary;
  const neonAccent = moodColors.accent;

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Function to play video
  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
        setIsPlaying(false);
      });
    }
  };
  
  // Function to handle transitions between movies
  const transitionToNextMovie = () => {
    setIsTransitioning(true);
    
    // Start transition animation
    transitionTimerRef.current = setTimeout(() => {
      // Move to the next movie
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
      setShowPoster(true);
      setIsPlaying(false);
      setIsTransitioning(false);
      
      // Reset the cycle for the new movie
      startMovieCycle();
    }, TRANSITION_DURATION);
  };
  
  // Function to start the poster->video->next cycle for a movie
  const startMovieCycle = () => {
    // Clear any existing timers
    clearTimeout(posterTimerRef.current);
    clearTimeout(previewDurationRef.current);
    
    // Step 1: Show poster for 2 seconds
    setShowPoster(true);
    setIsPlaying(false);
    
    posterTimerRef.current = setTimeout(() => {
      if (!isHovering || isMobile) {
        // Step 2: Play video preview after 2 seconds
        setShowPoster(false);
        setIsPlaying(true);
        playVideo();
        
        // Step 3: Set up transition to next movie after video plays for 8 seconds
        previewDurationRef.current = setTimeout(() => {
          if (!isHovering || isMobile) {
            transitionToNextMovie();
          }
        }, PREVIEW_DURATION);
      }
    }, INITIAL_POSTER_DELAY);
  };

  // Start the banner cycle on component mount
  useEffect(() => {
    startMovieCycle();
    
    // Cleanup all timers on component unmount
    return () => {
      clearTimeout(posterTimerRef.current);
      clearTimeout(previewDurationRef.current);
      clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Reset cycle when hover state changes
  useEffect(() => {
    if (!isMobile) {
      if (isHovering) {
        // On hover, clear timers to pause auto-rotation
        clearTimeout(posterTimerRef.current);
        clearTimeout(previewDurationRef.current);
        clearTimeout(transitionTimerRef.current);
      } else {
        // When hover ends, if video is playing, set timer to switch to next
        if (isPlaying && !showPoster) {
          clearTimeout(previewDurationRef.current);
          previewDurationRef.current = setTimeout(() => {
            transitionToNextMovie();
          }, PREVIEW_DURATION);
        } else {
          // If we're still in poster phase, continue the cycle
          startMovieCycle();
        }
      }
    }
  }, [isHovering, isMobile]);

  // Handle mouse events
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovering(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handlePlayClick = () => {
    console.log("Play clicked for:", currentMovie.title);
  };

  const handleMoreInfoClick = () => {
    console.log("More info clicked for:", currentMovie.title);
  };
  
  // Navigation between banner movies
  const goToPrevious = (e) => {
    e.stopPropagation();
    clearTimeout(posterTimerRef.current);
    clearTimeout(previewDurationRef.current);
    clearTimeout(transitionTimerRef.current);
    
    setIsTransitioning(true);
    transitionTimerRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? movies.length - 1 : prevIndex - 1));
      setShowPoster(true);
      setIsPlaying(false);
      setIsTransitioning(false);
      startMovieCycle();
    }, TRANSITION_DURATION / 2);
  };
  
  const goToNext = (e) => {
    e.stopPropagation();
    clearTimeout(posterTimerRef.current);
    clearTimeout(previewDurationRef.current);
    clearTimeout(transitionTimerRef.current);
    
    transitionToNextMovie();
  };

  return (
    <div 
      className={`relative h-[80vh] md:h-[80vh] lg:h-[90vh] w-full overflow-visible transition-opacity duration-${TRANSITION_DURATION} ${isTransitioning ? 'opacity-70' : 'opacity-100'} md:mb-0`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Content */}
      <div className="absolute inset-0 overflow-visible">
        {!showPoster && isPlaying ? (
          <div className="w-full h-full">
            {/* Video preview */}
            <video
              ref={videoRef}
              src={currentMovie.videoPreview || null}
              poster={currentMovie.desktopImage}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              className={`w-full h-full sm:h-[105vh] lg:min-h-[105vh] object-cover object-center transition-opacity duration-${TRANSITION_DURATION}`}
              onError={(e) => {
                console.error("Video error:", e);
                setIsPlaying(false);
                setShowPoster(true);
              }}
              onLoadedData={() => setIsLoaded(true)}
            />
          </div>
        ) : (
          <div className="w-full h-[105vh]">
            {/* Responsive images - desktop vs mobile */}
            <img
              src={currentMovie.desktopImage}
              alt={currentMovie.title}
              className={`hidden sm:block w-full object-cover object-center transition-opacity duration-${TRANSITION_DURATION}`}
              onLoad={() => setIsLoaded(true)}
            />
            <img
              src={currentMovie.mobileImage || currentMovie.desktopImage}
              alt={currentMovie.title}
              className={`sm:hidden w-full h-[80vh] object-cover object-top transition-opacity duration-${TRANSITION_DURATION}`}
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                console.error("Mobile image error, fallback to desktop:", e);
                e.target.src = currentMovie.desktopImage;
              }}
            />
          </div>
        )}
        
        {/* Bottom gradient overlay - stronger on mobile */}
        <div className="absolute inset-0 h-[120vh]">
          {/* Bottom gradient - smooth transition to card section */}
          <div className="absolute bottom-0 inset-x-0 h-[105vh] bg-gradient-to-t from-[var(--mood-background,#141414)] via-[var(--mood-background,#141414)]/20 to-transparent md:via-[var(--mood-background,#141414)]/10" />
        </div>

        {/* Neon light effects based on current mood */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top neon border */}
          <div 
            className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
            style={{ 
              background: neonPrimary,
              boxShadow: `0 0 10px ${neonPrimary}, 0 0 20px ${neonPrimary}, 0 0 30px ${neonPrimary}`,
              animation: 'neonPulse 3s ease-in-out infinite alternate'
            }}
          />
          
          {/* Corner neon accents */}
          <div className="absolute top-0 left-0 w-[120px] h-[120px] pointer-events-none">
            <div 
              className="absolute top-0 left-0 w-[3px] h-[120px]"
              style={{ 
                background: neonAccent,
                boxShadow: `0 0 10px ${neonAccent}, 0 0 20px ${neonAccent}`,
                animation: 'neonPulse 3s ease-in-out infinite alternate'
              }}
            />
            <div 
              className="absolute top-0 left-0 w-[120px] h-[3px]"
              style={{ 
                background: neonAccent,
                boxShadow: `0 0 10px ${neonAccent}, 0 0 20px ${neonAccent}`,
                animation: 'neonPulse 3s ease-in-out infinite alternate 0.3s'
              }}
            />
          </div>
          
          <div className="absolute top-0 right-0 w-[120px] h-[120px] pointer-events-none">
            <div 
              className="absolute top-0 right-0 w-[3px] h-[120px]"
              style={{ 
                background: neonAccent,
                boxShadow: `0 0 10px ${neonAccent}, 0 0 20px ${neonAccent}`,
                animation: 'neonPulse 3s ease-in-out infinite alternate 0.6s'
              }}
            />
            <div 
              className="absolute top-0 right-0 w-[120px] h-[3px]"
              style={{ 
                background: neonAccent,
                boxShadow: `0 0 10px ${neonAccent}, 0 0 20px ${neonAccent}`,
                animation: 'neonPulse 3s ease-in-out infinite alternate 0.9s'
              }}
            />
          </div>
          
          {/* Soft ambient glow overlay - color depends on mood */}
          <div 
            className="absolute inset-0 mix-blend-soft-light opacity-30"
            style={{
              background: `radial-gradient(circle at center, ${neonPrimary}22 0%, transparent 70%)`,
              animation: 'softGlow 8s ease-in-out infinite alternate',
            }}
          />
        </div>
      </div>

      {/* Navigation Arrows - hide on small screens */}
      <div className="absolute inset-y-0 left-2 hidden sm:flex items-center z-20">
        <button
          onClick={goToPrevious}
          className="p-2 bg-black/30 hover:bg-black/60 rounded-full transition-colors duration-300"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      </div>
      
      <div className="absolute inset-y-0 right-2 hidden sm:flex items-center z-20">
        <button
          onClick={goToNext}
          className="p-2 bg-black/30 hover:bg-black/60 rounded-full transition-colors duration-300"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Content - Positioned with z-index to ensure visibility */}
      <div className={`relative h-full flex items-end z-10 transition-opacity duration-${TRANSITION_DURATION} ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Volume control - Only visible when hovering and video is playing */}
        {isPlaying && (isHovering || isMobile) && (
          <button 
            onClick={toggleMute}
            className="absolute bottom-8 right-4 sm:bottom-0 sm:right-6 md:right-12 transform sm:-translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 sm:p-3 rounded-full transition-all duration-300 z-20"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>
        )}

        <div className="container mx-auto px-4 sm:px-6 md:px-12 pb-4 sm:pb-0 md:pb-16">
          <div className="max-w-md sm:max-w-lg md:max-w-2xl">
              {/* Mobile content - positioned at bottom */}
              <div className="md:hidden flex flex-col justify-end w-full">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-5 drop-shadow-lg shadow-black mood-text-glow">
                  {currentMovie.title}
                </h1>
                
                {/* Action buttons with neon effect */}
                <div className="flex flex-row gap-3 w-full">
                  <button 
                    className="flex items-center justify-center gap-1.5 bg-white hover:bg-white/90 text-black px-5 py-2 rounded font-medium text-sm sm:text-base transition-colors duration-200 mood-button-glow"
                    onClick={handlePlayClick}
                    style={{
                      boxShadow: `0 0 10px rgba(255, 255, 255, 0.5)`,
                    }}
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    <span>Play</span>
                  </button>
                  <button 
                    className="flex items-center justify-center gap-1.5 bg-gray-500/40 hover:bg-gray-500/60 text-white px-5 py-2 rounded font-medium text-sm sm:text-base transition-colors duration-200 mood-button-glow"
                    onClick={handleMoreInfoClick}
                    style={{
                      boxShadow: `0 0 10px ${neonPrimary}44`,
                    }}
                  >
                    <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>More Info</span>
                  </button>
                </div>
              </div>

              {/* Desktop content */}
              <div className="hidden md:block">
                {/* Top 10 Badge and Rank with neon effect */}
                {currentMovie.topTen && (
                  <div className="flex items-center mb-2">
                    <span 
                      className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded mr-2 mood-tag-glow"
                      style={{
                        boxShadow: `0 0 8px ${neonPrimary}, 0 0 12px ${neonPrimary}44`,
                      }}
                    >
                      TOP 10
                    </span>
                    <span className="text-white text-lg font-semibold">#{currentIndex + 1} in TV Shows Today</span>
                  </div>
                )}
                
                {/* Title with neon glow */}
                <h1 
                  className="text-4xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg shadow-black mood-text-glow"
                  style={{
                    textShadow: `0 0 10px ${neonPrimary}88, 0 0 20px ${neonPrimary}44`,
                  }}
                >
                  {currentMovie.title}
                </h1>
                
                {/* Description */}
                <p className="text-base md:text-lg text-white/90 mb-6 line-clamp-3 drop-shadow-md">
                  {currentMovie.description}
                </p>
                
                {/* Action buttons with neon effect */}
                <div className="flex flex-row gap-4 mb-6">
                  <button 
                    className="flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black px-8 py-3 rounded font-medium text-lg transition-colors duration-200 mood-button-glow"
                    onClick={handlePlayClick}
                    style={{
                      boxShadow: `0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.4)`,
                    }}
                  >
                    <Play className="w-6 h-6 text-black" />
                    <span>Play</span>
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 bg-[var(--mood-secondary,#141414)]/60 hover:bg-[var(--mood-secondary,#141414)]/80 text-[var(--mood-text,#ffffff)] px-8 py-3 rounded font-medium text-lg border border-white/20 transition-colors duration-200 mood-button-glow"
                    onClick={handleMoreInfoClick}
                    style={{
                      boxShadow: `0 0 10px ${neonAccent}44, 0 0 20px ${neonAccent}22`,
                    }}
                  >
                    <Info className="w-5 h-5" />
                    <span>More Info</span>
                  </button>
                </div>
                
                {/* Meta Info with subtle neon borders */}
                <div 
                  className="flex flex-wrap items-center gap-4 text-[var(--mood-text,#ffffff)]/80 text-sm"
                >
                  <span 
                    className="border border-[var(--mood-text,#ffffff)]/30 px-2 py-0.5 rounded mood-meta-glow"
                    style={{
                      boxShadow: `0 0 5px ${neonPrimary}33`,
                    }}
                  >
                    {currentMovie.maturityRating}
                  </span>
                  <span>{currentMovie.year}</span>
                  {currentMovie.seasons && <span>{currentMovie.seasons} Seasons</span>}
                  <span className="hidden sm:inline">{currentMovie.origin}</span>
                </div>
              </div>
          </div>
        </div>
      </div>
      
      {/* Movie indicator dots with neon effect */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {movies.map((_, index) => (
          <div 
            key={index}
            className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/30'}`}
            style={{
              boxShadow: index === currentIndex ? `0 0 5px ${neonPrimary}, 0 0 10px ${neonPrimary}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}