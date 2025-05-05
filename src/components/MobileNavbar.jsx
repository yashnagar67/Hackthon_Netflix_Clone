import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, X, ChevronDown, Home, Film, Tv2, Heart, Info, LogOut, TrendingUp, Sparkles } from 'lucide-react';
import SearchDropdown from './SearchDropdown';
import { saveClickedMovie } from '../utils/searchCache';

// Import movie data
import { dummyMovies } from '../movies/MovieData';

export default function MobileNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
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

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search if clicked outside search area
      const searchArea = document.querySelector('.mobile-search-area');
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

  // Log when menu state changes (for debugging)
  useEffect(() => {
    console.log('Mobile menu state changed to:', mobileMenuOpen);
  }, [mobileMenuOpen]);

  // Toggle mobile menu using a callback to ensure we get the latest state
  const toggleMobileMenu = (e) => {
    if (e) e.stopPropagation(); // Stop event propagation
    console.log('toggleMobileMenu clicked');
    setMobileMenuOpen(prevState => !prevState);
    
    // Close search if open
    if (isSearchActive) setIsSearchActive(false);
  };
  
  // Toggle search bar (can be activated from top or bottom navbar)
  const toggleSearch = (e) => {
    if (e) e.stopPropagation(); // Stop event propagation
    console.log('toggleSearch clicked');
    setIsSearchActive(prevState => !prevState);
    setMobileMenuOpen(false);
    
    // When activating search, focus the input after a short delay
    if (!isSearchActive) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 300);
    }
  };

  // Handle profile button click
  const handleProfileClick = (e) => {
    if (e) e.stopPropagation(); // Stop event propagation
    console.log('Profile button clicked');
    // Here you can add profile menu functionality
    // For now, let's just toggle the mobile menu as an example
    toggleMobileMenu(e);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMovieSelect = (movie) => {
    console.log('Selected movie:', movie);
    
    // Save the clicked movie to localStorage
    saveClickedMovie(movie);
    
    // Handle movie selection
    setSearchQuery('');
    setIsSearchActive(false);
    setMobileMenuOpen(false);
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const recommendMovies = () => {
    console.log('Recommend button clicked');
    
    try {
      // Step 1: Get all movies from dummyMovies object
      const allMoviesArray = Object.values(dummyMovies).flat();
      
      // Step 2: Extract all unique genres
      const allGenres = [...new Set(allMoviesArray.flatMap(movie => movie.genre))];
      
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
      
      // Step 3: Filter movies by selected genres
      const matchingMovies = allMoviesArray.filter(movie => 
        movie.genre.some(genre => selectedGenres.includes(genre))
      );
      
      // Step 4: Shuffle the matched movies
      const shuffledMovies = [...matchingMovies].sort(() => Math.random() - 0.5);
      
      // Step 5: Pick top 3-5 movies
      const numberOfRecommendations = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
      const recommendedMovies = shuffledMovies.slice(0, numberOfRecommendations);
      
      // Step 6: Display recommended movies
      const recommendationEvent = new CustomEvent('movieRecommendations', {
        bubbles: true,
        cancelable: true,
        detail: {
          movies: recommendedMovies,
          genres: selectedGenres
        }
      });
      
      // Dispatch the event on both window and document to ensure it's captured
      window.dispatchEvent(recommendationEvent);
      document.dispatchEvent(recommendationEvent);
      
      // Close menu after recommendation
      setMobileMenuOpen(false);
      
      // Scroll to recommendation section
      setTimeout(() => {
        const anchor = document.getElementById('recommendation-anchor');
        if (anchor) {
          const navbarHeight = 60; // Approximate mobile navbar height
          const yOffset = -navbarHeight;
          
          const y = anchor.getBoundingClientRect().top + window.pageYOffset + yOffset;
          
          window.scrollTo({
            top: y,
            behavior: 'smooth'
          });
        }
      }, 300);
    } catch (error) {
      console.error('Error in recommendMovies function:', error);
    }
  };

  return (
    <div className="relative">
      {/* Top Navbar */}
      <header 
        className="fixed top-0 w-[102vw] z-[80] transition-all duration-500 ease-in-out bg-gradient-to-b from-black via-black/80 to-transparent"
        style={{ padding: isScrolled ? '0.25rem 0' : '0.5rem 0' }}
      >
        <div className="w-[100vw] mx-auto px-4 flex items-center justify-between">
          {/* Left Side: Logo and Menu Toggle */}
          <div className="flex items-center">
            {/* Mobile Menu Toggle */}
            <button
              className="text-white mr-3 focus:outline-none z-[85]"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Netflix Logo */}
            <a href="/" className="flex-shrink-0">
              <svg className={`transition-all duration-500 fill-red-600 ${isScrolled ? 'w-16' : 'w-20'}`} viewBox="0 0 111 30">
                <path d="M105.06233,14.2806261 L110.999156,30 C109.249227,29.7497422 107.500234,29.4366857 105.718437,29.1554972 L102.374168,20.4686475 L98.9371075,28.4375293 C97.2499766,28.1563408 95.5928391,28.061674 93.9057081,27.8432843 L99.9372012,14.0931671 L94.4680851,-5.68434189e-14 L99.5313525,-5.68434189e-14 L102.593495,7.87421502 L105.874965,-5.68434189e-14 L110.999156,-5.68434189e-14 L105.06233,14.2806261 Z M90.4686475,-5.68434189e-14 L85.8749649,-5.68434189e-14 L85.8749649,27.2499766 C87.3746368,27.3437061 88.9371075,27.4055675 90.4686475,27.5930265 L90.4686475,-5.68434189e-14 Z M81.9055207,26.93692 C77.7186241,26.6557316 73.5307901,26.4064111 69.250164,26.3117443 L69.250164,-5.68434189e-14 L73.9366389,-5.68434189e-14 L73.9366389,21.8745899 C76.6248008,21.9373887 79.3120255,22.1557784 81.9055207,22.2804387 L81.9055207,26.93692 Z M64.2496954,10.6561065 L64.2496954,15.3435186 L57.8442216,15.3435186 L57.8442216,25.9996251 L53.2186709,25.9996251 L53.2186709,-5.68434189e-14 L66.3436123,-5.68434189e-14 L66.3436123,4.68741213 L57.8442216,4.68741213 L57.8442216,10.6561065 L64.2496954,10.6561065 Z M45.3435186,4.68741213 L45.3435186,26.2498828 C43.7810479,26.2498828 42.1876465,26.2498828 40.6561065,26.3117443 L40.6561065,4.68741213 L35.8121661,4.68741213 L35.8121661,-5.68434189e-14 L50.2183897,-5.68434189e-14 L50.2183897,4.68741213 L45.3435186,4.68741213 Z M30.749836,15.5928391 C28.687787,15.5928391 26.2498828,15.5928391 24.4999531,15.6875059 L24.4999531,22.6562939 C27.2499766,22.4678976 30,22.2495079 32.7809542,22.1557784 L32.7809542,26.6557316 L19.812541,27.6876933 L19.812541,-5.68434189e-14 L32.7809542,-5.68434189e-14 L32.7809542,4.68741213 L24.4999531,4.68741213 L24.4999531,10.9991564 C26.3126816,10.9991564 29.0936358,10.9054269 30.749836,10.9054269 L30.749836,15.5928391 Z M4.78114163,12.9684132 L4.78114163,29.3429562 C3.09401069,29.5313525 1.59340144,29.7497422 0,30 L0,-5.68434189e-14 L4.4690224,-5.68434189e-14 L10.562377,17.0315868 L10.562377,-5.68434189e-14 L15.2497891,-5.68434189e-14 L15.2497891,28.061674 C13.5935889,28.3437998 11.906458,28.4375293 10.1246602,28.6868498 L4.78114163,12.9684132 Z"></path>
              </svg>
            </a>
          </div>
          
          {/* Right Section: Profile and Search */}
          <div className="flex items-center">
            {/* Search Bar Area */}
            <div className="relative mobile-search-area mr-3" ref={searchContainerRef}>
              <div 
                className={`flex items-center overflow-hidden transition-all duration-300 bg-gray-900/80 rounded ${
                  isSearchActive ? 'w-44 opacity-100 border border-gray-700' : 'w-0 opacity-0 border-0'
                }`}
              >
                {isSearchActive && (
                  <>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-transparent text-white text-sm w-full px-2 py-1.5 focus:outline-none"
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <button 
                      className="p-1.5 text-gray-400 hover:text-white"
                      onClick={() => {
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                    >
                      {searchQuery ? <X size={16} /> : <Search size={16} />}
                    </button>
                  </>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {isSearchActive && searchQuery && (
                <div className="absolute top-full right-0 mt-1 w-64 z-[95]">
                  <SearchDropdown
                    searchQuery={searchQuery}
                    onSelectMovie={handleMovieSelect}
                    isMobile={true}
                  />
                </div>
              )}
            </div>
            
            {/* Profile Button */}
            <button
              onClick={handleProfileClick}
              className="relative focus:outline-none z-[85]"
            >
              <img
                src="https://occ-0-6247-2186.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABXYofKdCJceEP7pdxcEZ9wt80GsxEyXIbnG_QM8znksNz3JexvRbDLr0_AcNKr2SJtT-MLr1eCOA-e7xlDHsx4Jmmsi5HL8.png?r=1d4"
                alt="User Profile"
                className="w-7 h-7 rounded cursor-pointer"
              />
            </button>
          </div>
        </div>
      </header>
      
      {/* Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 w-[102vw] bg-gradient-to-t from-black via-black/95 to-black/80 z-40 border-t border-gray-800">
        <div className="flex items-center justify-around px-2 py-3">
          {/* Home Icon */}
          <a href="#" className="flex flex-col items-center text-gray-400 hover:text-white transition-colors">
            <Home size={22} />
            <span className="text-xs mt-1">Home</span>
          </a>
          
          {/* Trending Icon */}
          <a href="#" className="flex flex-col items-center text-gray-400 hover:text-white transition-colors">
            <TrendingUp size={22} />
            <span className="text-xs mt-1">Trending</span>
          </a>
          
          {/* Search */}
          <button 
            onClick={toggleSearch}
            className={`flex flex-col items-center transition-colors focus:outline-none z-[85] ${isSearchActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Search size={22} />
            <span className="text-xs mt-1">Search</span>
          </button>
          
          {/* TV Shows */}
          <a href="#" className="flex flex-col items-center text-gray-400 hover:text-white transition-colors">
            <Tv2 size={22} />
            <span className="text-xs mt-1">TV Shows</span>
          </a>
          
          {/* AI Recommend */}
          <button 
            onClick={recommendMovies}
            className="flex flex-col items-center text-red-500 hover:text-red-400 transition-colors"
          >
            <Sparkles size={22} />
            <span className="text-xs mt-1">AI Picks</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Slide-in Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-black bg-opacity-95 transform transition-transform duration-300 ease-in-out z-[100] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Menu Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-bold">Menu</h2>
              <button 
                onClick={toggleMobileMenu}
                className="text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Profile Selection */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center p-2 bg-gray-900 rounded-md">
                <img 
                  src="https://occ-0-6247-2186.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABXYofKdCJceEP7pdxcEZ9wt80GsxEyXIbnG_QM8znksNz3JexvRbDLr0_AcNKr2SJtT-MLr1eCOA-e7xlDHsx4Jmmsi5HL8.png?r=1d4" 
                  alt="Profile 1" 
                  className="w-8 h-8 rounded"
                />
                <span className="ml-3 text-white">Profile 1</span>
              </div>
              <div className="flex items-center p-2 hover:bg-gray-900 rounded-md">
                <img 
                  src="/api/placeholder/32/32" 
                  alt="Profile 2" 
                  className="w-8 h-8 rounded"
                />
                <span className="ml-3 text-gray-300">Profile 2</span>
              </div>
              <div className="mt-2">
                <a href="#" className="text-gray-400 hover:text-white text-sm flex items-center">
                  <span className="mr-2">+</span> Manage Profiles
                </a>
              </div>
            </div>
          </div>
          
          {/* Menu Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
            <div className="px-4">
              {/* Main Menu Items */}
              <ul className="space-y-3">
                <li>
                  <a href="#" className="flex items-center text-white py-2">
                    <Home size={18} className="mr-3" />
                    <span>Home</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-gray-300 hover:text-white py-2">
                    <TrendingUp size={18} className="mr-3" />
                    <span>Trending Now</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-gray-300 hover:text-white py-2">
                    <Tv2 size={18} className="mr-3" />
                    <span>TV Shows</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-gray-300 hover:text-white py-2">
                    <Film size={18} className="mr-3" />
                    <span>Movies</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-gray-300 hover:text-white py-2">
                    <Heart size={18} className="mr-3" />
                    <span>My List</span>
                  </a>
                </li>
              </ul>
              
              {/* AI Recommendation Button */}
              <div className="my-4">
                <button 
                  className="w-full flex items-center justify-center px-3 py-2.5 rounded-md bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 transition-all duration-300 text-white font-medium shadow-lg"
                  onClick={recommendMovies}
                >
                  <Sparkles size={20} className="mr-2" />
                  <span className="flex items-center">
                    <span className="text-red-400 font-bold mr-1">AI</span> Picks
                  </span>
                </button>
              </div>
              
              {/* Categories Accordion */}
              <div className="mt-4 border-t border-gray-800 pt-4">
                <h3 className="text-gray-500 uppercase text-xs tracking-wider mb-3">Categories</h3>
                
                {/* Browse by Genre - Collapsible */}
                <div className="mb-2">
                  <button 
                    className="flex items-center justify-between w-full text-gray-300 hover:text-white py-2"
                    onClick={() => toggleCategory('genres')}
                  >
                    <span>Browse by Genre</span>
                    <ChevronDown 
                      size={16}
                      className={`transition-transform duration-200 ${expandedCategories.genres ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {expandedCategories.genres && (
                    <div className="ml-4 mt-1 space-y-2">
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">Action</a>
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">Comedy</a>
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">Drama</a>
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">Horror</a>
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">Sci-Fi</a>
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">Thriller</a>
                    </div>
                  )}
                </div>
                
                {/* Browse by Language - Collapsible */}
                <div className="mb-2">
                  <button 
                    className="flex items-center justify-between w-full text-gray-300 hover:text-white py-2"
                    onClick={() => toggleCategory('languages')}
                  >
                    <span>Browse by Language</span>
                    <ChevronDown 
                      size={16}
                      className={`transition-transform duration-200 ${expandedCategories.languages ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {expandedCategories.languages && (
                    <div className="ml-4 mt-1 space-y-2">
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">English</a>
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">Spanish</a>
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">Hindi</a>
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">Korean</a>
                      <a href="#" className="block text-gray-400 hover:text-white text-sm py-1">Japanese</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>
          
          {/* Menu Footer */}
          <div className="mt-auto border-t border-gray-800 p-4">
            <div className="flex flex-col space-y-3">
              <a href="#" className="text-gray-400 hover:text-white flex items-center">
                <Info size={16} className="mr-3" />
                <span>Account</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white flex items-center">
                <LogOut size={16} className="mr-3" />
                <span>Sign out of Netflix</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay when menu is open */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-[90]"
          onClick={toggleMobileMenu}
        ></div>
      )}
      
      {/* Add padding to the bottom of the page to account for the bottom navbar */}
      <div className="h-16"></div>
    </div>
  );
}