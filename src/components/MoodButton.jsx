import React, { useState, useEffect } from 'react';
import MoodModal from './MoodModal';
import { useMood, moodThemes } from '../context/MoodContext';

export default function MoodButton() {
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { currentMood, isTransitioning } = useMood();
  
  const currentTheme = moodThemes[currentMood];
  
  // Animation effect when mood changes
  useEffect(() => {
    // Listen for mood changes to trigger animations
    const handleMoodChange = () => {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 1500); // Animation duration
    };
    
    document.addEventListener('moodChange', handleMoodChange);
    
    return () => {
      document.removeEventListener('moodChange', handleMoodChange);
    };
  }, []);
  
  const toggleMoodModal = () => {
    setMoodModalOpen(!moodModalOpen);
  };
  
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  
  // Netflix-quality animation classes
  const pulseAnimation = isAnimating ? 'animate-pulse' : '';
  const scaleAnimation = isHovering ? 'scale-110' : 'scale-100';
  const glowEffect = isAnimating ? `shadow-lg shadow-[var(--mood-primary,#e50914)]/50` : '';
  
  return (
    <>
      {/* Floating Mood Button */}
      <button 
        onClick={toggleMoodModal}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed bottom-8 right-8 z-[1000] flex items-center justify-center rounded-full shadow-lg ${scaleAnimation} ${glowEffect} transition-all duration-300 hover:shadow-[var(--mood-primary,#e50914)]/30 active:scale-95 group`}
        style={{
          backgroundColor: `var(--mood-primary, #e50914)`,
          width: '60px',
          height: '60px',
          boxShadow: isAnimating 
            ? `0 0 25px var(--mood-primary, #e50914), 0 0 10px rgba(0, 0, 0, 0.3)` 
            : '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 10px var(--mood-primary, #e50914)',
          transform: isTransitioning ? 'scale(0.95) rotate(5deg)' : '',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        aria-label="Change mood"
      >
        <div className="flex flex-col items-center">
          <span 
            className={`text-3xl ${isHovering ? 'animate-pulse' : ''} ${pulseAnimation} transform transition-transform duration-500`} 
            role="img" 
            aria-label="Mood theater mask"
            style={{
              filter: isAnimating ? 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))' : 'none'
            }}
          >
            🎭
          </span>
        </div>
        
        {/* Tooltip with Netflix-style animation */}
        <div className="absolute right-full mr-3 px-3 py-1 bg-black bg-opacity-80 text-white text-sm rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 transform group-hover:translate-y-0 translate-y-1 pointer-events-none">
          Mood Settings
          <span className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-black bg-opacity-80"></span>
        </div>
        
        {/* Animated ring effect when active */}
        {isAnimating && (
          <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ 
            backgroundColor: `var(--mood-primary, #e50914)`,
            animationDuration: '1.5s',
          }}></div>
        )}
      </button>
      
      {/* Small indicator showing current mood with enhanced animations */}
      <div 
        className={`fixed bottom-24 right-8 z-[999] flex items-center justify-center rounded-full w-6 h-6 text-xs transition-all duration-300 ${isAnimating ? 'animate-bounce' : ''}`}
        style={{ 
          backgroundColor: `var(--mood-primary, #e50914)`,
          border: '2px solid white',
          boxShadow: isAnimating 
            ? `0 0 8px var(--mood-primary, #e50914), 0 0 3px rgba(255, 255, 255, 0.8)` 
            : 'none'
        }}
        title={`Current mood: ${currentTheme.name}`}
      >
        <span 
          className={`text-[10px] ${isAnimating ? 'animate-pulse' : ''}`} 
          role="img" 
          aria-hidden="true"
        >
          {currentTheme.emoji}
        </span>
      </div>
      
      {/* Mood Modal */}
      <MoodModal isOpen={moodModalOpen} onClose={() => setMoodModalOpen(false)} />
    </>
  );
} 