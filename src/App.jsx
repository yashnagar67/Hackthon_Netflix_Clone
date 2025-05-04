import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import NetflixBrowseWithStyles from './components/Banner'
import NetflixBrowse from './movies/MovieCard/MovieCard'
import RecommendationSection from './components/RecommendationSection'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar/>
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
    </>
  )
}

export default App
