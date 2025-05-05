import { useState, useEffect } from 'react';

/**
 * Custom hook to check if the window matches the given media query
 * @param {string} query - Media query string e.g. '(min-width: 768px)'
 * @returns {boolean} - Returns true if the media query matches
 */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Initial check
    setMatches(mediaQuery.matches);
    
    // Event listener for changes
    const handler = (event) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handler);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

export default useMediaQuery; 