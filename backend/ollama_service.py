import json
import re
import requests
from typing import Dict, Any, List, Optional


# ============================================================
# OLLAMA CONFIG
# ============================================================

OLLAMA_BASE_URL = "http://localhost:11434"

# Fast local model for RTX 3050 4GB VRAM
DEFAULT_MODEL = "qwen3:1.7b"


# ============================================================
# MODEL HELPERS
# ============================================================

def get_available_models() -> List[str]:
    """Return all models available in local Ollama."""

    try:
        response = requests.get(
            f"{OLLAMA_BASE_URL}/api/tags",
            timeout=5
        )

        if response.status_code == 200:
            data = response.json()

            return [
                model.get("name")
                for model in data.get("models", [])
                if model.get("name")
            ]

    except Exception:
        pass

    return []


def check_ollama_health() -> Dict[str, Any]:
    """Check whether Ollama is running."""

    try:
        response = requests.get(
            f"{OLLAMA_BASE_URL}/",
            timeout=4
        )

        if response.status_code == 200:

            models = get_available_models()

            selected_model = DEFAULT_MODEL

            if models and DEFAULT_MODEL not in models:
                selected_model = models[0]

            return {
                "available": True,
                "models": models,
                "selected_model": selected_model,
                "error": None
            }

    except Exception:
        pass

    return {
        "available": False,
        "models": [],
        "selected_model": None,
        "error": (
            "Local AI is unavailable. "
            "Please start Ollama and try again."
        )
    }


# ============================================================
# OUTPUT CLEANING
# ============================================================

def clean_model_output(text: str) -> str:
    """
    Remove Qwen thinking blocks and markdown code fences.
    """

    if not text:
        return ""

    # Remove <think>...</think>
    text = re.sub(
        r"<think>.*?</think>",
        "",
        text,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Remove markdown JSON fences
    text = re.sub(
        r"^\s*```(?:json)?\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\s*```\s*$",
        "",
        text
    )

    return text.strip()


# ============================================================
# OLLAMA CALL
# ============================================================

def call_ollama(
    prompt: str,
    model: str = DEFAULT_MODEL,
    system_prompt: Optional[str] = None,
    max_tokens: int = 800,
    json_mode: bool = False
) -> str:
    """
    Send a prompt to local Ollama.

    json_mode=True forces Ollama to return valid JSON.
    """

    health = check_ollama_health()

    if not health["available"]:
        raise ConnectionError(
            "Local AI is unavailable. "
            "Please start Ollama and try again."
        )

    active_model = (
        model
        or health["selected_model"]
        or DEFAULT_MODEL
    )

    payload = {
        "model": active_model,

        "prompt": prompt,

        "stream": False,

        # Disable Qwen thinking for faster generation
        "think": False,

        "options": {
            "temperature": 0.1,
            "top_p": 0.8,

            # Output token limit
            "num_predict": max_tokens,

            # Good balance for study notes
            "num_ctx": 4096
        }
    }

    # Force Ollama JSON output
    if json_mode:
        payload["format"] = "json"

    if system_prompt:
        payload["system"] = system_prompt

    try:

        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=300
        )

        if response.status_code != 200:
            raise RuntimeError(
                f"Ollama returned error: {response.text}"
            )

        result = response.json()

        raw_output = result.get(
            "response",
            ""
        )

        # Fallback if response is empty
        if (
            not raw_output.strip()
            and result.get("thinking")
        ):
            raw_output = result.get(
                "thinking",
                ""
            )

        return clean_model_output(
            raw_output
        )

    except requests.exceptions.ConnectionError:
        raise ConnectionError(
            "Local AI is unavailable. "
            "Please start Ollama and try again."
        )

    except requests.exceptions.Timeout:
        raise TimeoutError(
            "Local AI response timed out."
        )

    except Exception as e:
        raise RuntimeError(
            f"Something went wrong: {str(e)}"
        )


# ============================================================
# SUMMARY
# ============================================================

def generate_summary(
    notes: str,
    model: str = DEFAULT_MODEL
) -> str:
    """
    Generate concise exam-oriented summary.
    """

    prompt = f"""
You are an exam study assistant.

Summarize the following study notes.

Rules:
- Use ONLY the provided notes.
- Do NOT invent facts.
- Use short headings.
- Use bullet points.
- Include important definitions.
- Include important concepts.
- Include formulas if present.
- Include important facts.
- Keep it concise.
- Make it easy to revise.
- Do not add unnecessary information.

Study Notes:

{notes}
"""

    return call_ollama(
        prompt,
        model=model,
        max_tokens=600
    )


