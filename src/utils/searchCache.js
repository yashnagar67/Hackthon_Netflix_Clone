/**
 * Search cache utility functions
 * Handles caching and retrieving search queries and popular movies
 */

const POPULAR_MOVIES_KEY = 'popularMovies';
const SEARCH_CACHE_KEY = 'searchQueryCache';
const CLICKED_MOVIES_KEY = 'clickedMovies';
const POPULAR_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const SEARCH_CACHE_EXPIRY = 2 * 60 * 60 * 1000; // 2 hours
const CLICKED_MOVIES_MAX = 15; // Maximum number of clicked movies to store

// Get popular movies from cache
export const getPopularMoviesFromCache = () => {
  try {
    const cachedPopular = localStorage.getItem(POPULAR_MOVIES_KEY);
    if (cachedPopular) {
      const { data, timestamp } = JSON.parse(cachedPopular);
      // Check if cache is still valid
      if (Date.now() - timestamp < POPULAR_CACHE_EXPIRY) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error retrieving popular movies from cache:', error);
    return null;
  }
};

// Cache popular movies
export const cachePopularMovies = (movies) => {
  try {
    localStorage.setItem(POPULAR_MOVIES_KEY, JSON.stringify({
      data: movies,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error caching popular movies:', error);
  }
};

// Get search query results from cache with prefix matching
export const getSearchResultsFromCache = (query) => {
  try {
    const cacheString = localStorage.getItem(SEARCH_CACHE_KEY);
    if (!cacheString) return null;
    
    const cache = JSON.parse(cacheString);
    const normalizedQuery = query.toLowerCase();
    
    // First try exact match
    if (cache[normalizedQuery]) {
      const { data, timestamp } = cache[normalizedQuery];
      // Check if cache is still valid
      if (Date.now() - timestamp < SEARCH_CACHE_EXPIRY) {
        return data;
      }
    }
    
    // If no exact match, try to find a cached query that starts with the current query
    // For example, if user types "pushp", check if we have cached results for "pushpa"
    const cachedQueries = Object.keys(cache);
    for (const cachedQuery of cachedQueries) {
      if (cachedQuery.startsWith(normalizedQuery) && cachedQuery !== normalizedQuery) {
        const { data, timestamp } = cache[cachedQuery];
        // Check if cache is still valid
        if (Date.now() - timestamp < SEARCH_CACHE_EXPIRY) {
          return data;
        }
      }
    }
    
    // If still no match, try to find if current query is a prefix of a cached query
    // For example, if user typed "pushpa 2" before and now types "push"
    for (const cachedQuery of cachedQueries) {
      if (normalizedQuery.length >= 3 && cachedQuery.startsWith(normalizedQuery)) {
        const { data, timestamp } = cache[cachedQuery];
        // Check if cache is still valid
        if (Date.now() - timestamp < SEARCH_CACHE_EXPIRY) {
          return data;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving search results from cache:', error);
    return null;
  }
};

// Cache search query results
export const cacheSearchResults = (query, results) => {
  try {
    const normalizedQuery = query.toLowerCase();
    let cache = {};
    
    // Get existing cache
    const cacheString = localStorage.getItem(SEARCH_CACHE_KEY);
    if (cacheString) {
      cache = JSON.parse(cacheString);
    }
    
    // Update cache with new results
    cache[normalizedQuery] = {
      data: results,
      timestamp: Date.now()
    };
    
    // Prune cache if it gets too large (keep only 20 most recent entries)
    const entries = Object.entries(cache);
    if (entries.length > 20) {
      const sortedEntries = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      cache = Object.fromEntries(sortedEntries.slice(0, 20));
    }
    
    localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching search results:', error);
  }
};

// Filter popular movies by query
export const filterPopularMovies = (popularMovies, query) => {
  if (!query.trim() || !popularMovies?.length) return [];
  
  const normalizedQuery = query.toLowerCase();
  return popularMovies.filter(movie => 
    movie.title.toLowerCase().includes(normalizedQuery) ||
    (movie.original_title && movie.original_title.toLowerCase().includes(normalizedQuery))
  );
};

// Save a clicked movie to localStorage
export const saveClickedMovie = (movie) => {
  try {
    console.log('Saving movie to localStorage:', movie.title);
    
    let clickedMovies = [];
    const storedMovies = localStorage.getItem(CLICKED_MOVIES_KEY);
    
    if (storedMovies) {
      clickedMovies = JSON.parse(storedMovies);
      console.log('Existing movies count:', clickedMovies.length);
      
      // Remove the movie if it already exists to avoid duplicates
      const existingIndex = clickedMovies.findIndex(m => m.id === movie.id);
      if (existingIndex !== -1) {
        console.log('Movie already exists in localStorage, moving to top');
        clickedMovies.splice(existingIndex, 1);
      }
    }
    
    // Add movie to the beginning of the array (most recent first)
    clickedMovies.unshift({
      ...movie,
      clickedAt: Date.now() // Add timestamp for sorting/filtering
    });
    
    // Limit the number of stored movies
    if (clickedMovies.length > CLICKED_MOVIES_MAX) {
      console.log(`Limiting saved movies to ${CLICKED_MOVIES_MAX}`);
      clickedMovies = clickedMovies.slice(0, CLICKED_MOVIES_MAX);
    }
    
    localStorage.setItem(CLICKED_MOVIES_KEY, JSON.stringify(clickedMovies));
    console.log('Successfully saved movie to localStorage');
  } catch (error) {
    console.error('Error saving clicked movie:', error);
  }
};

// Get clicked/selected movies from localStorage
export const getClickedMovies = () => {
  try {
    const storedMovies = localStorage.getItem(CLICKED_MOVIES_KEY);
    if (storedMovies) {
      return JSON.parse(storedMovies);
    }
    return [];
  } catch (error) {
    console.error('Error retrieving clicked movies:', error);
    return [];
  }
};

// Search within clicked movies based on prefix
export const searchClickedMovies = (query) => {
  try {
    if (!query || query.length < 1) return [];
    
    const clickedMovies = getClickedMovies();
    if (!clickedMovies.length) return [];
    
    const normalizedQuery = query.toLowerCase();
    return clickedMovies.filter(movie => 
      movie.title?.toLowerCase().includes(normalizedQuery) ||
      (movie.original_title && movie.original_title.toLowerCase().includes(normalizedQuery))
    );
  } catch (error) {
    console.error('Error searching clicked movies:', error);
    return [];
  }
}; 