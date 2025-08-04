import Header from './components/Header.jsx'
import { Link } from 'react-router-dom';

function HomePage({ sessionKey, setSessionKey}) {

  document.title = "Pitwall Home";

  return (
    <>
    <Header sessionKey={sessionKey} setSessionKey={setSessionKey} 
    title={'Home Page'} showChange={false} />

    <div className="race-header w100 home-header" style={{ 
      '--bg-image': `url(/assets/backgrounds/pitwall.jpg)` }}>
        Welcome to Pitwall !
    </div>

    <div className='index-body'>

      <h1 className="index-title center">Pitwall gives Formula One fans a unique perspective as they look back on a race.</h1>
      <Link to="/radio-explainer" className='index-link'>Radio Explainer</Link>
      <br/>
      Drivers and their teams are in constant communication with each other. Strategy, 
      celebration, and frustration run through the headsets all race. This tool allows
      users to review some of the messages they may have missed throughout the broadcast.
      Pitwall will also transcribe the message and provide an AI-generated explanation,
      encouraging new fans to interact with the sport even if they do not understand
      all of its technical language yet. 
      <br/>
      <h3>Technical Details</h3>

      Radio messages are gathered using <a href="https://openf1.org/" target="_blank">
      OpenF1's</a> team radio API when a race is selected.
      Upon request from the user, a Python script is invoked using FastAPI. This script first uses <a
       href="https://github.com/openai/whisper" target="_blank">OpenAI's whisper model
       </a> to transcribe the message, along with helper functions that 
      increase its ability to pick up commonly used phrases and names. It then makes 
      several more calls to OpenF1 to obtain relevant context for the clip based on the 
      date and driver. Finally, the transcription alongside its context is given to a <a
       href="https://mistral.ai/" target="_blank">Mistral LLM</a> that has been 
      fine-tuned via <a href="https://huggingface.co/">HuggingFace</a> based on roughly 
      1,000 radio messages and explanations from the 2023 season. The resulting explanation, 
      initial transcription, and relevant context are all returned back to the front end 
      and shown to the user.
      <br/>
      <Link to="/lap-visualizer" className='index-link'>Lap Visualizer</Link>
      <br/>
      In Formula One, fractions of seconds in throttle timing, braking points, and gear
      shifting is the difference between backmarkers and champions. A small deviation
      from the racing line can be the difference between pole position and exiting in
      Q3. The lap visualization tool allows users to track both in real time. After
      selecting two drivers and a lap, colored lines will begin tracing their actual 
      paths around the track while also displaying a variety of live telemetry data.

      <h3>Technical Details</h3>

      When a race is selected, the active drivers are pulled from OpenF1. These drivers
      are shown to the user, and plain JavaScript allows users to toggle between which
      drivers they select. When two drivers and a valid lap are submitted, a canvas with 
      the selected track outline is placed on the screen. Telemetry and location data
      are then obtained from OpenF1. As the data is parsed through with an internal
      clock, the canvas element is drawn on from its previous location to new, while the
      telemetry table is updated with both live and average values.

      <h2 className="center index-title"><a href="https://github.com/jwwylie1/pitwall-ai"
      target="_blank">Pitwall Github</a></h2>
    </div>
    </>
  );
};

export default HomePage