# ============================================================
# MCQ NORMALIZER
# ============================================================

def normalize_mcqs(
    parsed: Any
) -> List[Dict[str, Any]]:
    """
    Convert different JSON structures into
    the format expected by the frontend.
    """

    # --------------------------------------------------------
    # Wrapped JSON
    # --------------------------------------------------------

    if isinstance(parsed, dict):

        for key in [
            "mcqs",
            "questions",
            "items",
            "data"
        ]:

            if isinstance(
                parsed.get(key),
                list
            ):
                parsed = parsed[key]
                break

        else:
            parsed = [parsed]

    if not isinstance(parsed, list):
        return []

    normalized = []

    for index, item in enumerate(
        parsed,
        start=1
    ):

        if not isinstance(item, dict):
            continue

        # ----------------------------------------------------
        # Question
        # ----------------------------------------------------

        question = (
            item.get("question")
            or item.get("q")
            or item.get("Question")
            or ""
        )

        question = str(
            question
        ).strip()

        if not question:
            continue

        # ----------------------------------------------------
        # Options
        # ----------------------------------------------------

        options = item.get("options")

        if isinstance(options, dict):

            option_a = (
                options.get("A")
                or options.get("a")
                or ""
            )

            option_b = (
                options.get("B")
                or options.get("b")
                or ""
            )

            option_c = (
                options.get("C")
                or options.get("c")
                or ""
            )

            option_d = (
                options.get("D")
                or options.get("d")
                or ""
            )

        elif isinstance(options, list):

            option_a = (
                options[0]
                if len(options) > 0
                else ""
            )

            option_b = (
                options[1]
                if len(options) > 1
                else ""
            )

            option_c = (
                options[2]
                if len(options) > 2
                else ""
            )

            option_d = (
                options[3]
                if len(options) > 3
                else ""
            )

        else:

            option_a = (
                item.get("a")
                or item.get("A")
                or item.get("option_a")
                or ""
            )

            option_b = (
                item.get("b")
                or item.get("B")
                or item.get("option_b")
                or ""
            )

            option_c = (
                item.get("c")
                or item.get("C")
                or item.get("option_c")
                or ""
            )

            option_d = (
                item.get("d")
                or item.get("D")
                or item.get("option_d")
                or ""
            )

        options_dict = {
            "A": str(option_a).strip(),
            "B": str(option_b).strip(),
            "C": str(option_c).strip(),
            "D": str(option_d).strip()
        }

        # Require all four options
        if not all(options_dict.values()):
            continue

        # ----------------------------------------------------
        # Correct answer
        # ----------------------------------------------------

        answer = (
            item.get("correct_answer")
            or item.get("answer")
            or item.get("correct")
            or "A"
        )

        answer = str(
            answer
        ).strip().upper()

        match = re.search(
            r"[A-D]",
            answer
        )

        answer_letter = (
            match.group(0)
            if match
            else "A"
        )

        # ----------------------------------------------------
        # Explanation
        # ----------------------------------------------------

        explanation = (
            item.get("explanation")
            or f"Correct answer: {answer_letter}"
        )

        normalized.append({
            "id": index,
            "question": question,
            "options": options_dict,
            "correct_answer": answer_letter,
            "explanation": str(
                explanation
            ).strip()
        })

    return normalized


# ============================================================
# MCQ PARSER
# ============================================================

