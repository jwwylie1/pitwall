import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage'; // Home Page component
import RadioExplainer from './RadioExplainer'; // Radio Explainer component
import LapVisualizer from './LapVisualizer'; // Track Visualizer component


function App() {

  const [sessionKey, setSessionKey] = useState(9928); // most recent session key

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage sessionKey={sessionKey} setSessionKey={setSessionKey} />} />
        <Route path="/radio-explainer" element={<RadioExplainer sessionKey={sessionKey} setSessionKey={setSessionKey} />} />
        <Route path="/lap-visualizer" element={<LapVisualizer sessionKey={sessionKey} setSessionKey={setSessionKey} />} />
      </Routes>
    </Router>
  )
}

export default App