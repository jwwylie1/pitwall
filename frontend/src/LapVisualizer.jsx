import React, { useEffect, useState, useRef } from 'react'
import Header from './components/Header.jsx'
import RaceHeader from './components/RaceHeader.jsx'
import Canvas from './components/Canvas.jsx'
import DriverList from './components/DriverList.jsx'
import getMeeting from './data/getMeeting.js';
import races from './data/races.js'


function LapVisualizer({ sessionKey, setSessionKey }) {

  const [driversList, setDriversList] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [session, setSession] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [race, setRace] = useState(null)
  const [lap, setLap] = useState(25);
  const [maxLap, setMaxLap] = useState('N/A');
  const [speedMult, setSpeedMult] = useState(1)
  const [showCanvas, setShowCanvas] = useState(false);

  let [thing, setThing] = useState(0);

  const handleLapChange = (event) => {
    document.getElementById('lap-header').innerText = "Selected Lap - " + event.target.value;
    setLap(event.target.value)
  }

  const handleDriversChange = (selected) => {
    let newDrivers = []
    newDrivers[0] = drivers[1];
    newDrivers[1] = selected;
    setDrivers(newDrivers)
  }

  const handleSpeedChange = (event) => {
    document.getElementById('speed-header').innerText = "Selected Speed - " + event.target.value + 'x';
    setSpeedMult(event.target.value)
  }

  const handleSubmit = () => {
    setShowCanvas(true)
    setThing(lap);
  }

  useEffect(() => {
    document.title = 'F1 Lap Visualizer';

    const fetchData = async () => {

      const driversRes = await fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
      const driversData = await driversRes.json()

      setDriversList(driversData)
    }

    const fetchMeetings = async (key) => {
      const meeting = await getMeeting(sessionKey)
      setMeeting(meeting);
      const racesInYear = races[meeting?.year];
      const race = racesInYear.find(gp => gp.location === meeting?.location)
      const laps = race?.num_laps;
      setRace(race)
      setMaxLap(laps)
    };

    if (sessionKey) {
      fetchData()
      fetchMeetings(sessionKey)
    }

  }, [sessionKey])
  
  return (
    <>
      <Header sessionKey={sessionKey} setSessionKey={setSessionKey} title="Lap Visualization Tool"/>
      <RaceHeader sessionKey={sessionKey}/>
      <form id="lap-form" style={{ textAlign: 'center' }} onSubmit={(event) => {event.preventDefault(); handleSubmit()}}>
        <h2 style={{ textDecoration: 'none' }} id="lap-header">Selected Lap - 25</h2>

        <input type="range" value={lap} onChange={handleLapChange} min='2' max={maxLap} 
        step='1' className="lap-input white f1 center"></input>

        <h2 style={{ textDecoration: 'none' }}>Select 2 Drivers</h2>
        <DriverList drivers={driversList} changeDrivers={handleDriversChange} />
        {/*<DriverList drivers={driversList} updateFunction={handleDriver2Change} />*/}
        <br/>
        <h2 style={{ textDecoration: 'none' }} id="speed-header">Selected Speed - 1x</h2>
        <input type="range" onChange={handleSpeedChange} min='1' max='10' value={speedMult}
        step='1' className="speed-input white f1 center"></input>
        <br/>
        <button className="lap-submit">Submit</button>
      </form>

      <div id='warning' className='center'>WARNING</div>

      {showCanvas && <Canvas race={race} driver1={drivers[0]} driver2={drivers[1]} 
      lap={lap} speed={speedMult} id="vis-canvas"/>}
    </>
  )
}

export default LapVisualizer
