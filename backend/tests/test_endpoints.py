import pytest
from unittest.mock import AsyncMock, patch
from app.models.review import ReviewResponse

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "message": "AI Code Review Assistant API is running"
    }

@patch("app.services.gemini.GeminiService.analyze_code", new_callable=AsyncMock)
def test_review_success(mock_analyze_code, client):

    mock_response = ReviewResponse(
        score=85,
        summary="Overall good code with minor optimization opportunities.",
        issues=[
            {
                "severity": "medium",
                "category": "code-quality",
                "title": "Use descriptive variable names",
                "description": "Variable 'x' is too short and non-descriptive.",
                "line": 3,
                "suggestion": "Rename 'x' to 'user_count'."
            }
        ],
        security=[],
        performance=[],
        best_practices=[],
        improved_code="def calculate_total():\n    user_count = 10\n    return user_count * 5"
    )
    mock_analyze_code.return_value = mock_response

    request_data = {
        "code": "def calculate_total():\n    x = 10\n    return x * 5",
        "language": "python"
    }
    response = client.post("/api/v1/review", json=request_data)
    
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["score"] == 85
    assert json_data["summary"] == "Overall good code with minor optimization opportunities."
    assert len(json_data["issues"]) == 1
    assert json_data["issues"][0]["title"] == "Use descriptive variable names"
    assert json_data["improved_code"] == "def calculate_total():\n    user_count = 10\n    return user_count * 5"
    mock_analyze_code.assert_called_once_with(request_data["code"], "python")

def test_review_validation_error(client):

    request_data = {
        "code": "",
        "language": "python"
    }
    response = client.post("/api/v1/review", json=request_data)
    assert response.status_code == 422


    request_data = {
        "code": "print('hello')",
        "language": "assembly"
    }
    response = client.post("/api/v1/review", json=request_data)
    assert response.status_code == 422

@patch("app.services.gemini.GeminiService.analyze_code", new_callable=AsyncMock)
def test_review_service_config_error(mock_analyze_code, client):

    mock_analyze_code.side_effect = ValueError("Gemini API key is not configured.")

    request_data = {
        "code": "print('hello')",
        "language": "python"
    }
    response = client.post("/api/v1/review", json=request_data)
    assert response.status_code == 412
    assert response.json()["detail"] == "Gemini API key is not configured."

@patch("app.services.gemini.GeminiService.analyze_code", new_callable=AsyncMock)
def test_review_service_general_error(mock_analyze_code, client):

    mock_analyze_code.side_effect = RuntimeError("API Call failed")

    request_data = {
        "code": "print('hello')",
        "language": "python"
    }
    response = client.post("/api/v1/review", json=request_data)
    assert response.status_code == 500
    assert "Failed to analyze code" in response.json()["detail"]
