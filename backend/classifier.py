import random
import re
from typing import List, Dict

class EmailClassifier:
    def __init__(self):
        # Anti-patterns: Words that might mislead the model or require specific handling
        self.anti_patterns = {
            "urgent": "Bug",  # Example: "Urgent" often implies Bug or Account Issue
            "crash": "Bug",
            "invoice": "Billing",
            "return": "Return",
            "size": "Size Issue",
            "shipping": "Shipping",
            "feature": "Feature Request"
        }

    def predict(self, email_text: str, customer_id: str, valid_tags: List[str]) -> Dict:
        """
        Predicts the tag for an email ensuring customer isolation.
        """
        if not valid_tags:
            return {"tag": "Unknown", "confidence": 0.0, "source": "No valid tags"}

        # 1. Pattern Matching (Guardrails/Anti-patterns)
        # Check for strong keywords that map to valid tags for this customer
        text_lower = email_text.lower()
        for keyword, tag in self.anti_patterns.items():
            if keyword in text_lower and tag in valid_tags:
                return {
                    "tag": tag,
                    "confidence": 0.95,
                    "source": "Pattern Matching",
                    "explanation": f"Found keyword '{keyword}' which strongly indicates '{tag}'."
                }

        # 2. Mock LLM Classification
        # In a real system, this would call OpenAI/Gemini with the valid_tags list
        # ensuring the model ONLY chooses from valid_tags.
        
        # Simulating LLM response
        predicted_tag = self._mock_llm_predict(email_text, valid_tags)
        
        return {
            "tag": predicted_tag,
            "confidence": 0.85,
            "source": "Mock LLM",
            "explanation": "LLM analyzed the context and selected the most likely tag."
        }

    def _mock_llm_predict(self, text: str, valid_tags: List[str]) -> str:
        # Simple heuristic for the mock: match words in text to tags
        text_lower = text.lower()
        for tag in valid_tags:
            if tag.lower() in text_lower:
                return tag
        
        # Fallback to random valid tag
        return random.choice(valid_tags)
