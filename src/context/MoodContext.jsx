import { createContext, useState, useEffect, useContext, useRef } from 'react';

// Define mood themes with their colors and properties
export const moodThemes = {
  default: {
    name: 'Default',
    emoji: '🎬',
    // Netflix default colors
    colors: {
      primary: '#e50914',
      secondary: '#141414',
      background: '#141414',
      text: '#ffffff',
      cardBg: '#1f1f1f',
      buttonBg: '#e50914',
      buttonText: '#ffffff',
      accent: '#e50914',
      hover: '#b20710',
    },
    animation: null,
    sound: '/sounds/default.mp3'
  },
  happy: {
    name: 'Happy',
    emoji: '😀',
    colors: {
      primary: '#FFD700',
      secondary: '#292929',
      background: '#222222',
      text: '#ffffff',
      cardBg: '#333333',
      buttonBg: '#FFD700',
      buttonText: '#222222',
      accent: '#FFA500',
      hover: '#F0C000',
    },
    animation: 'happy-bg',
    sound: '/sounds/happy.mp3'
  },
  sad: {
    name: 'Sad',
    emoji: '😢',
    colors: {
      primary: '#4682B4',
      secondary: '#1E2938',
      background: '#1A1A25',
      text: '#d0d0d0',
      cardBg: '#252836',
      buttonBg: '#4682B4',
      buttonText: '#ffffff',
      accent: '#5F9EA0',
      hover: '#386890',
    },
    animation: 'rain-bg',
    sound: '/sounds/sad.mp3'
  },
  excited: {
    name: 'Excited',
    emoji: '🤩',
    colors: {
      primary: '#FF1493',
      secondary: '#191433',
      background: '#13102D',
      text: '#ffffff',
      cardBg: '#291D5A',
      buttonBg: '#FF1493',
      buttonText: '#ffffff',
      accent: '#9370DB',
      hover: '#D10075',
    },
    animation: 'sparkle-bg',
    sound: '/sounds/excited.mp3'
  },
  calm: {
    name: 'Calm',
    emoji: '😴',
    colors: {
      primary: '#5F9EA0',
      secondary: '#1D2A32',
      background: '#1A252D',
      text: '#E0E7E9',
      cardBg: '#2A3B44',
      buttonBg: '#5F9EA0',
      buttonText: '#ffffff',
      accent: '#80A4AD',
      hover: '#4A7F80',
    },
    animation: 'calm-bg',
    sound: '/sounds/calm.mp3'
  },
  angry: {
    name: 'Angry',
    emoji: '😡',
    colors: {
      primary: '#FF4500',
      secondary: '#2D1A1A',
      background: '#240F0F',
      text: '#ffffff',
      cardBg: '#3D1C1C',
      buttonBg: '#FF4500',
      buttonText: '#ffffff',
      accent: '#A52A2A',
      hover: '#CC3700',
    },
    animation: 'flame-bg',
    sound: '/sounds/angry.mp3'
  },
  party: {
    name: 'Party',
    emoji: '🎉',
    colors: {
      primary: '#FF00FF',
      secondary: '#21053D',
      background: '#16082B',
      text: '#ffffff',
      cardBg: '#31075A',
      buttonBg: '#FF00FF',
      buttonText: '#ffffff',
      accent: '#00FFFF',
      hover: '#CC00CC',
    },
    animation: 'confetti-bg',
    sound: '/sounds/party.mp3'
  }
};

// Create the context
const MoodContext = createContext();

