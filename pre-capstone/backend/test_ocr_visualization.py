import requests
import json
import sys
import base64
import cv2
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

def test_ocr_visualization(image_path):
    url = 'http://localhost:5000/process-image'
    
    # Prepare the files and data
    files = {'image': open(image_path, 'rb')}
    data = {'type': 'ocr'}
    
    # Send the request
    response = requests.post(url, files=files, data=data)
    
    # Print the response
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        
        if result['success']:
            # Display extracted data
            print("\nExtracted Data:")
            for key, value in result['data']['extracted'].items():
                print(f"  {key}: {value}")
            
            # Display the annotated image
            if 'annotated_image' in result['data']:
                annotated_img = base64.b64decode(result['data']['annotated_image'])
                nparr = np.frombuffer(annotated_img, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                plt.figure(figsize=(10, 8))
                plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                plt.title("OCR Results with Bounding Boxes")
                plt.axis('off')
                plt.savefig('ocr_annotated.png')
                print("\nSaved annotated image to ocr_annotated.png")
                plt.show()  # Add this line to display the image
            
            # Display the debug image
            if 'debug_image' in result['data']:
                debug_img = base64.b64decode(result['data']['debug_image'])
                nparr = np.frombuffer(debug_img, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                plt.figure(figsize=(12, 10))
                plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                plt.title("OCR Processing Steps")
                plt.axis('off')
                plt.savefig('ocr_debug.png')
                print("Saved debug image to ocr_debug.png")
                plt.show()  # Add this line to display the image
        else:
            print("\nError:", result.get('error', 'Unknown error'))
    else:
        print("\nRequest failed with status code:", response.status_code)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ocr_visualization.py <path_to_image>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    test_ocr_visualization(image_path)