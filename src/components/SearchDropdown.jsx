import React, { useState, useEffect, useRef } from 'react';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../config/tmdb';
import MovieSuggestionCard from './MovieSuggestionCard';

const SearchDropdown = ({ searchQuery, onSelectMovie }) => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const searchMovies = async () => {
      if (!searchQuery.trim()) {
        setMovies([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setMovies(data.results.slice(0, 5)); // Limit to 5 results
      } catch (error) {
        console.error('Error searching movies:', error);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (!searchQuery.trim() || movies.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 w-full max-w-4xl bg-black/95 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-[1000]"
      style={{
        maxHeight: '300px',
        overflowY: 'auto',
      }}
    >
      {isLoading ? (
        <div className="p-4 text-white text-center">Loading...</div>
      ) : (
        <div className="divide-y divide-gray-800">
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