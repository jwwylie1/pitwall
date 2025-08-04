const fetchSession = async (sessionKey) => {
    try {
        const res = await fetch(
            `https://api.openf1.org/v1/sessions?session_key=${sessionKey}`
        );
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        return data[0].meeting_key
    } catch (error) {
        console.error('Error fetching messages:', error);
        // Handle the error appropriately, possibly set an error state
    }
};

const getMeeting = async (sessionKey) => {
  try {
    const meetingKey = await fetchSession(sessionKey)
      const res = await fetch(
          `https://api.openf1.org/v1/meetings?meeting_key=${meetingKey}`
      );
      if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      return data[0]
  } catch (error) {
      console.error('Error fetching messages:', error);
      // Handle the error appropriately, possibly set an error state
      throw error;
  }
};

export default getMeeting