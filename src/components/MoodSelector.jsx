import React, { useState, useEffect } from 'react';
import { useMood } from '../context/MoodContext';
import { X, Volume2, Music } from 'lucide-react';

const MoodSelector = ({ onClose }) => {
  const { changeMood, moodThemes, currentMood } = useMood();
  const [hoveredMood, setHoveredMood] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Define moods based on the existing moodThemes
  const moods = Object.entries(moodThemes)
    .filter(([id]) => id !== 'default') // Exclude default mood
    .map(([id, theme]) => ({
      id,
      name: theme.name,
      icon: theme.emoji,
      colors: theme.colors
    }));

  // Create a 3x2 grid layout
  const firstRow = moods.slice(0, 3);
  const secondRow = moods.slice(3);

  // Function to handle mood selection with animation
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    
    // Trigger a custom event for mood preview
    document.dispatchEvent(new CustomEvent('moodPreview', {
      detail: { mood: mood, isPreview: false }
    }));
    
    // Small delay for cinematic effect
    setTimeout(() => {
      changeMood(mood);
      setTimeout(() => {
        handleClose();
      }, 400); // Delay closing to allow transition
    }, 600);
  };

  // Enhanced close handler to ensure scroll is restored
  const handleClose = () => {
    // Ensure body can scroll
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    
    // Call the original onClose prop
    onClose();
  };

  // Handle hover effects for mood preview
  const handleMoodHover = (mood) => {
    setHoveredMood(mood);
    
    // Trigger a custom event for mood preview
    document.dispatchEvent(new CustomEvent('moodPreview', {
      detail: { mood: mood, isPreview: true }
    }));
  };

  const handleMoodLeave = () => {
    setHoveredMood(null);
    
    // Reset preview
    document.dispatchEvent(new CustomEvent('moodPreview', {
      detail: { mood: null, isPreview: false }
    }));
  };

  // Entrance animation effect and handle scrolling
  useEffect(() => {
    // When modal opens, set animation timer
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 600);
    
    // Ensure scrolling is properly restored when component unmounts
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, []);

  // Generate dynamic gradient backgrounds based on mood colors
  const getMoodGradient = (moodId) => {
    const colors = moodThemes[moodId].colors;
    return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Cinematic backdrop with blur and darkness */}
      <div 
        className="absolute inset-0 backdrop-blur-md bg-black/70 transition-all duration-500"
        onClick={handleClose}
        style={{ 
          opacity: animationComplete ? 1 : 0 
        }}
      />
      
      {/* Netflix-style reveal animation */}
      <div 
        className="relative z-10 bg-[var(--mood-card-bg,#1f1f1f)] p-8 rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden"
        style={{ 
          transform: animationComplete ? 'scale(1)' : 'scale(0.95)',
          opacity: animationComplete ? 1 : 0,
          transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.6s ease-out',
          boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-colors duration-300"
          aria-label="Close mood selector"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        
        {/* Header with animation */}
        <div className="mb-8 text-center">
          <h2 
            className="text-[var(--mood-text,#ffffff)] text-4xl font-bold mb-3"
            style={{ 
              opacity: animationComplete ? 1 : 0,
              transform: animationComplete ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'transform 0.5s ease-out 0.2s, opacity 0.5s ease-out 0.2s',
            }}
          >
            How are you feeling today?
          </h2>
          <div 
            className="w-24 h-1 mx-auto mb-4"
            style={{ 
              background: `linear-gradient(to right, var(--mood-primary,#e50914), var(--mood-accent,#e50914))`,
              opacity: animationComplete ? 1 : 0,
              transform: animationComplete ? 'scaleX(1)' : 'scaleX(0)',
              transition: 'transform 0.6s ease-out 0.3s, opacity 0.6s ease-out 0.3s',
            }}
          />
          <p 
            className="text-[var(--mood-text,#ffffff)]/80 text-lg flex items-center justify-center gap-2"
            style={{ 
              opacity: animationComplete ? 1 : 0,
              transition: 'opacity 0.5s ease-out 0.4s',
            }}
          >
            <Volume2 className="w-5 h-5 text-[var(--mood-primary,#e50914)]" />
            Immersive sound and animations for each mood
          </p>
        </div>
        
        {/* First row of moods */}
        <div 
          className="grid grid-cols-3 gap-5 mb-5"
          style={{ 
            opacity: animationComplete ? 1 : 0,
            transform: animationComplete ? 'translateY(0)' : 'translateY(20px)',
            transition: 'transform 0.5s ease-out 0.5s, opacity 0.5s ease-out 0.5s',
          }}
        >
          {firstRow.map((mood, index) => (
            <MoodCard 
              key={mood.id}
              mood={mood}
              isActive={currentMood === mood.id}
              isHovered={hoveredMood === mood.id}
              isSelected={selectedMood === mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              onMouseEnter={() => handleMoodHover(mood.id)}
              onMouseLeave={handleMoodLeave}
              gradient={getMoodGradient(mood.id)}
              delay={0.6 + (index * 0.1)}
              animationComplete={animationComplete}
            />
          ))}
        </div>
        
        {/* Second row of moods */}
        <div 
          className="grid grid-cols-3 gap-5 mb-8"
          style={{ 
            opacity: animationComplete ? 1 : 0,
            transform: animationComplete ? 'translateY(0)' : 'translateY(20px)',
            transition: 'transform 0.5s ease-out 0.6s, opacity 0.5s ease-out 0.6s',
          }}
        >
          {secondRow.map((mood, index) => (
            <MoodCard 
              key={mood.id}
              mood={mood}
              isActive={currentMood === mood.id}
              isHovered={hoveredMood === mood.id}
              isSelected={selectedMood === mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              onMouseEnter={() => handleMoodHover(mood.id)}
              onMouseLeave={handleMoodLeave}
              gradient={getMoodGradient(mood.id)}
              delay={0.9 + (index * 0.1)}
              animationComplete={animationComplete}
            />
          ))}
        </div>
        
        {/* Music and Animation note */}
        <div 
          className="mb-6 px-3 py-2 bg-[var(--mood-primary,#e50914)]/10 rounded-lg border border-[var(--mood-primary,#e50914)]/20 flex items-center gap-3"
          style={{ 
            opacity: animationComplete ? 1 : 0,
            transition: 'opacity 0.5s ease-out 1s',
          }}
        >
          <Music className="w-6 h-6 text-[var(--mood-primary,#e50914)]" />
          <p className="text-[var(--mood-text,#ffffff)]/80 text-sm">
            Selecting a mood will activate heartbeat wave animations and play atmospheric sound for 30 seconds
          </p>
        </div>
        
        {/* Skip button */}
        <div 
          className="flex justify-center"
          style={{ 
            opacity: animationComplete ? 1 : 0,
            transition: 'opacity 0.5s ease-out 1.1s',
          }}
        >
          <button 
            onClick={handleClose}
            className="px-6 py-3 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] rounded-lg text-[var(--mood-text,#ffffff)] font-medium transition-all duration-300"
          >
            Keep current mood
          </button>
        </div>
      </div>
    </div>
  );
};

// Individual Mood Card Component
const MoodCard = ({ 
  mood, 
  isActive, 
  isHovered, 
  isSelected, 
  onClick, 
  onMouseEnter, 
  onMouseLeave,
  gradient,
  delay,
  animationComplete 
}) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative rounded-xl flex flex-col items-center justify-center p-6 overflow-hidden group"
      style={{
        background: gradient,
        transform: `scale(${isHovered ? 1.05 : 1}) ${isSelected ? 'translateY(-5px)' : ''}`,
        boxShadow: isHovered 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease-out, opacity 0.5s ease-out',
        opacity: animationComplete ? 1 : 0,
        transitionDelay: `${delay}s`,
        border: isActive ? '2px solid rgba(255, 255, 255, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Glint effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-30"
        style={{
          background: 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
          backgroundSize: '200% 200%',
          backgroundPosition: isHovered ? 'right' : 'left',
          transition: 'opacity 0.3s ease-out, background-position 0.6s ease-out',
        }}
      />
      
      {/* Sound and animation icon - only visible on hover */}
      {isHovered && (
        <div className="absolute top-2 right-2 bg-white/20 rounded-full p-1.5 animate-pulse">
          <Volume2 className="w-3 h-3 text-white" />
        </div>
      )}
      
      {/* Animated emoji */}
      <div 
        className="text-5xl mb-4 transform transition-transform duration-500"
        style={{
          transform: isHovered ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
          animation: isActive ? 'pulse 2s infinite' : 'none'
        }}
      >
        {mood.icon}
      </div>
      
      {/* Mood name */}
      <span className="text-white font-bold text-lg tracking-wide">
        {mood.name}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-2 left-0 right-0 mx-auto w-10 h-1 bg-white rounded-full"></div>
      )}
      
      {/* Selection animation */}
      {isSelected && (
        <div className="absolute inset-0 bg-white animate-pulse opacity-20 rounded-xl"></div>
      )}
    </button>
  );
};

export default MoodSelector; 