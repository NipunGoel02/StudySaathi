import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from pdf_parser import extract_text_from_file
from ollama_service import (
    check_ollama_health,
    generate_summary,
    generate_mcqs,
    generate_flashcards,
    DEFAULT_MODEL,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("study-saathi")

app = FastAPI(
    title="Study Saathi API",
    description="Local AI-powered study companion backend using Ollama & PyMuPDF",
    version="1.0.0"
)

# Enable CORS for local Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NotesPayload(BaseModel):
    notes: str = Field(..., min_length=1, description="Extracted study notes text")
    model: Optional[str] = Field(default=None, description="Optional Ollama model override")


@app.get("/health")
def health_check():
    """Check backend and local Ollama status."""
    ollama_info = check_ollama_health()
    return {
        "status": "online",
        "app": "Study Saathi",
        "ollama": ollama_info
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Receive PDF or TXT file, extract text, and return text with file metadata.
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Please upload your study notes first.")
        
    filename = file.filename
    lower_name = filename.lower()
    if not (lower_name.endswith(".pdf") or lower_name.endswith(".txt")):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF or TXT file."
        )

    try:
        content_bytes = await file.read()
        if len(content_bytes) == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
            
        parsed_data = extract_text_from_file(content_bytes, filename)
        return {
            "success": True,
            "filename": parsed_data["filename"],
            "file_type": parsed_data["file_type"],
            "char_count": parsed_data["char_count"],
            "page_count": parsed_data["page_count"],
            "text": parsed_data["text"],
            "message": "Notes uploaded successfully"
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")


@app.post("/summary")
def get_summary(payload: NotesPayload):
    """
    Generate an exam summary using local Ollama model.
    """
    notes = payload.notes.strip()
    if not notes:
        raise HTTPException(status_code=400, detail="Please upload your study notes first.")
        
    try:
        summary_text = generate_summary(notes, model=payload.model or DEFAULT_MODEL)
        return {
            "success": True,
            "summary": summary_text
        }
    except ConnectionError as ce:
        raise HTTPException(status_code=503, detail="Local AI is unavailable. Please start Ollama and try again.")
    except Exception as e:
        logger.error(f"Summary generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")


@app.post("/mcqs")
def get_mcqs(payload: NotesPayload):
    """
    Generate 10 practice MCQs using local Ollama model.
    """
    notes = payload.notes.strip()
    if not notes:
        raise HTTPException(status_code=400, detail="Please upload your study notes first.")
        
    try:
        mcqs = generate_mcqs(notes, model=payload.model or DEFAULT_MODEL)
        return {
            "success": True,
            "mcqs": mcqs
        }
    except ConnectionError as ce:
        raise HTTPException(status_code=503, detail="Local AI is unavailable. Please start Ollama and try again.")
    except Exception as e:
        logger.error(f"MCQ generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")


@app.post("/flashcards")
def get_flashcards(payload: NotesPayload):
    """
    Generate 10-15 flashcards using local Ollama model.
    """
    notes = payload.notes.strip()
    if not notes:
        raise HTTPException(status_code=400, detail="Please upload your study notes first.")
        
    try:
        flashcards = generate_flashcards(notes, model=payload.model or DEFAULT_MODEL)
        return {
            "success": True,
            "flashcards": flashcards
        }
    except ConnectionError as ce:
        raise HTTPException(status_code=503, detail="Local AI is unavailable. Please start Ollama and try again.")
    except Exception as e:
        logger.error(f"Flashcard generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
