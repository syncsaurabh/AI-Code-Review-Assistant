from fastapi import APIRouter, HTTPException, status
from app.models.review import ReviewRequest, ReviewResponse
from app.services.review_service import ReviewService

router = APIRouter(prefix="/api/v1", tags=["review"])
review_service = ReviewService()

@router.post(
    "/review",
    response_model=ReviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Review submitted source code",
    description="Analyze source code for code quality, security, performance, and best practices using Gemini LLM."
)
async def review_code(request: ReviewRequest):
    try:
        return await review_service.review_code(request)
    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail=str(e)
        )
    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze code: {str(e)}"
        )
