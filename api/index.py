import os
import json
import re
import time
from typing import Any, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="JobPilot Backend API",
    description="FastAPI backend for JobPilot AI analysis and cover letter generation",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_gemini_api_key() -> str:
    """Retrieve Gemini API key from environment variables."""
    return (
        os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GOOGLE_API_KEY")
        or os.environ.get("VITE_GEMINI_API_KEY")
        or ""
    ).strip()


def call_gemini_api(prompt: str, max_retries: int = 5) -> str:
    """Call Google Gemini API with retries on service overload."""
    api_key = get_gemini_api_key()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in Vercel Environment Variables.",
        )

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={api_key}"
    )
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ]
    }

    attempts = 0
    response = None
    while attempts < max_retries:
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=45)
            if res.status_code == 200:
                response = res.json()
                break
            elif res.status_code == 503 or res.json().get("error", {}).get("status") == "UNAVAILABLE":
                attempts += 1
                time.sleep(2)
            else:
                error_detail = res.json().get("error", {}).get("message", res.text)
                raise HTTPException(
                    status_code=res.status_code,
                    detail=f"Gemini API error: {error_detail}",
                )
        except requests.RequestException as e:
            attempts += 1
            if attempts >= max_retries:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Failed to communicate with Gemini API: {str(e)}",
                )
            time.sleep(2)

    if not response:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API overloaded or timed out. Please try again later.",
        )

    candidates = response.get("candidates", [])
    if not candidates:
        return ""

    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        return ""

    return parts[0].get("text", "")


# Pydantic Schemas
class AnalyzeRequest(BaseModel):
    jobDescription: str
    resumeText: str


class CoverLetterRequest(BaseModel):
    jobDescription: str
    resumeText: str
    analysis: Optional[Any] = None


# Routes - mapped to both /api/* and /* so requests always resolve
@app.get("/api")
@app.get("/")
def read_root():
    api_key = get_gemini_api_key()
    return {
        "status": "ok",
        "service": "JobPilot Backend API (FastAPI on Vercel)",
        "geminiConfigured": bool(api_key),
    }


@app.get("/api/health")
@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/analyze")
@app.post("/analyze")
def analyze_application(req: AnalyzeRequest):
    if not req.jobDescription.strip() or not req.resumeText.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both jobDescription and resumeText are required.",
        )

    prompt = f"""
You are a job application assistant. Analyze the following resume against the job description.
ONLY return a JSON. Do not explain anything. Do not add any commentary. Format strictly like:
{{
  "score": 87,
  "strengths": [...],
  "improvements": [...],
  "detailedTips": [{{"section": "Experience", "advice": "..."}}]
}}

Job Description:
{req.jobDescription}

Resume:
{req.resumeText}
"""

    text = call_gemini_api(prompt, max_retries=5)
    json_match = re.search(r"\{[\s\S]*\}", text)
    if json_match:
        try:
            analysis = json.loads(json_match.group(0))
        except json.JSONDecodeError:
            analysis = {"error": "Could not parse AI response", "raw": text}
    else:
        analysis = {"error": "No JSON found in AI response", "raw": text}

    return analysis


@app.post("/api/cover-letter")
@app.post("/cover-letter")
def generate_cover_letter(req: CoverLetterRequest):
    if not req.jobDescription.strip() or not req.resumeText.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both jobDescription and resumeText are required.",
        )

    analysis_str = json.dumps(req.analysis or {})
    prompt = f"""
You are a professional job application assistant. Based on the following job description and resume, and the analysis provided, write a personalized cover letter for this job application. The cover letter should be concise, professional, and highlight the candidate's strengths relevant to the job. Do not include any commentary or explanation, just the cover letter text.

Job Description:
{req.jobDescription}

Resume:
{req.resumeText}

Analysis:
{analysis_str}
"""

    cover_letter = call_gemini_api(prompt, max_retries=3)
    return {"coverLetter": cover_letter}

