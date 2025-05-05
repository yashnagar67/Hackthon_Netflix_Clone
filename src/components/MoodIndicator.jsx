import React, { useEffect } from 'react';
import { useMood, moodThemes } from '../context/MoodContext';

export default function MoodIndicator() {
  const { currentMood, showMoodIndicator, setShowMoodIndicator } = useMood();
  
  // Auto-hide the indicator after 3 seconds
  useEffect(() => {
    let timer;
    
    if (showMoodIndicator) {
      timer = setTimeout(() => {
        setShowMoodIndicator(false);
      }, 3000);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [showMoodIndicator, setShowMoodIndicator]);
  
  if (!showMoodIndicator) return null;
  
  const theme = moodThemes[currentMood];
  
  return (
    <div 
      className="fixed bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2 bg-[var(--mood-secondary,#141414)] z-[1500] rounded-full shadow-xl flex items-center px-5 py-3 transition-all duration-500 animate-fade-in"
      style={{ 
        border: `2px solid var(--mood-primary, #e50914)`,
        boxShadow: `0 4px 20px var(--mood-primary, #e50914), 0 0 10px rgba(0,0,0,0.6)`,
        animation: 'scaleIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1), fadeIn 400ms ease'
      }}
    >
      {/* Animated blob background */}
      <div 
        className="absolute inset-0 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, var(--mood-primary, #e50914) 0%, transparent 70%)`,
          filter: 'blur(8px)',
          animation: 'pulse 2s infinite alternate'
        }}
      />
      
      <span className="text-2xl mr-3 animate-bounce" aria-hidden="true">{theme.emoji}</span>
      <div className="flex flex-col items-start">
        <span className="font-bold text-[var(--mood-primary,#e50914)] text-sm mb-0.5">MOOD ACTIVATED</span>
        <span className="font-medium text-white">
          {theme.name} Mode
        </span>
      </div>
      
      {/* Radiating ring animation */}
      <div className="absolute -inset-1 rounded-full opacity-30 animate-ping" style={{ 
        border: `2px solid var(--mood-primary, #e50914)`,
        animationDuration: '1.5s'
      }}></div>
    </div>
  );
} 