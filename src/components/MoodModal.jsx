import React, { useEffect } from 'react';
import MoodSelector from './MoodSelector';

export default function MoodModal({ isOpen, onClose }) {
  // Ensure body overflow is properly managed when modal opens/closes
  useEffect(() => {
    // When modal opens, restore scrolling just to be safe
    if (isOpen) {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    }
    
    // Cleanup function to ensure scrolling is enabled when modal closes
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, [isOpen]);
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return <MoodSelector onClose={onClose} />;
} 