def parse_mcqs_from_text(
    raw_text: str,
    notes: str = ""
) -> List[Dict[str, Any]]:
    """
    Robust MCQ parser.

    Handles:
    - Pure JSON
    - JSON inside text
    - Markdown JSON
    - Wrapped JSON
    - Compact q/a/b/c/d format
    """

    if not raw_text:
        return []

    text = clean_model_output(
        raw_text
    )

    if not text:
        return []

    # --------------------------------------------------------
    # 1. Direct JSON
    # --------------------------------------------------------

    try:

        parsed = json.loads(text)

        result = normalize_mcqs(
            parsed
        )

        if result:
            return result

    except Exception:
        pass

    # --------------------------------------------------------
    # 2. Find JSON array inside text
    # --------------------------------------------------------

    decoder = json.JSONDecoder()

    for match in re.finditer(
        r"\[",
        text
    ):

        start = match.start()

        try:

            parsed, _ = decoder.raw_decode(
                text[start:]
            )

            result = normalize_mcqs(
                parsed
            )

            if result:
                return result

        except Exception:
            continue

    # --------------------------------------------------------
    # 3. Find JSON object inside text
    # --------------------------------------------------------

    for match in re.finditer(
        r"\{",
        text
    ):

        start = match.start()

        try:

            parsed, _ = decoder.raw_decode(
                text[start:]
            )

            result = normalize_mcqs(
                parsed
            )

            if result:
                return result

        except Exception:
            continue

    return []


# ============================================================
# MCQS
# ============================================================

def generate_mcqs(
    notes: str,
    model: str = DEFAULT_MODEL
) -> List[Dict[str, Any]]:
    """
    Generate exactly 10 MCQs.

    Uses simple JSON because small models
    are more reliable with compact output.
    """

    prompt = f"""
You are an exam question generator.

Create exactly 10 multiple-choice questions
from ONLY the study notes below.

Return ONLY a JSON array.

EXACT FORMAT:

[
  {{
    "q": "What is an operating system?",
    "a": "System software",
    "b": "Web browser",
    "c": "Database",
    "d": "Compiler",
    "answer": "A"
  }}
]

Rules:

1. Exactly 10 questions.
2. Exactly 4 options per question.
3. Options must be a, b, c and d.
4. answer must be A, B, C or D.
5. Use ONLY information from the notes.
6. Do NOT invent facts.
7. Keep questions short.
8. Keep options short.
9. Do NOT provide explanations.
10. Do NOT use markdown.
11. Do NOT add text outside JSON.
12. Return valid JSON only.

Study Notes:

{notes}
"""

    # ========================================================
    # FIRST ATTEMPT
    # ========================================================

    try:

        raw_output = call_ollama(
            prompt,
            model=model,
            max_tokens=900,
            json_mode=True
        )

        mcqs = parse_mcqs_from_text(
            raw_output,
            notes
        )

        if mcqs:
            return mcqs[:10]

    except Exception:
        pass

    # ========================================================
    # RETRY
    # ========================================================

    retry_prompt = f"""
Generate exactly 10 MCQs from these study notes.

IMPORTANT:
Return ONLY valid JSON.

Do not use markdown.
Do not provide explanations.
Do not add any text outside JSON.

Use EXACTLY:

[
  {{
    "q": "Question",
    "a": "Option A",
    "b": "Option B",
    "c": "Option C",
    "d": "Option D",
    "answer": "A"
  }}
]

The answer must be A, B, C or D.

Use ONLY the notes.

Study Notes:

{notes}
"""

    try:

        raw_output = call_ollama(
            retry_prompt,
            model=model,
            max_tokens=900,
            json_mode=True
        )

        mcqs = parse_mcqs_from_text(
            raw_output,
            notes
        )

        if mcqs:
            return mcqs[:10]

    except Exception as e:

        raise ValueError(
            f"MCQ generation failed: {str(e)}"
        )

    raise ValueError(
        "Could not generate valid MCQs. "
        "Please try generating again."
    )


# ============================================================
# FLASHCARD NORMALIZER
# ============================================================

def normalize_flashcards(
    parsed: Any
) -> List[Dict[str, Any]]:
    """
    Normalize different flashcard JSON formats.
    """

    # --------------------------------------------------------
    # Wrapped object
    # --------------------------------------------------------

    if isinstance(parsed, dict):

        for key in [
            "flashcards",
            "cards",
            "items",
            "data"
        ]:

            if isinstance(
                parsed.get(key),
                list
            ):
                parsed = parsed[key]
                break

        else:
            parsed = [parsed]

    if not isinstance(parsed, list):
        return []

    flashcards = []

    for index, item in enumerate(
        parsed,
        start=1
    ):

        if not isinstance(item, dict):
            continue

        question = (
            item.get("question")
            or item.get("q")
            or item.get("front")
            or ""
        )

        answer = (
            item.get("answer")
            or item.get("a")
            or item.get("back")
            or ""
        )

        question = str(
            question
        ).strip()

        answer = str(
            answer
        ).strip()

        if not question or not answer:
            continue

        flashcards.append({
            "id": index,
            "question": question,
            "answer": answer
        })

    return flashcards


