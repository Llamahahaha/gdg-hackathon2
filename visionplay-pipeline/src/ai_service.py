import httpx
import logging
import json
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("ai-service")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

class AIService:
    @staticmethod
    async def generate_response(prompt: str, model: str = "llama3.2"):
        """
        Generates a text response using Ollama.
        """
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False
                    }
                )
                result = response.json()
                return result.get("response", "").strip()
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            return None

    @staticmethod
    async def get_embeddings(text: str, model: str = "nomic-embed-text"):
        """
        Generates embeddings for a given text using Ollama.
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{OLLAMA_BASE_URL}/api/embeddings",
                    json={
                        "model": model,
                        "prompt": text
                    }
                )
                result = response.json()
                return result.get("embedding", [])
        except Exception as e:
            logger.error(f"Ollama embedding failed: {e}")
            return []

    @staticmethod
    async def analyze_tactics(metrics: dict):
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
