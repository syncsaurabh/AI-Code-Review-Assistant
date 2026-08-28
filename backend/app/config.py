import os
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

class Settings:
    # Read GEMINI_API_KEY, fallback to LLM_API_KEY if specified
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("LLM_API_KEY", "")).strip()
    
    # Read GEMINI_MODEL, fallback to LLM_MODEL, default to gemini-2.5-flash
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", os.getenv("LLM_MODEL", "gemini-2.5-flash")).strip()

    @property
    def is_api_key_configured(self) -> bool:
        """Check if a valid Gemini API key is configured."""
        placeholders = {"your_api_key_here", "your_gemini_api_key_here", ""}
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY not in placeholders)

settings = Settings()
