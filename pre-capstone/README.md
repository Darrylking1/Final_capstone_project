# Image Processing Application

This full-stack application provides OCR (Optical Character Recognition) and Facial Recognition capabilities using React and Flask.

## Features

- Upload images for processing
- Extract text from images using Tesseract OCR
- Detect faces in images using face_recognition library
- Real-time processing feedback
- Error handling and validation

## Prerequisites

### Frontend
- Node.js and npm

### Backend
- Python 3.8+
- Tesseract OCR Engine
- OpenCV
- Required Python packages (see requirements.txt)

## Installation

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Start the Flask server:
```bash
python app.py
```

### Installing Tesseract OCR

#### Windows
- Download and install from [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
- Add installation directory to PATH

#### macOS
```bash
brew install tesseract
```

#### Linux
```bash
sudo apt-get install tesseract-ocr
```

## Usage

1. Open the application in your browser
2. Select the processing type (OCR or Facial Recognition)
3. Upload an image file
4. Click "Process Image"
5. View the results

## Development

- Frontend runs on http://localhost:5173
- Backend runs on http://localhost:5000

## Security Notes

- File size is limited to prevent DoS attacks
- CORS is configured to allow only the frontend origin
- Input validation is implemented for file types and processing options

## License

MIT