# ============================================================
# FLASHCARD PARSER
# ============================================================

def parse_flashcards_from_text(
    raw_text: str
) -> List[Dict[str, Any]]:
    """
    Robust flashcard parser.
    """

    if not raw_text:
        return []

    text = clean_model_output(
        raw_text
    )

    if not text:
        return []

    # --------------------------------------------------------
    # 1. Direct JSON
    # --------------------------------------------------------

    try:

        parsed = json.loads(text)

        result = normalize_flashcards(
            parsed
        )

        if result:
            return result

    except Exception:
        pass

    # --------------------------------------------------------
    # 2. JSON embedded in extra text
    # --------------------------------------------------------

    decoder = json.JSONDecoder()

    for match in re.finditer(
        r"\[",
        text
    ):

        start = match.start()

        try:

            parsed, _ = decoder.raw_decode(
                text[start:]
            )

            result = normalize_flashcards(
                parsed
            )

            if result:
                return result

        except Exception:
            continue

    # --------------------------------------------------------
    # 3. Regex fallback
    # --------------------------------------------------------

    flashcards = []

    pairs = re.findall(
        r"(?:Question|\*\*Question\*\*|Q\d+)"
        r"\s*[:\-]\s*(.+?)"
        r"\s*(?:Answer|\*\*Answer\*\*|A\d+)"
        r"\s*[:\-]\s*(.+?)"
        r"(?=\n\s*(?:Question|\*\*Question\*\*|Q\d+)|\Z)",
        text,
        flags=re.DOTALL |
        re.IGNORECASE
    )

    for index, pair in enumerate(
        pairs,
        start=1
    ):

        question = (
            pair[0]
            .strip()
            .replace("**", "")
        )

        answer = (
            pair[1]
            .strip()
            .replace("**", "")
        )

        if question and answer:

            flashcards.append({
                "id": index,
                "question": question,
                "answer": answer
            })

    return flashcards


# ============================================================
# FLASHCARDS
# ============================================================

def generate_flashcards(
    notes: str,
    model: str = DEFAULT_MODEL
) -> List[Dict[str, Any]]:
    """
    Generate 10 flashcards.

    Uses strict JSON and automatic retry.
    """

    prompt = f"""
You are a study flashcard generator.

Create exactly 10 useful flashcards
from the study notes below.

Return ONLY a valid JSON array.

EXACT FORMAT:

[
  {{
    "question": "What is ...?",
    "answer": "Short answer."
  }}
]

Rules:

1. Exactly 10 flashcards.
2. Use ONLY information from the notes.
3. Do NOT invent facts.
4. Questions should focus on important concepts.
5. Include important definitions.
6. Include important facts.
7. Include exam-relevant information.
8. Keep answers short.
9. Do NOT use markdown.
10. Do NOT add text outside JSON.
11. Return valid JSON only.

Study Notes:

{notes}
"""

    # ========================================================
    # FIRST ATTEMPT
    # ========================================================

    try:

        raw_output = call_ollama(
            prompt,
            model=model,
            max_tokens=700,
            json_mode=True
        )

        flashcards = parse_flashcards_from_text(
            raw_output
        )

        if flashcards:
            return flashcards[:15]

    except Exception:
        pass

    # ========================================================
    # RETRY
    # ========================================================

    retry_prompt = f"""
Create exactly 10 study flashcards.

Return ONLY valid JSON.

Use EXACTLY this format:

[
  {{
    "question": "Question",
    "answer": "Short answer"
  }}
]

Rules:
- No markdown.
- No explanations outside JSON.
- No extra text.
- Use ONLY the study notes.
- Do not invent information.
- Exactly 10 cards.

Study Notes:

{notes}
"""

    try:

        raw_output = call_ollama(
            retry_prompt,
            model=model,
            max_tokens=700,
            json_mode=True
        )

        flashcards = parse_flashcards_from_text(
            raw_output
        )

        if flashcards:
            return flashcards[:15]

    except Exception as e:

        raise ValueError(
            f"Flashcard generation failed: {str(e)}"
        )

    raise ValueError(
        "Could not generate flashcards. "
        "Please try generating again."
    )