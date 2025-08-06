# 🏁 Pitwall

A full-stack Formula 1 race review application. Pitwall uses AI to transcribe F1 team radio communications and translate technical jargon into understandable explanations for fans. The Lap Visualization Tool also replays any lap frmo any race using real-time telemetry.

## ✨ Features

- **Audio Transcription**: Converts F1 radio messages to text using faster-whisper
- **Technical Translation**: Explains F1 terminology and technical concepts in plain language using a fine-tuned Mistral model
- **Lap Visualization**: Replays selected drivers' laps using multiple telemetry points each second
- **Modern Interface**: Clean React frontend for easy interaction

---

## 🚀 Getting Started

These instructions will help you get the project running locally on your machine.<br/>
Alternatively, check out https://f1-pitwall.vercel.app to see an online version.
> Note: The radio explainer tool does not work online as the AI is not hosted remotely.

### ✅ Prerequisites

Ensure you have the following installed:

| Tool         | Version       | Install Instructions |
|--------------|----------------|----------------------|
| **Git**      | Any            | https://git-scm.com/downloads |
| **Python**   | 3.9+           | https://www.python.org/downloads/ |
| **Node.js**  | 18+ (LTS)      | https://nodejs.org/en/download |
| **npm**      | Comes with Node.js | |
| **WSL (Ubuntu)** | For Windows users | https://learn.microsoft.com/en-us/windows/wsl/install |

### 🔑 Hugging Face Authentication Required

1. Create a free account at https://huggingface.co/
2. Go to https://huggingface.co/settings/tokens
3. Create a new token with "Read" permissions and copy it
4. Accept the Mistral model license at https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2

### 💻 System Requirements

- **RAM**: 8GB+ recommended (AI models are memory-intensive)
- **Storage**: 14GB+ free space for model downloads
- **GPU**: Optional but recommended for faster transcription

> **macOS Users**: Use Terminal and Homebrew (`brew install python node`) to install dependencies.  
> **Windows (non-WSL)**: You can run everything using CMD/PowerShell, but using WSL is strongly recommended for a smoother Unix-like experience.

---

## 📥 Clone the Repository

```bash
git clone https://github.com/jwwylie1/pitwall
cd pitwall
```

## 🧠 Backend: FastAPI Setup

Open **Terminal 1** and run:

```bash
cd api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export MISTRAL_TOKEN=hf_YOUR_TOKEN_HERE
```

### Start the Backend

```bash
uvicorn app:app --reload --port 8000
```

> 💡 **macOS:**  
> The commands are the same — just use your built-in Terminal app.

> 💡 **Windows (non-WSL):**
> Use these adjusted commands in Command Prompt or PowerShell:
```bash
cd api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
set MISTRAL_TOKEN=hf_YOUR_TOKEN_HERE
uvicorn app:app --reload --port 8000
```

This will start the **FastAPI** server at `http://localhost:8000`

> ⏱️ **First Launch**: Initial startup may take 2-5 minutes as AI models are downloaded from Hugging Face.

## 🎨 Frontend: React App Setup

Open **Terminal 2** and run:

```bash
cd frontend
npm install
npm run dev
```

The React app will start at `http://localhost:5173` (or the next available port).

---

## 🎯 How to Use

1. **Access the Application**: Open `http://localhost:5173` in your browser
2. **Navigate the Webpage**: The home page provides links to the Radio Explanation Tool and Lap Visualizer Tool
3. **Choose Race**: Both pages default to the most recent Grand Prix. Click **Change Race** in the top right corner to select any race since 2023.

#### For Radio Explainer:
1. **Get Trancription and Explanation**: Simply click the red button next to any audio clip to get the recieve a transcription, understandable explanation, and further race context.
> Note: This process can take 5-20 seconds depending on clip length and computing power.

#### For Lap Visualizer:
1. **Select Lap**: Move the slider the choose which lap you want to view for both drivers. This defaults to lap 25 and automatically adjusts its maximum depending on the race.
2. **Select Drivers**: Click on two drivers to choose which drivers' laps you want to compare.
3. **Select Speed Multiplier**: Move the slider to select the multiplier of real-time speed to view between 1x (real-time) and 10x.
4. **See Results**: Click **Submit** to view the cars navigate around the track and their telemetry data in a table below in real-time.
> Note: If either driver did not complete the selected lap, the animation will not run and an alert will be displayed.

---

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process using port 8000
lsof -ti:8000 | xargs kill -9
```

**Model Download Fails**
- Check internet connection
- Ensure sufficient disk space (2GB+)
- Try restarting the backend server

**Out of Memory Errors**
- Close other applications to free RAM
- Consider using smaller model variants if available

**Backend Won't Start**
- Verify Python version: `python3 --version`
- Ensure virtual environment is activated
- Check all dependencies installed: `pip list`

---

## 📁 Project Structure

```
pitwall/
├── api/                 # FastAPI backend
│   ├── app.py          # Main application
│   ├── requirements.txt # Python dependencies
│   └── .env.example    # Environment template
├── frontend/           # React frontend
│   ├── src/           # Source code
│   ├── package.json   # Node dependencies
│   └── ...
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **faster-whisper** for speech recognition
- **Mistral AI** for language model capabilities
- **Hugging Face** for model hosting and transformers library