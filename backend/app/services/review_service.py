from app.models.review import ReviewRequest, ReviewResponse
from app.services.gemini import GeminiService

class ReviewService:
    def __init__(self):
        self.gemini_service = GeminiService()

    async def review_code(self, request: ReviewRequest) -> ReviewResponse:
        return await self.gemini_service.analyze_code(request.code, request.language)
