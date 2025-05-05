import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import SearchDropdown from './SearchDropdown';
import { saveClickedMovie } from '../utils/searchCache';

// Import movie data
import { dummyMovies } from '../movies/MovieData';

export default function NetflixNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close profile menu and search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      
      // Close search if clicked outside search area
      const searchArea = document.querySelector('.search-area');
      if (isSearchActive && searchArea && !searchArea.contains(event.target)) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchActive]);

  // Focus search input when search is activated
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close search if open
    if (isSearchActive) setIsSearchActive(false);
  };

  // Toggle profile menu
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    // Close search if open
    if (isSearchActive) setIsSearchActive(false);
  };
  
  // Toggle search bar
  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    // Close profile menu if open
    if (profileMenuOpen) setProfileMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMovieSelect = (movie) => {
    console.log('Selected movie:', movie);
    
    // Save the clicked movie to localStorage
    saveClickedMovie(movie);
    
    // Log all stored movies
    try {
      const storedMovies = localStorage.getItem('clickedMovies');
      if (storedMovies) {
        const parsedMovies = JSON.parse(storedMovies);
        console.log('ALL SAVED CLICKED MOVIES:', parsedMovies);
        console.log('Total saved movies:', parsedMovies.length);
      }
    } catch (error) {
      console.error('Error reading clicked movies from localStorage:', error);
    }
    
    // Handle movie selection (e.g., navigate to movie page)
    setSearchQuery('');
    setIsSearchActive(false);
  };

  const recommendMovies = () => {
    console.log('Recommend button clicked');
    
    try {
      // Step 1: Get all movies from dummyMovies object (combine all category arrays)
      const allMoviesArray = Object.values(dummyMovies).flat();
      console.log('Total movies found:', allMoviesArray.length);
      
      // Step 2: Extract all unique genres
      const allGenres = [...new Set(allMoviesArray.flatMap(movie => movie.genre))];
      console.log('Available genres:', allGenres);
      
      // Randomly select 1-2 genres
      const numberOfGenresToSelect = Math.floor(Math.random() * 2) + 1; // 1 or 2
      const selectedGenres = [];
      
      for (let i = 0; i < numberOfGenresToSelect; i++) {
        const randomIndex = Math.floor(Math.random() * allGenres.length);
        const selectedGenre = allGenres[randomIndex];
        
        // Avoid duplicates
        if (!selectedGenres.includes(selectedGenre)) {
          selectedGenres.push(selectedGenre);
        }
      }
      console.log('Selected genres:', selectedGenres);
      
      // Step 3: Filter movies by selected genres
      const matchingMovies = allMoviesArray.filter(movie => 
        movie.genre.some(genre => selectedGenres.includes(genre))
      );
      console.log('Matching movies count:', matchingMovies.length);
      
      // Step 4: Shuffle the matched movies
      const shuffledMovies = [...matchingMovies].sort(() => Math.random() - 0.5);
      
      // Step 5: Pick top 3-5 movies
      const numberOfRecommendations = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
      const recommendedMovies = shuffledMovies.slice(0, numberOfRecommendations);
      console.log('Final recommendations:', recommendedMovies);
      
      // Step 6: Display recommended movies
      // Create a custom event to pass recommended movies to other components
      try {
        console.log('Creating and dispatching event with recommendations');
        const recommendationEvent = new CustomEvent('movieRecommendations', {
          bubbles: true, // Allow the event to bubble up
          cancelable: true,
          detail: {
            movies: recommendedMovies,
            genres: selectedGenres
          }
        });
        
        // Dispatch the event on both window and document to ensure it's captured
        window.dispatchEvent(recommendationEvent);
        document.dispatchEvent(recommendationEvent);
        
        console.log('Event dispatched successfully');
        
        // Scroll to recommendation section with adjusted positioning
        setTimeout(() => {
          const anchor = document.getElementById('recommendation-anchor');
          if (anchor) {
            console.log('Scrolling to recommendation section');
            
            // Calculate a position that's visible but not too far down
            const navbarHeight = 80; // Approximate navbar height in pixels
            const yOffset = -navbarHeight;
            
            const y = anchor.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            window.scrollTo({
              top: y,
              behavior: 'smooth'
            });
          } else {
            console.warn('Recommendation anchor not found');
          }
        }, 300);
      } catch (dispatchError) {
        console.error('Error dispatching event:', dispatchError);
      }
    } catch (error) {
      console.error('Error in recommendMovies function:', error);
    }
  };

  return (
    <header 
      className={`fixed top-0 w-[103vw] z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-black bg-opacity-90' 
          : 'bg-gradient-to-b from-black via-black/80 to-transparent'
      } ${isScrolled ? 'py-1' : 'py-3'}`}
    >
      <div className="w-[100vw] mx-auto px-4 md:px-1 flex items-center justify-between">
        {/* Left Section: Logo and Nav Links */}
        <div className="flex items-center">
          {/* Netflix Logo */}
          <a href="/" className="mr-6 md:mr-10 flex-shrink-0">
            <svg className={`transition-all duration-500 fill-red-600 ${isScrolled ? 'w-20' : 'w-24'}`} viewBox="0 0 111 30">
              <path d="M105.06233,14.2806261 L110.999156,30 C109.249227,29.7497422 107.500234,29.4366857 105.718437,29.1554972 L102.374168,20.4686475 L98.9371075,28.4375293 C97.2499766,28.1563408 95.5928391,28.061674 93.9057081,27.8432843 L99.9372012,14.0931671 L94.4680851,-5.68434189e-14 L99.5313525,-5.68434189e-14 L102.593495,7.87421502 L105.874965,-5.68434189e-14 L110.999156,-5.68434189e-14 L105.06233,14.2806261 Z M90.4686475,-5.68434189e-14 L85.8749649,-5.68434189e-14 L85.8749649,27.2499766 C87.3746368,27.3437061 88.9371075,27.4055675 90.4686475,27.5930265 L90.4686475,-5.68434189e-14 Z M81.9055207,26.93692 C77.7186241,26.6557316 73.5307901,26.4064111 69.250164,26.3117443 L69.250164,-5.68434189e-14 L73.9366389,-5.68434189e-14 L73.9366389,21.8745899 C76.6248008,21.9373887 79.3120255,22.1557784 81.9055207,22.2804387 L81.9055207,26.93692 Z M64.2496954,10.6561065 L64.2496954,15.3435186 L57.8442216,15.3435186 L57.8442216,25.9996251 L53.2186709,25.9996251 L53.2186709,-5.68434189e-14 L66.3436123,-5.68434189e-14 L66.3436123,4.68741213 L57.8442216,4.68741213 L57.8442216,10.6561065 L64.2496954,10.6561065 Z M45.3435186,4.68741213 L45.3435186,26.2498828 C43.7810479,26.2498828 42.1876465,26.2498828 40.6561065,26.3117443 L40.6561065,4.68741213 L35.8121661,4.68741213 L35.8121661,-5.68434189e-14 L50.2183897,-5.68434189e-14 L50.2183897,4.68741213 L45.3435186,4.68741213 Z M30.749836,15.5928391 C28.687787,15.5928391 26.2498828,15.5928391 24.4999531,15.6875059 L24.4999531,22.6562939 C27.2499766,22.4678976 30,22.2495079 32.7809542,22.1557784 L32.7809542,26.6557316 L19.812541,27.6876933 L19.812541,-5.68434189e-14 L32.7809542,-5.68434189e-14 L32.7809542,4.68741213 L24.4999531,4.68741213 L24.4999531,10.9991564 C26.3126816,10.9991564 29.0936358,10.9054269 30.749836,10.9054269 L30.749836,15.5928391 Z M4.78114163,12.9684132 L4.78114163,29.3429562 C3.09401069,29.5313525 1.59340144,29.7497422 0,30 L0,-5.68434189e-14 L4.4690224,-5.68434189e-14 L10.562377,17.0315868 L10.562377,-5.68434189e-14 L15.2497891,-5.68434189e-14 L15.2497891,28.061674 C13.5935889,28.3437998 11.906458,28.4375293 10.1246602,28.6868498 L4.78114163,12.9684132 Z"></path>
            </svg>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex">
            <ul className="flex items-center space-x-8">
              <li><a href="#" className="text-white hover:text-gray-300 font-medium text-sm">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">TV Shows</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Movies</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">New & Popular</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">My List</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white text-sm">Browse by Languages</a></li>
            </ul>
          </nav>
        </div>
        
        {/* Right Icons */}
        <div className="flex items-center justify-between space-x-4 md:space-x-6">
          {/* Search Icon & Expandable Search Bar */}
          <div className="relative search-area" ref={searchContainerRef}>
            <div className={`flex items-center transition-all duration-300 rounded ${isSearchActive ? 'bg-black bg-opacity-90 border border-gray-800' : ''}`}>
              <button 
                className="text-white p-2 focus:outline-none"
                onClick={toggleSearch}
                onMouseEnter={toggleSearch}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <div className={`overflow-hidden ease-in-out transition-all duration-300 ${isSearchActive ? 'w-50 md:w-100 opacity-100' : 'w-0 opacity-0'}`}>
                <input 
                  type="text" 
                  placeholder="Search titles, actors, genres..."
                  className="bg-transparent text-white text-sm w-full px-2 py-1 focus:outline-none"
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            {isSearchActive && (
              <SearchDropdown 
                searchQuery={searchQuery}
                onSelectMovie={handleMovieSelect}
              />
            )}
          </div>
          
          {/* Recommend Me Button */}
          <button 
            id="recommendBtn"
            className="flex items-center cursor-pointer px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 transition-all duration-300 text-white text-sm font-medium shadow-lg group"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Button clicked directly");
              recommendMovies();
            }}
            style={{zIndex: 100}}
          >
            <Sparkles size={18} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="group-hover:tracking-wide transition-all duration-300">
              <span className="text-red-600 font-bold">AI</span> Picks
            </span>
          </button>
        
          {/* Notification Bell */}
          <div className="relative hidden sm:block ml-2">
            <button 
              className="text-white p-1 focus:outline-none hover:text-gray-300">
              <Bell size={20} />
            </button>
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              className="flex items-center focus:outline-none"
              onClick={toggleProfileMenu}
            >
              <img
                src="https://occ-0-6247-2186.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABXYofKdCJceEP7pdxcEZ9wt80GsxEyXIbnG_QM8znksNz3JexvRbDLr0_AcNKr2SJtT-MLr1eCOA-e7xlDHsx4Jmmsi5HL8.png?r=1d4"
                alt="User Profile"
                className="w-8 h-8 rounded"
              />
              <ChevronDown 
                size={16} 
                className={`ml-1 text-white transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-black bg-opacity-95 border border-gray-800 rounded shadow-lg py-2">
                <div className="px-4 py-3 border-b border-gray-800">
                  <div className="flex items-center mb-3">
                    <img src="https://occ-0-6247-2186.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABXYofKdCJceEP7pdxcEZ9wt80GsxEyXIbnG_QM8znksNz3JexvRbDLr0_AcNKr2SJtT-MLr1eCOA-e7xlDHsx4Jmmsi5HL8.png?r=1d4" alt="Profile 1" className="w-6 h-6 rounded" />
                    <span className="ml-3 text-white text-sm">Profile 1</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <img src="/api/placeholder/24/24" alt="Profile 2" className="w-6 h-6 rounded" />
                    <span className="ml-3 text-white text-sm">Profile 2</span>
                  </div>
                  <a href="#" className="text-gray-400 hover:text-white text-sm block py-1 pl-9">Manage Profiles</a>
                </div>
                <div className="py-1">
                  <a href="#" className="px-4 py-2 text-gray-400 hover:text-white text-sm block">Account</a>
                  <a href="#" className="px-4 py-2 text-gray-400 hover:text-white text-sm block">Help Center</a>
                </div>
                <div className="border-t border-gray-800 py-1">
                  <a href="#" className="px-4 py-2 text-gray-400 hover:text-white text-sm block">Sign out of Netflix</a>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="text-white md:hidden focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-screen py-2' : 'max-h-0'
        }`}
      >
        <nav className="px-6">
          <div className="py-4 border-b border-gray-700 mb-2">
            <div className="flex items-center mb-4">
              <img src="/api/placeholder/24/24" alt="Profile 1" className="w-6 h-6 rounded" />
              <span className="ml-3 text-white text-sm">Profile 1</span>
            </div>
            <div className="flex items-center">
              <img src="/api/placeholder/24/24" alt="Profile 2" className="w-6 h-6 rounded" />
              <span className="ml-3 text-white text-sm">Profile 2</span>
            </div>
          </div>
          <ul className="flex flex-col space-y-4 py-3">
            <li><a href="#" className="text-white font-medium block py-1">Home</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white block py-1">TV Shows</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white block py-1">Movies</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white block py-1">New & Popular</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white block py-1">My List</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white block py-1">Browse by Languages</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white block py-1">Kids</a></li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <a href="#" className="text-gray-300 hover:text-white block py-2">Account</a>
            <a href="#" className="text-gray-300 hover:text-white block py-2">Help Center</a>
            <a href="#" className="text-gray-300 hover:text-white block py-2">Sign out of Netflix</a>
          </div>
        </nav>
      </div>
    </header>
  );
}