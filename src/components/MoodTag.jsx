import React from 'react';
import { useMood } from '../context/MoodContext';

/**
 * MoodTag Component - Dynamic tag that changes gradient based on current mood
 * 
 * @param {Object} props
 * @param {string} props.text - Text to display in the tag
 * @param {string} props.type - Type of tag (top10, new, ai, trending)
 * @param {string} props.className - Additional classNames
 */
export default function MoodTag({ text, type = 'default', className = '', ...props }) {
  const { currentMood, moodThemes } = useMood();
  
  // Get current mood colors
  const theme = moodThemes[currentMood].colors;
  
  // Define gradient styles based on tag type and current mood
  const getGradientStyle = () => {
    const primary = theme.primary;
    const accent = theme.accent;
    const secondary = theme.secondary;
    
    switch (type) {
      case 'top10':
        return {
          background: `linear-gradient(90deg, ${primary} 0%, ${accent} 100%)`,
          border: `1px solid ${accent}`
        };
      case 'new':
        return {
          background: `linear-gradient(90deg, ${primary}aa 0%, ${primary} 100%)`,
          border: `1px solid ${primary}`
        };
      case 'ai':
        return {
          background: `linear-gradient(135deg, ${accent} 0%, ${primary} 100%)`,
          border: `1px solid ${primary}`
        };
      case 'trending':
        return {
          background: `linear-gradient(90deg, ${accent}aa 0%, ${accent} 100%)`,
          border: `1px solid ${accent}`
        };
      default:
        return {
          background: `linear-gradient(90deg, ${secondary} 0%, ${primary}aa 100%)`,
          border: `1px solid ${primary}77`
        };
    }
  };

  // Generate tag element with dynamic styling
  return (
    <span 
      className={`px-2 py-0.5 text-xs font-bold rounded text-[var(--mood-button-text,#ffffff)] inline-flex items-center transition-all duration-300 ${className}`}
      style={{
        ...getGradientStyle(),
        boxShadow: `0 2px 4px rgba(0,0,0,0.2)`,
        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }}
      {...props}
    >
      {text}
    </span>
  );
} 