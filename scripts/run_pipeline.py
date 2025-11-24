import sys
import os
import json
import requests

# Add project root to path to import backend modules if needed, 
# but we will use the API if running, or direct import if not.
# For this script, let's use direct import to be standalone without running server.
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.classifier import EmailClassifier
from backend.data_manager import DataManager

def run_pipeline():
    print("Initializing Pipeline...")
    data_manager = DataManager()
    classifier = EmailClassifier()
    
    customers = data_manager.get_customers()
    print(f"Found customers: {customers}")
    
    total_emails = 0
    correct_predictions = 0
    
    for customer in customers:
        print(f"\n--- Processing Customer: {customer} ---")
        valid_tags = data_manager.get_valid_tags(customer)
        emails = data_manager.get_emails(customer)
        
        print(f"Valid Tags: {valid_tags}")
        
        for email in emails:
            total_emails += 1
            text = f"{email['subject']} {email['body']}"
            ground_truth = email['ground_truth_tag']
            
            prediction = classifier.predict(text, customer, valid_tags)
            predicted_tag = prediction['tag']
            
            is_correct = predicted_tag == ground_truth
            if is_correct:
                correct_predictions += 1
            
            status = "✅" if is_correct else "❌"
            print(f"Email ID: {email['id']} | GT: {ground_truth} | Pred: {predicted_tag} {status}")
            if not is_correct:
                print(f"   -> Text: {text[:50]}...")
                print(f"   -> Explanation: {prediction.get('explanation')}")

    accuracy = (correct_predictions / total_emails) * 100 if total_emails > 0 else 0
    print(f"\n========================================")
    print(f"Total Emails: {total_emails}")
    print(f"Accuracy: {accuracy:.2f}%")
    print(f"========================================")

if __name__ == "__main__":
    run_pipeline()
