import requests
import json
import sys

def test_ocr(image_path):
    url = 'http://localhost:5000/process-image'
    
    # Prepare the files and data
    files = {'image': open(image_path, 'rb')}
    data = {'type': 'ocr'}
    
    # Send the request
    response = requests.post(url, files=files, data=data)
    
    # Print the response
    print(f"Status Code: {response.status_code}")
    print("Response:")
    print(json.dumps(response.json(), indent=2))
    
    return response.json()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ocr.py <path_to_image>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    test_ocr(image_path)