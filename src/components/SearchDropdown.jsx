import React, { useState, useEffect, useRef } from 'react';
import MovieSuggestionCard from './MovieSuggestionCard';
import { 
  getPopularMoviesFromCache, 
  cachePopularMovies, 
  getSearchResultsFromCache, 
  cacheSearchResults, 
  filterPopularMovies,
  searchClickedMovies 
} from '../utils/searchCache';

// API base URL (local backend)
const API_BASE_URL = 'http://localhost:5000/api/search';

const SearchDropdown = ({ searchQuery, onSelectMovie }) => {
  const [movies, setMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [clickedMovies, setClickedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [isApiSearching, setIsApiSearching] = useState(false);
  const [resultSource, setResultSource] = useState(''); // 'clicked', 'popular', 'cache', 'api'
  const dropdownRef = useRef(null);
  const apiCallTimeout = useRef(null);

  // Fetch popular and clicked movies on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get clicked movies from localStorage
        const clickedResults = searchClickedMovies('');
        setClickedMovies(clickedResults);
        
        // First check if we have popular movies cached
        const cachedPopular = getPopularMoviesFromCache();
        if (cachedPopular) {
          setPopularMovies(cachedPopular);
          return;
        }

        // Fetch from backend API if not cached or cache expired
        const response = await fetch(`${API_BASE_URL}/popular`);
        if (!response.ok) {
          throw new Error(`Failed to fetch popular movies: ${response.status}`);
        }
        
        const data = await response.json();
        const results = data.results.slice(0, 20); // Store top 20 popular movies
        setPopularMovies(results);
        
        // Cache the results
        cachePopularMovies(results);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Main search effect
  useEffect(() => {
    // Clear previous timeout
    if (apiCallTimeout.current) {
      clearTimeout(apiCallTimeout.current);
    }

    const searchMovies = async () => {
      const query = searchQuery.trim();
      
      if (!query) {
        setMovies([]);
        setNoResults(false);
        setIsApiSearching(false);
        return;
      }

      // Step 1: Check clicked movies first (highest priority, personal to user)
      const userClickedResults = searchClickedMovies(query);
      if (userClickedResults.length > 0) {
        console.log(`Found ${userClickedResults.length} results from your click history:`, 
          userClickedResults.map(m => m.title).join(', '));
        setMovies(userClickedResults);
        setNoResults(false);
        setResultSource('clicked');
        return; // Stop here if we have clicked matches
      }

      // Step 2: Show local popular movie results
      const localResults = filterPopularMovies(popularMovies, query);
      if (localResults.length > 0) {
        setMovies(localResults);
        setNoResults(false);
        setResultSource('popular');
      }

      // Step 3: Check in-memory cache (with prefix matching)
      const cachedResults = getSearchResultsFromCache(query);
      if (cachedResults) {
        console.log(`Using cached results for query similar to: ${query}`);
        setMovies(cachedResults);
        setNoResults(cachedResults.length === 0);
        setResultSource('cache');
        // Still show "from cache" indicator
        setIsApiSearching(false);
        return;
      }

      // Only make API call if query is at least 2 characters
      if (query.length < 2) {
        setIsApiSearching(false);
        return;
      }

      // Last step: Call API with debounce
      setIsApiSearching(true);
      
      apiCallTimeout.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          
          // Use our backend API instead of direct TMDB call
          const response = await fetch(`${API_BASE_URL}/movies?query=${encodeURIComponent(query)}`);
          
          if (!response.ok) {
            throw new Error(`Search API error: ${response.status}`);
          }
          
          const data = await response.json();
          const results = data.results.slice(0, 8); // Show up to 8 results
          
          // Cache the API results
          cacheSearchResults(query, results);
          
          setMovies(results);
          setNoResults(results.length === 0);
          setResultSource('api');
        } catch (error) {
          console.error('Error searching movies:', error);
          setNoResults(true);
        } finally {
          setIsLoading(false);
          setIsApiSearching(false);
        }
      }, 300); // 300ms debounce
    };

    searchMovies();

    return () => {
      if (apiCallTimeout.current) {
        clearTimeout(apiCallTimeout.current);
      }
    };
  }, [searchQuery, popularMovies, clickedMovies]);

  // Don't display anything if there's no search query
  if (!searchQuery.trim()) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 w-full max-w-4xl bg-black/0 rounded-lg scrollbar-hide overflow-hidden z-[1000] shadow-2xl border border-gray-800"
      style={{
        maxHeight: '70vh',
        overflowY: 'auto',
      }}
    >
      {/* Show "Searching..." loader when API is being called */}
      {isApiSearching && (
        <div className="p-2 text-gray-400 text-xs text-center flex items-center justify-center space-x-2">
          <div className="loader w-3 h-3 rounded-full border-2 border-gray-800 border-t-red-500 animate-spin"></div>
          <span>Searching movies...</span>
        </div>
      )}
      
      {/* Show "No results" when appropriate */}
      {noResults && !isLoading && (
        <div className="p-6 text-white text-center">
          <p className="mb-1">No results found for "{searchQuery}"</p>
          <p className="text-gray-400 text-sm">Try a different search term</p>
        </div>
      )}
      
      {/* Display search results */}
      {movies.length > 0 && (
        <div className="divide-y divide-gray-800">
          {movies.length > 0 && (
            <div className="p-2 bg-gray-900/50 text-xs text-gray-400">
              {movies.length === 1 ? '1 result' : `${movies.length} results`} 
              {resultSource === 'clicked' ? ' from your history' :
               resultSource === 'popular' ? ' from popular movies' : 
               resultSource === 'cache' ? ' from cache' : 
               isApiSearching ? ' (updating...)' : ' from search'}
            </div>
          )}
          
          {movies.map((movie) => (
            <MovieSuggestionCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown; 