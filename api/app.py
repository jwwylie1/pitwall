from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import Optional
from urllib.request import urlopen
import json
#import whisper
from faster_whisper import WhisperModel
import requests
import radio_helpers
import pandas as pd
import predictor
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request
from fastapi.exception_handlers import request_validation_exception_handler

SESSION_KEY = 9928
#model = whisper.load_model("large-v3-turbo")
#model = whisper.load_model("base")
model = WhisperModel("small.en", compute_type="int8", device="cpu")


app = FastAPI(title="Pitwall", version="1.0.0")
HF_API_URL = "https://api-inference.huggingface.co/models/jwwylie1/f1-explainer-adapter"
HF_API_TOKEN = os.environ.get("HF_API_TOKEN")

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def transcribe_url(mp3_url: str):
    # Download the audio
    audio_path = "/tmp/audio.mp3"
    with open(audio_path, "wb") as f:
        f.write(requests.get(mp3_url).content)

    # Transcribe
    segments, _ = model.transcribe(audio_path)

    # Combine text
    full_text = " ".join(segment.text for segment in segments)

    # Post-process with your helper
    return radio_helpers.fix_terms(full_text)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("Validation Error:", exc.errors())
    return await request_validation_exception_handler(request, exc)

class InputText(BaseModel):
    date: str  # Can also use datetime, but str is fine for now
    driver_number: int
    meeting_key: int
    recording_url: str
    session_key: int

class Prompt(BaseModel):
    input_text: InputText
    
    
@app.post("/api/generate")
async def generate_response(prompt: Prompt):
    
    print(prompt, flush=True)

    #response = urlopen('https://api.openf1.org/v1/team_radio?session_key={}'.format(SESSION_KEY))
    #data = json.loads(response.read().decode('utf-8'))
    
    #if datum['date'] < "2023-03-19T17:11:01.397000+00:00": continue
    #else: 
    # print(datum['date'])
    mp3_url = prompt.input_text.recording_url
    
    print("About to run get_extra_info", flush=True)
    
    info = radio_helpers.get_extra_info(SESSION_KEY, prompt.input_text)

    print("About to run fix_terms", flush=True)

    result = transcribe_url(mp3_url)
    
    
    new_string = f"{{'input': 'Instruction: Explain this Formula 1 radio message to someone less familiar with the sport, explaining what any potentially unfamilar terms mean. Only provide the explanation text, do not generate any JSON.\n\nRadio: {result}\nContext: Driver = {info[0]}, Lap = {info[1]}, Compound = {info[2]}, Position = {info[5]}, Gap ahead = {info[3]}, Weather = {info[4]}.'}}"
    
    print(new_string)
    if (result == ' Thank you.' or result == ''):
        result = ''
        response = 'No transcription provided.'
    else:
        print("About to run generate_response", flush=True)
        response = predictor.generate_response(new_string)
    
    print("This is the mp3:\n", mp3_url)
    print("This is the input:\n", new_string)
            
    return {"response": {'transcription': result, 'explanation': response, 'context': info, 'prompt': new_string}}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
