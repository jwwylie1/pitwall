import React, { useState } from 'react';

function F1Explainer({message}) {
  /* const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://jwwylie1-pitwall-ai.hf.space'
    : 'http://localhost:8000' */

  const API_BASE_URL = 'https://huggingface.co/spaces/jwwylie1/pitwall-ai';

  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { input_text: message } ),
      })

      const data = await res.json();
      setOutput(data.response); // this matches what FastAPI returns
    } catch (err) {
      console.error('Error:', err);
      setOutput('Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    
        <div className="f1-explainer">
            <div className='before-explanation w100'>
                <audio controls>
                    <source src={message.recording_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
                <button onClick={generate} disabled={loading}>
                    {loading ? 'Generating...' : 'Transcribe and Explain'}
                </button>
            </div>
            {output && (
            <div className='output-container w100'>
                <div>
                    <h2>Transcription</h2>
                    <p>{output['transcription']}</p>
                </div>
                <div>
                    <h2>Explanation<br/></h2>
                    <p>{output['explanation']}</p>
                </div>
            </div>
            )}
            {output && (
              console.log(output['prompt']),
            <table className='context-table'>
              <tbody>
                <tr>
                    <td>Lap</td>
                    <td>Position</td>
                    <td>Tyre Compound</td>
                    <td>Gap Ahead</td>
                    <td>Weather</td>
                </tr>
                <tr>
                    <td>{output['context'][1]}</td>
                    <td>{output['context'][5]}</td>
                    <td className={output['context'][2]}>{output['context'][2]}</td>
                    <td>{output['context'][3]}</td>
                    <td>{output['context'][4]}</td>
                </tr>
                </tbody>
            </table>
            )}
        </div>
    </>
  );
}

export default F1Explainer;