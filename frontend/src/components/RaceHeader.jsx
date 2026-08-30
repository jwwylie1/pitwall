import React, { useEffect, useState } from 'react';
import getMeeting from '../data/getMeeting';

function RaceHeader({ meeting: providedMeeting, sessionKey }) {
  const [fetchedMeeting, setFetchedMeeting] = useState(null);

  useEffect(() => {
    if (!sessionKey) {return;}
    
    const fetchMeetings = async (sessionKey) => {
      const meeting = await getMeeting(sessionKey)
      setFetchedMeeting(meeting);
    };

    fetchMeetings() // only runs if not provided
    
  }, [providedMeeting, sessionKey]);

  const meeting = providedMeeting ?? fetchedMeeting

  return (
    <>
    <div className="race-header w100" style={{ '--bg-image': `url(/assets/backgrounds/${meeting?.location?.replace(' ', '')}.jpg)` }}>
        {meeting?.meeting_official_name}
        
    </div>
    </>
  )
}

export default RaceHeader