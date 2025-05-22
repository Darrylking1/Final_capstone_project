import json

response = {
    "success": True,
    "message": "Verification successful",
    "details": [
        "ID card data matches form data",
        "Face match confidence: 98%",
        "OCR confidence: 95%"
    ],
    "ocrDetails": [
        {"field": "Surname", "value": "KING"},
        {"field": "First Names", "value": "DARRYL LAUD ABOAGYE"},
        {"field": "Nationality", "value": "GHANAIAN"},
        {"field": "Gender", "value": "M"},
        {"field": "Date of Birth", "value": "09/07/2003"},
        {"field": "Personal ID No", "value": "GHA-719819958-0"},
        {"field": "Place of Issuance", "value": "ACCRA"},
        {"field": "Date of Issue", "value": "08/02/2020"},
        {"field": "Date of Expiry", "value": "07/02/2030"}
    ],
    "facialDetails": [
        "Face successfully matched",
        "No anomalies detected"
    ],
    "confidence": 0.815,
    "processing_time_seconds": 6.2
}

print("=== Simulated Backend JSON Response ===")
print(json.dumps(response, indent=2))