from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class CodeReviewIssue(BaseModel):
    severity: str = Field(
        ...,
        description="Severity of the issue (critical, high, medium, low, info)"
    )
    category: str = Field(
        ...,
        description="Category of the issue (bug, security, performance, code-quality, maintainability, best-practice)"
    )
    title: str = Field(..., description="Short title describing the issue")
    description: str = Field(..., description="Detailed description of why this is an issue")
    line: Optional[int] = Field(None, description="The specific line number where the issue occurs, if applicable")
    suggestion: str = Field(..., description="Actionable suggestion on how to fix the issue")

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        allowed = {"critical", "high", "medium", "low", "info"}
        normalized = v.strip().lower()
        if normalized not in allowed:
            return "info"
        return normalized

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        allowed = {"bug", "security", "performance", "code-quality", "maintainability", "best-practice"}
        normalized = v.strip().lower()
        if normalized not in allowed:
            return "code-quality"
        return normalized


class ReviewRequest(BaseModel):
    code: str = Field(..., description="The source code to analyze")
    language: str = Field(..., description="Programming language of the source code")

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Source code must not be empty")
        return v

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        supported_languages = {"python", "javascript", "typescript", "java", "c++", "go"}
        normalized = v.strip().lower()
        
        # Handle common aliases/alternatives
        if normalized == "cpp":
            normalized = "c++"
        elif normalized == "js":
            normalized = "javascript"
        elif normalized == "ts":
            normalized = "typescript"
            
        if normalized not in supported_languages:
            raise ValueError(
                f"Unsupported language: '{v}'. Supported languages: {', '.join(sorted(supported_languages))}"
            )
        return normalized


class ReviewResponse(BaseModel):
    score: int = Field(..., description="Overall code quality score from 0 to 100")
    summary: str = Field(..., description="General summary of the code review")
    issues: List[CodeReviewIssue] = Field(default_factory=list, description="General code issues found")
    security: List[CodeReviewIssue] = Field(default_factory=list, description="Security findings")
    performance: List[CodeReviewIssue] = Field(default_factory=list, description="Performance suggestions")
    best_practices: List[CodeReviewIssue] = Field(default_factory=list, description="Best practice recommendations")
    improved_code: str = Field(..., description="Optimized/improved version of the submitted code")

    @field_validator("score")
    @classmethod
    def validate_score(cls, v: int) -> int:
        if v < 0 or v > 100:
            raise ValueError("Score must be between 0 and 100")
        return v
