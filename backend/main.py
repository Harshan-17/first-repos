import io
import json
import os
import re
from typing import Any, Dict, List, Literal

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from PIL import Image
from pydantic import BaseModel

try:
    import pytesseract
except Exception:
    pytesseract = None

try:
    import fitz
except Exception:
    fitz = None

app = FastAPI(title="MedMemory AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    role: Literal["doctor", "patient"]
    name: str


class TimelineItem(BaseModel):
    year: str
    event: str


class AnalysisResult(BaseModel):
    disease: str
    medication: str
    risk: str
    timeline: List[TimelineItem]
    prior_episodes: List[str]
    treatment_response: str
    medication_history: List[str]
    risk_signals: List[str]
    care_insight: str


DEMO_USERS = {
    "doctor@medmemory.ai": {"password": "doctor123", "role": "doctor", "name": "Dr. Sarah Lee"},
    "patient@medmemory.ai": {"password": "patient123", "role": "patient", "name": "John Carter"},
}


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    fallback_text = (
        "Patient diagnosed with Diabetes in 2022 with recurrent high HbA1c episodes. "
        "Started Metformin in 2023 with partial response. In 2024, persistent high sugar "
        "and missed follow-ups increased risk."
    )

    if not file_bytes:
        return fallback_text

    name = filename.lower()
    if name.endswith(".pdf"):
        if fitz:
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                text = "\n".join([p.get_text("text").strip() for p in doc if p.get_text("text").strip()])
                if text:
                    return text
            except Exception:
                pass
        if pytesseract and fitz:
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                pix = doc[0].get_pixmap(dpi=200)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                text = pytesseract.image_to_string(img)
                if text.strip():
                    return text.strip()
            except Exception:
                pass
        return fallback_text

    if pytesseract:
        try:
            img = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(img)
            if text.strip():
                return text.strip()
        except Exception:
            pass

    return fallback_text


def safe_json_parse(raw_text: str) -> Dict[str, Any]:
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw_text, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


def analyze_with_ai(text: str) -> Dict[str, Any]:
    fallback = {
        "disease": "Diabetes",
        "medication": "Metformin",
        "risk": "High",
        "timeline": [
            {"year": "2022", "event": "Diagnosed with diabetes"},
            {"year": "2023", "event": "Medication started (Metformin)"},
            {"year": "2024", "event": "High sugar and missed reviews"},
        ],
        "prior_episodes": ["Repeated high HbA1c", "Frequent hyperglycemia"],
        "treatment_response": "Partial response to oral medication; monitoring required.",
        "medication_history": ["Metformin initiated", "Dose adherence inconsistent"],
        "risk_signals": ["Persistent glucose elevation", "Missed follow-ups"],
        "care_insight": "High-risk trend: reinforce follow-up adherence and lab surveillance.",
    }

    key = os.getenv("OPENAI_API_KEY", "")
    if not key:
        return fallback

    prompt = (
        "You are MedMemory AI, an AI analyzer for longitudinal patient memory. "
        "Extract clinically relevant context from the report text. Return ONLY JSON with keys: "
        "disease, medication, risk, timeline, prior_episodes, treatment_response, medication_history, risk_signals, care_insight. "
        "timeline max 3 items; each item has year and event. Keep concise and factual.\n\n"
        f"Report text:\n{text}"
    )

    try:
        client = OpenAI(api_key=key)
        response = client.responses.create(model="gpt-4.1-mini", input=prompt, temperature=0)
        parsed = safe_json_parse(response.output_text.strip())
        timeline = [i for i in parsed.get("timeline", []) if isinstance(i, dict)][:3]
        return {
            "disease": str(parsed.get("disease", fallback["disease"])),
            "medication": str(parsed.get("medication", fallback["medication"])),
            "risk": str(parsed.get("risk", fallback["risk"])),
            "timeline": [{"year": str(i.get("year", "N/A")), "event": str(i.get("event", "Unknown"))} for i in timeline] or fallback["timeline"],
            "prior_episodes": [str(x) for x in parsed.get("prior_episodes", fallback["prior_episodes"])][:4],
            "treatment_response": str(parsed.get("treatment_response", fallback["treatment_response"])),
            "medication_history": [str(x) for x in parsed.get("medication_history", fallback["medication_history"])][:4],
            "risk_signals": [str(x) for x in parsed.get("risk_signals", fallback["risk_signals"])][:4],
            "care_insight": str(parsed.get("care_insight", fallback["care_insight"])),
        }
    except Exception:
        return fallback


@app.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    record = DEMO_USERS.get(payload.email.strip().lower())
    if not record or record["password"] != payload.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "token": f"demo-token-{record['role']}",
        "role": record["role"],
        "name": record["name"],
    }


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_report(file: UploadFile = File(...)):
    file_bytes = await file.read()
    text = extract_text_from_file(file_bytes, file.filename or "report")
    return analyze_with_ai(text)


@app.get("/")
def root():
    return {
        "status": "ok",
        "app": "MedMemory AI Analyzer",
        "demo_users": ["doctor@medmemory.ai / doctor123", "patient@medmemory.ai / patient123"],
    }
