import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import DesktopNavbar from './components/DesktopNavbar'
import MobileNavbar from './components/MobileNavbar'
import NetflixBrowseWithStyles from './components/Banner'
import NetflixBrowse from './movies/MovieCard/MovieCard'
import RecommendationSection from './components/RecommendationSection'
import Footer from './components/Footer'
import { MoodProvider } from './context/MoodContext'
import MoodIndicator from './components/MoodIndicator'
import MoodButton from './components/MoodButton'
import Navbar from './components/Navbar'

function App() {
  const [count, setCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  
  // Ensure scrolling is enabled immediately when the app loads
  useEffect(() => {
    // Enable scrolling
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    
    // Clean up
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, []);
  
  // Check if the screen is mobile or desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <MoodProvider>
      {/* Conditionally render original navbar based on screen size */}
      {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
      
      {/* Floating mood button & indicator */}
      <MoodButton />
      <MoodIndicator />
      
      <Routes>
        <Route path="/" element={
          <>
            <NetflixBrowseWithStyles/>
            <div id="recommendation-anchor" style={{ marginTop: '50px', scrollMarginTop: '100px', width: '100%' }}>
              <RecommendationSection/>
            </div>
            <NetflixBrowse/>
          </>
        } />
        <Route path="/series" element={<div>Series Page</div>} />
        <Route path="/movies" element={<div>Movies Page</div>} />
        <Route path="/new" element={<div>New & Popular Page</div>} />
        <Route path="/mylist" element={<div>My List Page</div>} />
        <Route path="/recommended" element={<div>Search Page</div>} />
      </Routes>
      <Footer />
    </MoodProvider>
  )
}

export default App
