from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from .data_manager import DataManager
from .classifier import EmailClassifier

app = FastAPI(title="Hiver Email Tagging System")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data_manager = DataManager()
classifier = EmailClassifier()

class PredictionRequest(BaseModel):
    email_text: str
    customer_id: str

class PredictionResponse(BaseModel):
    tag: str
    confidence: float
    source: str
    explanation: Optional[str] = None

@app.get("/api")
def read_root():
    return {"message": "Email Tagging API is running"}

@app.get("/api/customers")
def get_customers():
    return {"customers": data_manager.get_customers()}

@app.get("/api/emails")
def get_emails(customer_id: Optional[str] = None):
    return {"emails": data_manager.get_emails(customer_id)}

@app.post("/api/predict", response_model=PredictionResponse)
def predict_tag(request: PredictionRequest):
    valid_tags = data_manager.get_valid_tags(request.customer_id)
    if not valid_tags:
        raise HTTPException(status_code=404, detail="Customer not found or no tags defined")
    
    result = classifier.predict(request.email_text, request.customer_id, valid_tags)
    return result


