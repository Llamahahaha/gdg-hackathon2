import httpx
import logging
import json
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("ai-service")

# ── Google Gemini API ─────────────────────────────────────────────────────────
# Set GEMINI_API_KEY in your Railway environment variables.
# Free tier: 15 RPM, no credit card required.
# Get your key at: https://aistudio.google.com/apikey
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"


class AIService:
    @staticmethod
    async def generate_response(prompt: str, json_mode: bool = False) -> str | None:
        """
        Generates a text response using Google Gemini API.
        Falls back gracefully if no API key is set.
        """
        if not GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not set — AI features disabled.")
            return None

        url = f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

        body = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
            }
        }

        # Request JSON output when needed (e.g. audit reports)
        if json_mode:
            body["generationConfig"]["responseMimeType"] = "application/json"

        try:
            logger.info(f"Querying Gemini ({GEMINI_MODEL})...")
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=body)
                response.raise_for_status()
                result = response.json()

                # Extract text from Gemini response structure
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        text = parts[0].get("text", "").strip()
                        logger.info(f"Gemini response received: {text[:80]}...")
                        return text

                logger.warning("Gemini returned empty candidates.")
                return None

        except httpx.HTTPStatusError as e:
            logger.error(f"Gemini API error {e.response.status_code}: {e.response.text[:200]}")
            return None
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            return None

    @staticmethod
    async def analyze_tactics(metrics: dict) -> str | None:
        """
        Specific helper for tactical analysis.
        """
        prompt = f"""
        System Analysis: Football Spatio-Temporal Graph
        Metrics: {json.dumps(metrics)}
        
        Task: Identify the single most critical structural vulnerability and provide a tactical counter-measure.
        Tone: Professional, Elite Coach.
        """
        return await AIService.generate_response(prompt)
