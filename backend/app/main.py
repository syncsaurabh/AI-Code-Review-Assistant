import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables on startup
load_dotenv()

app = FastAPI(
    title="AI Code Review Assistant",
    description="Backend API for reviewing source code using Google Gemini LLM",
    version="1.0.0",
)

# Configure CORS
# We read origins from the environment or default to common development origins.
frontend_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,https://ai-code-review-assistant-s.netlify.app").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers.review import router as review_router
app.include_router(review_router)

@app.get("/health")
def health_check():
    """Health check endpoint to verify that the API is running."""
    return {
        "status": "healthy",
        "message": "AI Code Review Assistant API is running"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
