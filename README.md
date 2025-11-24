# Hiver Email Tagging Mini-System

## Approach
This system implements a customer-isolated email tagging solution using a mock LLM and pattern matching guardrails.

### Key Features
1.  **Customer Isolation**:
    - The system strictly enforces isolation by requiring a `customer_id` for every prediction.
    - Valid tags are loaded specifically for the requested customer from `customer_config.json`.
    - The classifier never considers tags from other customers.

2.  **Hybrid Classification**:
    - **Pattern Matching (High Confidence)**: Checks for specific keywords (anti-patterns) that strongly indicate a specific tag (e.g., "urgent" -> "Bug"). This acts as a guardrail against LLM hallucinations.
    - **Mock LLM (Baseline)**: If no strong pattern is found, it falls back to a simulated LLM (keyword heuristic + random choice from valid tags) to mimic a generative model's behavior.

3.  **Full-Stack MVP**:
    - **Backend**: FastAPI for serving predictions and data.
    - **Frontend**: React (Vite) for an interactive dashboard to test the system.

## Project Structure
- `backend/`: FastAPI application (`main.py`, `classifier.py`, `data_manager.py`).
- `frontend/`: React application.
- `data/`: Mock dataset and configuration.
- `scripts/`: Standalone pipeline script.

## How to Run

### Prerequisites
- Python 3.8+
- Node.js 14+

### 1. Setup Backend
```bash
pip install -r requirements.txt
cd backend
uvicorn main:app --reload
```
The API will run at `http://localhost:8000`.

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
The UI will run at `http://localhost:5173`.

### 3. Run Standalone Pipeline
To verify the accuracy and isolation without the UI:
```bash
python scripts/run_pipeline.py
```

## Error Analysis
- **Ambiguity**: Some emails might contain keywords for multiple tags (e.g., "urgent return"). The current pattern matcher takes the first match. A real LLM would handle this context better.
- **Mock Limitations**: The mock LLM is simple. In production, this would be replaced by a prompt-based classifier (e.g., GPT-4) with few-shot examples from the specific customer's history.
