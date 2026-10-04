# 📚 Study Saathi

> **Your personal local AI study companion.**
> Upload your notes → AI reads them → Get a summary, MCQs, and flashcards. All on your device. No cloud. No API key. No cost.

---

## ✨ What It Does

Study Saathi is a weekend-built, open-source study assistant powered by a **local open-weight AI model running entirely on your machine**.

| Feature | Description |
|---|---|
| 📄 **Upload Notes** | Upload a PDF or TXT file containing your study notes |
| 🧠 **AI Summary** | Get a concise, exam-oriented summary with key concepts & definitions |
| ❓ **Practice MCQs** | Auto-generated 10 multiple-choice questions from your notes |
| 🃏 **Flashcards** | 10 quick flashcards to revise important terms and facts |

Everything is generated from **your notes only** — the AI does not hallucinate facts from outside.

---

## 🔒 Why Local AI?

Study Saathi uses **Ollama** to run a local open-weight model (`qwen3:1.7b`) directly on your hardware.

- 🔐 **100% Private** — your study notes never leave your device
- 📴 **Works Offline** — no internet required after setup
- 🆓 **No API Cost** — zero per-request charges
- 🔑 **No API Key** — nothing to sign up for
- ⚡ **Fast on GPU** — runs at 100% GPU on an NVIDIA RTX 3050 (~4 GB VRAM)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite + Tailwind CSS |
| **Backend** | Python + FastAPI |
| **PDF Parsing** | PyMuPDF |
| **Local AI Runtime** | [Ollama](https://ollama.com) |
| **AI Model** | `qwen3:1.7b` (open-weight, ~1.7 GB) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://python.org/) (3.10+)
- [Ollama](https://ollama.com/download) — local AI runtime

### 1. Pull the AI Model

```bash
ollama pull qwen3:1.7b
```

Verify it is running:

```bash
ollama ps
```

You should see `qwen3:1.7b` listed with GPU usage.

### 2. Clone the Repo

```bash
git clone https://github.com/your-username/StudySaathi.git
cd StudySaathi
```

### 3. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 5. Start the App

The easiest way is to use the included `start.bat` (Windows):

```
start.bat
```

This starts both the FastAPI backend (port `8000`) and the Vite dev server (port `5173`).

Then open your browser at:

```
http://localhost:5173
```

---

## 📡 API Endpoints

The FastAPI backend exposes the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check backend + Ollama status |
| `POST` | `/upload` | Upload PDF or TXT, returns extracted text |
| `POST` | `/summary` | Generate exam summary from notes |
| `POST` | `/mcqs` | Generate 10 MCQs from notes |
| `POST` | `/flashcards` | Generate 10 flashcards from notes |

Interactive API docs available at: `http://localhost:8000/docs`

---

## ⚙️ AI Configuration

| Setting | Value |
|---|---|
| **Model** | `qwen3:1.7b` |
| **Runtime** | Ollama (`http://localhost:11434`) |
| **Temperature** | `0.1` |
| **Top-P** | `0.8` |
| **Context Length** | `4096` tokens |
| **Thinking** | Disabled (`think: false`) for faster responses |
| **Response Format** | JSON (structured output for MCQs & flashcards) |

The model can be changed by updating `DEFAULT_MODEL` in `backend/ollama_service.py`.

---

## 📁 Project Structure

```
StudySaathi/
├── backend/
│   ├── main.py              # FastAPI app + API routes
│   ├── ollama_service.py    # AI generation logic (summary, MCQs, flashcards)
│   ├── pdf_parser.py        # PDF + TXT text extraction via PyMuPDF
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React app + state management
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   ├── Summary.jsx
│   │   │   ├── MCQs.jsx
│   │   │   └── Flashcards.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
├── sample_notes/            # Example notes for testing
├── start.bat                # One-click launcher (Windows)
└── README.md
```

---

## 🧪 Tested On

| Component | Details |
|---|---|
| GPU | NVIDIA RTX 3050 |
| VRAM | ~4 GB |
| Model | `qwen3:1.7b` — 1.7 GB, 100% GPU |
| Context | 4096 tokens |
| MCQ generation | ~12 seconds |

---

## 🎯 Design Philosophy

Study Saathi is **intentionally simple**. It does **not** use:

- ❌ RAG / Vector database
- ❌ Authentication / login
- ❌ Cloud AI APIs
- ❌ External LLM APIs
- ❌ Database

This is by design. The goal was to build something genuinely useful for a real friend preparing for exams — over a weekend — using only local, open-weight AI.

---

## 📝 License

MIT License — free to use, modify, and share.

---

## 🙏 Built For

> "Built for a real friend preparing for exams."
> — Hacktoberfest 2026 · Build for a Friend track
