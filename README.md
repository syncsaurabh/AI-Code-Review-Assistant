# AI Code Review Assistant

A modern, full-stack, developer-focused web application that evaluates source code for bugs, security vulnerabilities, performance bottlenecks, and style issues, and generates refactored improvements. Powered by **FastAPI** on the backend, **React + TypeScript + Vite** on the frontend, and the official **Google Gemini GenAI SDK** for advanced code review analysis.

---

## Features

- **Circular Code Quality Gauge**: SVG progress indicator visually scaling overall code quality from 0 to 100.
- **Detailed Findings Categories**: Split findings into Security, Performance, and Best Practices.
- **Severity Badge System**: Highlights issue gravity using Critical, High, Medium, Low, and Info indicators.
- **Actionable Suggestions & Previews**: Expand cards to see detailed explanations alongside syntax-highlighted code recommendations.
- **Refactored Code Viewer**: Visualizes the fully optimized code block side-by-side or in full screen with a one-click clipboard copy feature.
- **Prepopulated Presets**: Code sample presets for Python, JavaScript, TypeScript, Java, C++, and Go containing typical code issues to make testing instant.
- **Healthy Status Indicator**: Tracks FastAPI backend status and visualizes connection health dynamically.

---

## Project Structure

```text
AI-Code-Review-Assistant/
├── backend/                  # FastAPI Backend API
│   ├── app/
│   │   ├── models/           # Pydantic schemas (review.py)
│   │   ├── routers/          # FastAPI routers (review.py)
│   │   ├── services/         # Services (gemini.py, review_service.py)
│   │   ├── config.py         # App configuration
│   │   └── main.py           # Application Entrypoint
│   ├── tests/                # Unit & Integration Tests (pytest)
│   ├── venv/                 # Python virtual environment
│   ├── .env                  # Environment secrets (GEMINI_API_KEY)
│   └── requirements.txt      # Python dependencies
└── frontend/                 # React TypeScript SPA (Vite)
    ├── src/
    │   ├── App.tsx           # React Core Logic & Layout
    │   ├── index.css         # Custom CSS Design System
    │   └── main.tsx          # React application entrypoint
    ├── index.html            # HTML layout (SEO optimized)
    ├── package.json          # Node dependencies
    └── vite.config.ts        # Vite build config
```

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js v18+ and npm

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Configure Environment Variables**:
   Open `.env` and set your Gemini API key (obtained from Google AI Studio):
   ```env
   LLM_API_KEY=your_gemini_api_key_here
   LLM_MODEL=gemini-2.5-flash
   ```

3. **Start the FastAPI server**:
   The virtual environment is already set up. Simply run:
   ```bash
   .\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend API will be running at `http://127.0.0.1:8000`. You can check the health check status at `http://127.0.0.1:8000/health`.

4. **Run Backend Tests**:
   To execute the test suite (health checks, validation errors, and mocked API reviews):
   ```bash
   .\venv\Scripts\pytest tests
   ```

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node Packages**:
   ```bash
   npm install
   ```

3. **Start the Frontend Development Server**:
   ```bash
   npm run dev -- --port 5173 --host 127.0.0.1
   ```
   Open your browser and navigate to `http://127.0.0.1:5173/` to use the assistant!

---

## API Specifications

### `POST /api/v1/review`
Reviews a block of source code.

**Request Body**:
```json
{
  "code": "def calculate(x):\n    return x*2",
  "language": "python"
}
```

**Response Body**:
```json
{
  "score": 90,
  "summary": "Overall clean function. Made spacing idiomatic.",
  "issues": [],
  "security": [],
  "performance": [],
  "best_practices": [
    {
      "severity": "info",
      "category": "best-practice",
      "title": "Adhere to PEP 8 spacing",
      "description": "Missing whitespace around arithmetic operators.",
      "line": 2,
      "suggestion": "return x * 2"
    }
  ],
  "improved_code": "def calculate(x):\n    return x * 2"
}
```