export const MoodProvider = ({ children }) => {
  // Try to get the saved mood from localStorage, default to 'default'
  const [currentMood, setCurrentMood] = useState(() => {
    const savedMood = localStorage.getItem('netflixMood');
    return savedMood ? savedMood : 'default';
  });
  
  const [previewMood, setPreviewMood] = useState(null);
  const [showMoodIndicator, setShowMoodIndicator] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isWaveAnimating, setIsWaveAnimating] = useState(false);
  const audioRef = useRef(null);
  
  // Listen for mood preview events (hover effects)
  useEffect(() => {
    const handleMoodPreview = (event) => {
      const { mood, isPreview } = event.detail;
      
      if (isPreview) {
        setPreviewMood(mood);
      } else {
        setPreviewMood(null);
      }
    };
    
    document.addEventListener('moodPreview', handleMoodPreview);
    
    return () => {
      document.removeEventListener('moodPreview', handleMoodPreview);
    };
  }, []);
  
  // Function to play mood sound
  const playMoodSound = (mood) => {
    if (!mood) return;
    
    const soundUrl = moodThemes[mood].sound;
    
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    // Stop any currently playing audio
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    
    // Set new source and play
    audioRef.current.src = soundUrl;
    audioRef.current.volume = 0.4; // Set appropriate volume
    
    // Play sound with a promise to handle autoplay restrictions
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Set timeout to stop sound after 30 seconds
          setTimeout(() => {
            if (audioRef.current) {
              // Fade out the audio over 2 seconds
              const fadeInterval = setInterval(() => {
                if (audioRef.current.volume > 0.05) {
                  audioRef.current.volume -= 0.05;
                } else {
                  audioRef.current.pause();
                  clearInterval(fadeInterval);
                }
              }, 100);
            }
          }, 28000); // 28 seconds + 2 second fade = 30 seconds total
        })
        .catch(error => {
          // Autoplay might be blocked
          console.log("Audio playback blocked: ", error);
        });
    }
  };
  
  // Function to change the mood with cinematic transition
  const changeMood = (mood) => {
    if (mood === currentMood) return;
    
    // Begin transition
    setIsTransitioning(true);
    setIsWaveAnimating(true);
    
    // Add animation class to body for CSS targeting
    document.body.classList.add('has-mood-animation');
    
    // Ensure page remains scrollable
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    
    // Add a slight delay before changing the mood (for cinematic feel)
    setTimeout(() => {
      // Store mood in localStorage for persistence
      localStorage.setItem('netflixMood', mood);
      
      // Play mood sound
      playMoodSound(mood);
      
      // Dispatch custom event for other components to listen for
      const moodChangeEvent = new CustomEvent('moodChange', {
        detail: { mood, previousMood: currentMood }
      });
      document.dispatchEvent(moodChangeEvent);
      
      // Update state
      setCurrentMood(mood);
      
      // End transition after colors have changed
      setTimeout(() => {
        setIsTransitioning(false);
        
        // Show mood indicator
        setShowMoodIndicator(true);
        
        // Hide mood indicator after 3 seconds
        setTimeout(() => {
          setShowMoodIndicator(false);
        }, 3000);
        
        // End wave animation after 30 seconds
        setTimeout(() => {
          setIsWaveAnimating(false);
          
          // Remove animation class from body
          document.body.classList.remove('has-mood-animation');
          
          // Ensure scrolling is enabled after animation ends
          document.body.style.overflow = 'auto';
          document.body.style.height = 'auto';
        }, 30000);
      }, 300); // Match this timing with CSS transition duration
    }, 100);
  };
  
  // Apply CSS variables when mood or previewMood changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Determine which mood to apply (preview or current)
    const activeMood = previewMood || currentMood;
    const theme = moodThemes[activeMood].colors;
    
    // Apply CSS variables to the root element
    root.style.setProperty('--mood-primary', theme.primary);
    root.style.setProperty('--mood-secondary', theme.secondary);
    root.style.setProperty('--mood-background', theme.background);
    root.style.setProperty('--mood-text', theme.text);
    root.style.setProperty('--mood-card-bg', theme.cardBg);
    root.style.setProperty('--mood-button-bg', theme.buttonBg);
    root.style.setProperty('--mood-button-text', theme.buttonText);
    root.style.setProperty('--mood-accent', theme.accent);
    root.style.setProperty('--mood-hover', theme.hover);
    
    // Only apply permanent class changes if not in preview mode
    if (!previewMood) {
      // First remove all mood classes
      const moodClasses = Object.keys(moodThemes).map(key => `mood-${key}`);
      document.body.classList.remove(...moodClasses);
      
      // Add current mood class
      document.body.classList.add(`mood-${currentMood}`);
      
      // Apply background animation class
      document.body.className = document.body.className.replace(/\b\w+-bg\b/g, '').trim();
      if (moodThemes[currentMood].animation) {
        document.body.classList.add(moodThemes[currentMood].animation);
      }
      
      // Also set the background color directly
      document.body.style.backgroundColor = theme.background;
    }
    
  }, [currentMood, previewMood]);
  
  return (
    <MoodContext.Provider value={{ 
      currentMood, 
      changeMood, 
      moodThemes, 
      showMoodIndicator, 
      setShowMoodIndicator,
      isTransitioning,
      previewMood,
      isWaveAnimating
    }}>
      {/* Add overlay for cinematic transitions */}
      {isTransitioning && (
        <div 
          className="fixed inset-0 bg-black z-[9999] pointer-events-none transition-opacity duration-300"
          style={{ opacity: 0.5 }}
        />
      )}
      
      {/* Add mood wave animation */}
      {isWaveAnimating && (
        <MoodWaveAnimation mood={currentMood} />
      )}
      
      {children}
    </MoodContext.Provider>
  );
};

