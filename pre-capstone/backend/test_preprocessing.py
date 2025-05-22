import cv2
import numpy as np
import pytesseract
import matplotlib.pyplot as plt
import sys
from PIL import Image

def test_preprocessing(image_path):
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Could not load image from {image_path}")
        return
    
    # Original image
    plt.figure(figsize=(15, 10))
    plt.subplot(2, 2, 1)
    plt.title("Original")
    plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    
    # Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    plt.subplot(2, 2, 2)
    plt.title("Grayscale")
    plt.imshow(gray, cmap='gray')
    
    # Blurred
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    plt.subplot(2, 2, 3)
    plt.title("Blurred")
    plt.imshow(blurred, cmap='gray')
    
    # Thresholded
    threshed = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                    cv2.THRESH_BINARY, 11, 2)
    plt.subplot(2, 2, 4)
    plt.title("Thresholded")
    plt.imshow(threshed, cmap='gray')
    
    plt.tight_layout()
    plt.savefig('preprocessing_steps.png')
    print(f"Saved visualization to preprocessing_steps.png")
    
    # Perform OCR on original and preprocessed images
    original_text = pytesseract.image_to_string(Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
    processed_text = pytesseract.image_to_string(Image.fromarray(threshed))
    
    print("\nOriginal Image OCR:\n", original_text)
    print("\nPreprocessed Image OCR:\n", processed_text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_preprocessing.py <path_to_image>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    test_preprocessing(image_path)