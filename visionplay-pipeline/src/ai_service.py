import httpx
import logging
import json
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("ai-service")

# ── Groq API ─────────────────────────────────────────────────────────
# Set GROQ_API_KEY in your Railway environment variables.
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.2-90b-text-preview")  # Or 'llama3-8b-8192' or 'llama-3.2-3b-preview'
GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions"


class AIService:
    @staticmethod
    async def generate_response(prompt: str, json_mode: bool = False) -> str | None:
        """
        Generates a text response using Groq (OpenAI-compatible REST API).
        Falls back gracefully if no API key is set.
        """
        api_key = os.getenv("GROQ_API_KEY", "")
        # Llama 3.2 3B is blazing fast and handles JSON well. You can also use 90b.
        model_name = os.getenv("GROQ_MODEL", "llama-3.2-3b-preview")
        
        if not api_key:
            logger.warning("GROQ_API_KEY not set — AI features disabled.")
            return None

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        body = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": "You are FieldTheory AI, an elite tactical football analyst."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 1024,
        }

        # Request JSON output when needed (e.g. audit reports)
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        try:
            logger.info(f"Querying Groq ({model_name})...")
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(GROQ_BASE_URL, headers=headers, json=body)
                response.raise_for_status()
                result = response.json()

                choices = result.get("choices", [])
                if choices:
                    text = choices[0].get("message", {}).get("content", "").strip()
                    logger.info(f"Groq response received: {text[:80]}...")
                    return text

                logger.warning("Groq returned empty choices.")
                return None

        except httpx.HTTPStatusError as e:
            err_msg = f"Groq API error {e.response.status_code}: {e.response.text[:200]}"
            logger.error(err_msg)
            raise Exception(err_msg)
        except Exception as e:
            logger.error(f"Groq generation failed: {e}")
            raise Exception(str(e))

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