// Wave animation component
const MoodWaveAnimation = ({ mood }) => {
  const theme = moodThemes[mood]?.colors || moodThemes.default.colors;
  
  // Get colors for waves
  const primary = theme.primary;
  const accent = theme.accent;
  const secondary = theme.secondary;
  
  // Ensure body can scroll when component mounts
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    
    // Cleanup function to ensure scrolling is enabled
    return () => {
      document.body.classList.remove('has-mood-animation');
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, []);
  
  return (
    <div className="fixed-animation-container mood-wave-container">
      {/* Top waves */}
      <div 
        className="absolute top-0 left-0 right-0 h-full overflow-hidden opacity-60 animate-fadeOut pointer-events-none"
        style={{ animation: 'fadeOut 30s forwards' }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-[300px] w-[200%] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${primary}33, transparent)`,
            animation: 'waveMotion 12s infinite linear',
            transform: 'translateX(-50%)'
          }}
        />
        <div 
          className="absolute top-[100px] left-0 right-0 h-[250px] w-[200%] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}22, transparent)`,
            animation: 'waveMotion 8s infinite linear',
            animationDelay: '0.5s',
            transform: 'translateX(-30%)'
          }}
        />
      </div>
      
      {/* Bottom waves */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-full overflow-hidden opacity-60 animate-fadeOut pointer-events-none"
        style={{ animation: 'fadeOut 30s forwards' }}
      >
        <div 
          className="absolute bottom-0 left-0 right-0 h-[300px] w-[200%] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${primary}33, transparent)`,
            animation: 'waveMotion 10s infinite linear reverse',
            transform: 'translateX(-20%)'
          }}
        />
        <div 
          className="absolute bottom-[120px] left-0 right-0 h-[200px] w-[200%] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}22, transparent)`,
            animation: 'waveMotion 15s infinite linear reverse',
            animationDelay: '1s',
            transform: 'translateX(-70%)'
          }}
        />
      </div>
      
      {/* Heartbeat pulses */}
      <div className="absolute inset-0 pointer-events-none heartbeat-pulse">
        {/* Large heartbeat pulse */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ animation: 'fadeOut 30s forwards' }}
        >
          <div 
            className="w-[400px] h-[400px] rounded-full opacity-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${primary}40 0%, transparent 70%)`,
              animation: 'heartbeatPulse 3s ease-in-out infinite',
            }}
          />
        </div>
        
        {/* Medium heartbeats across screen */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute top-1/4 left-1/4 pointer-events-none">
            <div 
              className="w-[200px] h-[200px] rounded-full opacity-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
                animation: 'heartbeatPulse 4s ease-in-out infinite',
                animationDelay: '0.5s'
              }}
            />
          </div>
          <div className="absolute bottom-1/4 right-1/4 pointer-events-none">
            <div 
              className="w-[200px] h-[200px] rounded-full opacity-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
                animation: 'heartbeatPulse 4s ease-in-out infinite',
                animationDelay: '1.5s'
              }}
            />
          </div>
        </div>
        
        {/* Small heartbeats */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/3 pointer-events-none">
            <div 
              className="w-[100px] h-[100px] rounded-full opacity-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${primary}50 0%, transparent 70%)`,
                animation: 'heartbeatPulse 2.5s ease-in-out infinite',
                animationDelay: '1s'
              }}
            />
          </div>
          <div className="absolute bottom-1/3 left-1/3 pointer-events-none">
            <div 
              className="w-[100px] h-[100px] rounded-full opacity-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${primary}50 0%, transparent 70%)`,
                animation: 'heartbeatPulse 2.5s ease-in-out infinite',
                animationDelay: '2s'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Particles based on mood */}
      <div className="absolute inset-0 pointer-events-none mood-animation-container">
        <div 
          className="w-full h-full pointer-events-none"
          style={{
            background: mood === 'happy' ? 'radial-gradient(circle at 50% 50%, transparent 90%, var(--mood-primary) 150%)' :
                      mood === 'sad' ? 'linear-gradient(to bottom, transparent 70%, var(--mood-primary)22 100%)' :
                      mood === 'excited' ? 'radial-gradient(circle at 50% 50%, var(--mood-primary)33 0%, transparent 70%)' :
                      mood === 'calm' ? 'linear-gradient(to top, transparent 80%, var(--mood-primary)22 100%)' :
                      mood === 'angry' ? 'radial-gradient(circle at 50% 100%, var(--mood-primary)22 0%, transparent 70%)' :
                      mood === 'party' ? 'radial-gradient(circle at 50% 0%, var(--mood-primary)33 0%, transparent 70%)' :
                      'none',
            animation: 'pulse 8s infinite'
          }}
        />
      </div>
      
      {/* Edge pulse effect that travels across screen borders */}
      <div className="absolute inset-0 pointer-events-none edge-pulse-container">
        {/* Top edge */}
        <div 
          className="absolute top-0 left-0 right-0 h-[3px] opacity-70 pointer-events-none"
          style={{ 
            background: primary,
            animation: 'edgePulse 15s ease-in-out infinite',
            boxShadow: `0 0 10px ${primary}, 0 0 20px ${primary}`
          }}
        />
        
        {/* Bottom edge */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[3px] opacity-70 pointer-events-none"
          style={{ 
            background: accent,
            animation: 'edgePulse 15s ease-in-out infinite',
            animationDelay: '2.5s',
            boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}`
          }}
        />
        
        {/* Left edge */}
        <div 
          className="absolute top-0 bottom-0 left-0 w-[3px] opacity-70 pointer-events-none"
          style={{ 
            background: primary,
            animation: 'edgePulse 15s ease-in-out infinite',
            animationDelay: '5s',
            boxShadow: `0 0 10px ${primary}, 0 0 20px ${primary}`
          }}
        />
        
        {/* Right edge */}
        <div 
          className="absolute top-0 bottom-0 right-0 w-[3px] opacity-70 pointer-events-none"
          style={{ 
            background: accent,
            animation: 'edgePulse 15s ease-in-out infinite',
            animationDelay: '7.5s',
            boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}`
          }}
        />
      </div>
      
      {/* Central pulse */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ animation: 'fadeOut 30s forwards' }}
      >
        <div 
          className="w-[200px] h-[200px] rounded-full opacity-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${primary}66 0%, transparent 70%)`,
            animation: 'pulseOut 4s ease-out infinite',
            animationDelay: '0.5s'
          }}
        />
      </div>
    </div>
  );
};

// Custom hook for using the mood context
export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

export default MoodContext; 