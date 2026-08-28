import asyncio
import json
from google import genai
from google.genai import types
from app.config import settings
from app.models.review import ReviewResponse

class GeminiService:
    def __init__(self):
        if not settings.is_api_key_configured:
            self.client = None
        else:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def analyze_code(self, code: str, language: str) -> ReviewResponse:

        if not self.client:
            raise ValueError(
                "Gemini API key is not configured. Please set GEMINI_API_KEY or LLM_API_KEY in your backend/.env file."
            )

        prompt = f"""
You are an expert software engineer and senior code reviewer.
Perform a thorough code review of the following {language} code.

Source Code:
```{language}
{code}
```

Identify bugs, security vulnerabilities, performance bottlenecks, and style or best-practice issues.
Provide your response in JSON format matching the schema requested.

Your JSON response MUST follow these rules:
1. 'score': Integer from 0 to 100 representing overall code quality.
2. 'summary': Detailed high-level summary of the findings.
3. 'issues': List of general code issues, logic bugs, code-quality, or maintainability violations.
4. 'security': List of security findings (e.g. injection, data leaks, improper validation).
5. 'performance': List of performance optimization suggestions.
6. 'best_practices': List of style, idiomatic coding, or readability improvements.
7. 'improved_code': Complete, refactored version of the code that resolves all identified issues.

For each issue under `issues`, `security`, `performance`, or `best_practices`, you must specify:
- 'severity': critical, high, medium, low, info
- 'category': bug, security, performance, code-quality, maintainability, best-practice
- 'title': concise title of the issue
- 'description': detailed analysis of what is wrong
- 'line': line number (1-based index) of the issue, or null if it applies to the whole code block
- 'suggestion': actionable code fix or improvement suggestion
"""


        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ReviewResponse,
            )
        )

        if not response.text:
            raise RuntimeError("Received empty response from Gemini API")


        data = json.loads(response.text)
        return ReviewResponse(**data)
