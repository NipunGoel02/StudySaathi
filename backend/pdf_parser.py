import io
import pymupdf
from typing import Dict, Any


def extract_text_from_file(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Extract text content and metadata from an uploaded PDF or TXT file.
    
    Returns a dictionary with:
      - filename: str
      - file_type: 'PDF' or 'TXT'
      - text: str
      - char_count: int
      - page_count: int
    """
    lower_filename = filename.lower()
    
    if lower_filename.endswith(".pdf"):
        file_type = "PDF"
        try:
            doc = pymupdf.open(stream=file_bytes, filetype="pdf")
            page_count = len(doc)
            page_texts = []
            
            for page_num in range(page_count):
                page = doc.load_page(page_num)
                page_text = page.get_text()
                if page_text.strip():
                    page_texts.append(page_text.strip())
            
            doc.close()
            extracted_text = "\n\n".join(page_texts).strip()
            
            if not extracted_text:
                raise ValueError("The uploaded PDF does not contain extractable text (it might be an image-only scan).")
                
            return {
                "filename": filename,
                "file_type": file_type,
                "text": extracted_text,
                "char_count": len(extracted_text),
                "page_count": page_count,
            }
        except Exception as e:
            if isinstance(e, ValueError):
                raise e
            raise ValueError(f"Failed to read PDF file: {str(e)}")

    elif lower_filename.endswith(".txt"):
        file_type = "TXT"
        encodings = ["utf-8", "latin-1", "cp1252"]
        extracted_text = ""
        
        for enc in encodings:
            try:
                extracted_text = file_bytes.decode(enc)
                break
            except UnicodeDecodeError:
                continue
                
        extracted_text = extracted_text.strip()
        if not extracted_text:
            raise ValueError("The TXT file is empty.")
            
        return {
            "filename": filename,
            "file_type": file_type,
            "text": extracted_text,
            "char_count": len(extracted_text),
            "page_count": 1,
        }
    else:
        raise ValueError("Unsupported file format. Please upload a PDF or TXT file.")
