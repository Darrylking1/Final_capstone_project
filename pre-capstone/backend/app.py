import os
import base64
import cv2
import numpy as np
# Try to import face_recognition, but make it optional
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    print("Warning: face_recognition module not available. Facial recognition features will be disabled.")
    FACE_RECOGNITION_AVAILABLE = False
    
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import pytesseract
from io import BytesIO
import re

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Remove duplicate imports
# import cv2
# import numpy as np
# from io import BytesIO

def process_ocr(image):
    try:
        # Convert to PIL Image if needed
        if isinstance(image, np.ndarray):
            image = Image.fromarray(image)
        
        # Extract text using Tesseract with improved configuration
        text = pytesseract.image_to_string(image, config='--psm 3')
        
        # For debugging: Get detailed OCR data with confidence scores
        ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        
        # Filter out low-confidence text
        filtered_text = []
        for i in range(len(ocr_data['text'])):
            if int(ocr_data['conf'][i]) > 60 and ocr_data['text'][i].strip():  # Only keep text with confidence > 60%
                filtered_text.append(ocr_data['text'][i])
        
        # Extract structured data from the OCR text
        extracted_data = extract_id_card_data(text)
        
        return {
            'success': True, 
            'data': {
                'text': text,
                'filtered_text': ' '.join(filtered_text),
                'extracted': extracted_data,
                'confidence': ocr_data['conf']
            }
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def extract_id_card_data(text):
    """Extract structured data from OCR text with improved patterns for Ghana IDs"""
    data = {
        'firstName': None,
        'lastName': None,
        'id_number': None,
        'nationality': None,
        'sex': None  # Added sex/gender field
    }
    
    # Print the raw OCR text for debugging
    print("Raw OCR Text:")
    print(text)
    print("-" * 50)
    
    # Split text into lines for better processing
    text_lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Print the lines for debugging
    print("Text lines:")
    for i, line in enumerate(text_lines):
        print(f"{i}: {line}")
    print("-" * 50)
    
    # Generic pattern for last name (all uppercase words)
    for line in text_lines:
        # Look for standalone uppercase words that might be last names
        if re.match(r'^[A-Z]+$', line) and len(line) > 1:
            data['lastName'] = line
            break
    
    # Generic pattern for first name
    for i, line in enumerate(text_lines):
        # Look for lines containing uppercase words that might be first names
        if re.match(r'^[A-Z]+(\s[A-Z]+)*$', line) and len(line) > 1:
            # Skip if this is the same as the last name
            if line != data['lastName']:
                # Extract the first name - take the first word if multiple words
                name_parts = line.split()
                if name_parts:
                    data['firstName'] = name_parts[0]
                break
    
    # If still no first name, look for lines after "FirstnamesiPrénoms" or similar labels
    if not data['firstName']:
        name_labels = ['Firstname', 'Prénoms', 'First name', 'Given name', 'Name']
        for i, line in enumerate(text_lines):
            if any(label in line for label in name_labels):
                # Check the next line(s)
                for j in range(i+1, min(i+3, len(text_lines))):
                    if j < len(text_lines) and re.match(r'^[A-Z]+(\s[A-Z]+)*$', text_lines[j]) and len(text_lines[j]) > 1:
                        # This might be the name line
                        name_parts = text_lines[j].split()
                        if name_parts:
                            data['firstName'] = name_parts[0]
                        break
                if data['firstName']:
                    break
    
    # Extract ID number - look for GHA pattern or other ID patterns
    id_patterns = [
        r'(GHA[-\s]?\d+[-\s]?\d*)',  # Ghana ID pattern
        r'(ID[-\s:]?\d+[-\s]?\d*)',  # Generic ID pattern
        r'(\d{9,})'                  # Any sequence of 9+ digits might be an ID
    ]
    
    for line in text_lines:
        for pattern in id_patterns:
            id_match = re.search(pattern, line)
            if id_match:
                data['id_number'] = id_match.group(1).replace(' ', '')
                break
        if data['id_number']:
            break
    
    # Extract nationality - look for common nationality indicators
    nationality_labels = ['Nationality', 'Nation', 'Citizen', 'Citizenship']
    
    # First try to find lines with nationality labels
    for i, line in enumerate(text_lines):
        if any(label.lower() in line.lower() for label in nationality_labels):
            # Check if "Ghanaian" is on the same line
            if 'ghanaian' in line.lower():
                data['nationality'] = 'Ghanaian'
                break
            elif 'ghana' in line.lower():
                data['nationality'] = 'Ghanaian'  # Convert Ghana to Ghanaian
                break
            
            # If not found on the same line, check the next line
            if not data['nationality'] and i+1 < len(text_lines):
                next_line = text_lines[i+1].lower()
                if 'ghanaian' in next_line:
                    data['nationality'] = 'Ghanaian'
                    break
                elif 'ghana' in next_line:
                    data['nationality'] = 'Ghanaian'  # Convert Ghana to Ghanaian
                    break
            
            # If still not found, look for any capitalized word in the next line
            if not data['nationality'] and i+1 < len(text_lines):
                next_line = text_lines[i+1]
                # Look for capitalized words that might be nationalities
                words = next_line.split()
                for word in words:
                    if word[0].isupper() and len(word) > 2 and word.lower() not in ['the', 'and', 'for', 'with']:
                        # If the word is Ghana, convert to Ghanaian
                        if word.lower() == 'ghana':
                            data['nationality'] = 'Ghanaian'
                        else:
                            data['nationality'] = word
                        break
            
            if data['nationality']:
                break
    
    # If still not found, look for common nationalities in all lines
    if not data['nationality']:
        for line in text_lines:
            line_lower = line.lower()
            if 'ghanaian' in line_lower:
                data['nationality'] = 'Ghanaian'
                break
            elif 'ghana' in line_lower and 'ghanaian' not in line_lower:
                data['nationality'] = 'Ghanaian'  # Convert Ghana to Ghanaian
                break
    
    # Extract sex/gender - look for common gender indicators
    gender_labels = ['Sex', 'Gender', 'Male', 'Female', 'M', 'F']
    
    # First try to find lines with gender labels
    for i, line in enumerate(text_lines):
        line_lower = line.lower()
        
        # Check for gender label followed by value
        if any(label.lower() in line_lower for label in gender_labels[:2]):  # Sex or Gender
            # Check if gender is on the same line
            if 'male' in line_lower and 'female' not in line_lower:
                data['sex'] = 'Male'
                break
            elif 'female' in line_lower:
                data['sex'] = 'Female'
                break
            elif ' m ' in f' {line_lower} ' or line_lower.endswith(' m'):
                data['sex'] = 'Male'
                break
            elif ' f ' in f' {line_lower} ' or line_lower.endswith(' f'):
                data['sex'] = 'Female'
                break
            
            # If not found on the same line, check the next line
            if not data['sex'] and i+1 < len(text_lines):
                next_line = text_lines[i+1].lower()
                if 'male' in next_line and 'female' not in next_line:
                    data['sex'] = 'Male'
                    break
                elif 'female' in next_line:
                    data['sex'] = 'Female'
                    break
                elif next_line.strip() == 'm':
                    data['sex'] = 'Male'
                    break
                elif next_line.strip() == 'f':
                    data['sex'] = 'Female'
                    break
        
        # Direct gender indicators
        elif line_lower.strip() == 'male' or line_lower.strip() == 'm':
            data['sex'] = 'Male'
            break
        elif line_lower.strip() == 'female' or line_lower.strip() == 'f':
            data['sex'] = 'Female'
            break
    
    # If still not found, look for gender indicators in all lines
    if not data['sex']:
        for line in text_lines:
            line_lower = line.lower()
            # Look for standalone gender indicators
            if re.search(r'\bmale\b', line_lower) and not re.search(r'\bfemale\b', line_lower):
                data['sex'] = 'Male'
                break
            elif re.search(r'\bfemale\b', line_lower):
                data['sex'] = 'Female'
                break
            # Look for M/F indicators with word boundaries
            elif re.search(r'\bm\b', line_lower) and not re.search(r'\bf\b', line_lower):
                data['sex'] = 'Male'
                break
            elif re.search(r'\bf\b', line_lower):
                data['sex'] = 'Female'
                break
    
    return data

def process_facial(image):
    try:
        # Check if face_recognition is available
        if not FACE_RECOGNITION_AVAILABLE:
            return {
                'success': False,
                'error': 'Face recognition module is not installed. Please install it with: pip install face-recognition'
            }
            
        # Convert PIL Image to numpy array if needed
        if isinstance(image, Image.Image):
            image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Find face locations
        face_locations = face_recognition.face_locations(image)
        
        # Draw rectangles around faces
        for top, right, bottom, left in face_locations:
            cv2.rectangle(image, (left, top), (right, bottom), (0, 255, 0), 2)
        
        # Convert the image to base64
        _, buffer = cv2.imencode('.jpg', image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            'success': True,
            'data': {
                'image': image_base64,
                'faces_found': len(face_locations)
            }
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def similarity_score(str1, str2):
    """Improved string similarity score between 0 and 1 using Levenshtein distance"""
    if not str1 or not str2:
        return 0
    
    # Simple Levenshtein distance implementation
    m, n = len(str1), len(str2)
    d = [[0 for _ in range(n+1)] for _ in range(m+1)]
    
    for i in range(m+1):
        d[i][0] = i
    for j in range(n+1):
        d[0][j] = j
    
    for j in range(1, n+1):
        for i in range(1, m+1):
            if str1[i-1] == str2[j-1]:
                d[i][j] = d[i-1][j-1]
            else:
                d[i][j] = min(
                    d[i-1][j] + 1,    # deletion
                    d[i][j-1] + 1,    # insertion
                    d[i-1][j-1] + 1   # substitution
                )
    
    # Convert Levenshtein distance to similarity score (0 to 1)
    max_len = max(m, n)
    if max_len == 0:
        return 1.0  # Both strings are empty
    return 1.0 - (d[m][n] / max_len)

@app.route('/process-image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400
    
    processing_type = request.form.get('type', 'ocr')
    
    try:
        # Read and process the image
        image_bytes = file.read()
        image = Image.open(BytesIO(image_bytes))
        
        # Save a copy of the uploaded image for debugging if needed
        save_path = os.path.join(UPLOAD_FOLDER, f"upload_{processing_type}_{os.urandom(4).hex()}.jpg")
        image.save(save_path)
        
        if processing_type == 'ocr':
            result = process_ocr(image)
        else:
            result = process_facial(image)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/verify-id-data', methods=['POST'])
def verify_id_data():
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        form_data = data.get('formData', {})
        ocr_data = data.get('ocrData', {})
        
        if not form_data or not ocr_data:
            return jsonify({'success': False, 'error': 'Missing form data or OCR data'}), 400
        
        # Compare the data
        verification_result = compare_id_data(form_data, ocr_data)
        
        return jsonify({
            'success': True,
            'data': verification_result
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def compare_id_data(form_data, ocr_data):
    """Compare form data with OCR extracted data with 60% confidence threshold for successful verification"""
    results = {
        'matches': [],
        'mismatches': [],
        'overall_match': False,
        'confidence': 0.0
    }
    
    # Fields to compare - now including sex/gender
    fields_to_compare = [
        ('firstName', 'firstName'),
        ('lastName', 'lastName'),
        ('id_number', 'idNumber'),
        ('nationality', 'nationality'),
        ('sex', 'sex')  # Added sex/gender
    ]
    
    match_count = 0
    total_fields = 0
    
    for ocr_field, form_field in fields_to_compare:
        ocr_value = ocr_data.get(ocr_field)
        form_value = form_data.get(form_field)
        
        # Skip if both values are missing
        if not ocr_value and not form_value:
            continue
        
        # Only count fields where at least one value exists
        total_fields += 1
            
        # For names, use enhanced fuzzy matching
        if ('name' in ocr_field.lower() or 'Name' in ocr_field) and ocr_value and form_value:
            # Clean values by removing extra spaces
            clean_ocr = re.sub(r'\s+', ' ', ocr_value.strip().lower())
            clean_form = re.sub(r'\s+', ' ', form_value.strip().lower())
            
            # Enhanced similarity check for names
            similarity = similarity_score(clean_ocr, clean_form)
            if (clean_ocr in clean_form or 
                clean_form in clean_ocr or
                similarity > 0.6):
                match_count += 1
                results['matches'].append({
                    'field': form_field,
                    'ocr_value': ocr_value,
                    'form_value': form_value,
                    'similarity': round(similarity, 2)
                })
            else:
                results['mismatches'].append({
                    'field': form_field,
                    'ocr_value': ocr_value,
                    'form_value': form_value,
                    'similarity': round(similarity, 2)
                })
        # For ID number, use improved matching with digit-by-digit comparison
        elif ocr_field == 'id_number' and ocr_value and form_value:
            # Clean up ID numbers for comparison (remove spaces, dashes)
            clean_ocr = re.sub(r'[\s\-]', '', ocr_value).upper()
            clean_form = re.sub(r'[\s\-]', '', form_value).upper()
            
            # Handle GH vs GHA prefix variation
            if clean_ocr.startswith('GHA') and clean_form.startswith('GH'):
                clean_form = 'GHA' + clean_form[2:]
            elif clean_form.startswith('GHA') and clean_ocr.startswith('GH'):
                clean_ocr = 'GHA' + clean_ocr[2:]
            
            # Calculate digit-by-digit similarity for numeric portion
            ocr_digits = re.sub(r'[^0-9]', '', clean_ocr)
            form_digits = re.sub(r'[^0-9]', '', clean_form)
            
            # Count matching digits
            digit_matches = sum(1 for i, digit in enumerate(ocr_digits) 
                               if i < len(form_digits) and digit == form_digits[i])
            digit_similarity = digit_matches / max(len(ocr_digits), len(form_digits)) if max(len(ocr_digits), len(form_digits)) > 0 else 0
            
            if clean_ocr == clean_form or digit_similarity > 0.8:  # Allow 1-2 digit errors
                match_count += 1
                results['matches'].append({
                    'field': form_field,
                    'ocr_value': ocr_value,
                    'form_value': form_value,
                    'similarity': round(digit_similarity, 2)
                })
            else:
                results['mismatches'].append({
                    'field': form_field,
                    'ocr_value': ocr_value,
                    'form_value': form_value,
                    'similarity': round(digit_similarity, 2)
                })
        # For nationality, use fuzzy matching with special handling for Ghana/Ghanaian
        elif ocr_field == 'nationality' and ocr_value and form_value:
            # Clean values by removing extra spaces and converting to lowercase
            clean_ocr = re.sub(r'\s+', ' ', ocr_value.strip().lower())
            clean_form = re.sub(r'\s+', ' ', form_value.strip().lower())
            
            # Handle common variations (e.g., "Ghanaian" vs "Ghana")
            if clean_ocr in clean_form or clean_form in clean_ocr:
                similarity = 1.0
            else:
                # Check for country vs nationality form
                country_to_nationality = {
                    'ghana': 'ghanaian',
                    'nigeria': 'nigerian',
                    'kenya': 'kenyan',
                    'america': 'american',
                    'usa': 'american',
                    'uk': 'british',
                    'britain': 'british',
                    'canada': 'canadian'
                }
                
                # Try to normalize both values
                norm_ocr = country_to_nationality.get(clean_ocr, clean_ocr)
                norm_form = country_to_nationality.get(clean_form, clean_form)
                
                if norm_ocr == norm_form:
                    similarity = 1.0
                else:
                    similarity = similarity_score(norm_ocr, norm_form)
            
            if similarity > 0.6:
                match_count += 1
                results['matches'].append({
                    'field': form_field,
                    'ocr_value': ocr_value,
                    'form_value': form_value,
                    'similarity': round(similarity, 2)
                })
            else:
                results['mismatches'].append({
                    'field': form_field,
                    'ocr_value': ocr_value,
                    'form_value': form_value,
                    'similarity': round(similarity, 2)
                })
        # For sex/gender, use exact matching with normalization
        elif ocr_field == 'sex' and ocr_value and form_value:
            # Normalize gender values
            gender_map = {
                'm': 'male',
                'f': 'female',
                'male': 'male',
                'female': 'female',
                'man': 'male',
                'woman': 'female'
            }
            
            clean_ocr = gender_map.get(ocr_value.lower().strip(), ocr_value.lower().strip())
            clean_form = gender_map.get(form_value.lower().strip(), form_value.lower().strip())
            
            if clean_ocr == clean_form:
                similarity = 1.0
            else:
                similarity = 0.0  # Gender should match exactly
            
            if similarity > 0.5:
                match_count += 1
                results['matches'].append({
                    'field': form_field,
                    'ocr_value': ocr_value,
                    'form_value': form_value,
                    'similarity': round(similarity, 2)
                })
            else:
                results['mismatches'].append({
                    'field': form_field,
                    'ocr_value': ocr_value,
                    'form_value': form_value,
                    'similarity': round(similarity, 2)
                })
        # Handle case where only one value exists
        elif ocr_value or form_value:
            results['mismatches'].append({
                'field': form_field,
                'ocr_value': ocr_value or "Not found in ID",
                'form_value': form_value or "Not provided in form",
                'similarity': 0.0
            })
    
    # Calculate overall match confidence
    results['confidence'] = match_count / total_fields if total_fields > 0 else 0
    
    # Set overall_match to true if confidence is >= 0.6 (60%)
    results['overall_match'] = results['confidence'] >= 0.6
    
    return results

if __name__ == '__main__':
    app.run(debug=True)