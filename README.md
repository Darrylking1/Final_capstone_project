
# Automated Verification System (Zeeverify)

This full-stack application provides OCR (Optical Character Recognition) and Facial Recognition capabilities using React and Flask.

## Features

- Upload images for processing
- Extract text from images using Tesseract OCR
- Detect faces in images using face_recognition library
- Real-time processing feedback
- Error handling and validation
- Secure PostgreSQL database with encryption
- Automatic data deletion after 5 minutes for privacy

## Prerequisites

### Frontend
- Node.js and npm

### Backend
- Python 3.8+
- Tesseract OCR Engine
- OpenCV
- PostgreSQL 14+
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
venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up PostgreSQL:
```bash
# Install PostgreSQL (Windows)
# Download and install from https://www.postgresql.org/download/windows/

# Create database
createdb verification_db
```

4. Configure environment variables:
```bash
# Create .env file in the backend directory with the following:
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=verification_db
# Generate an encryption key or leave empty to auto-generate
# ENCRYPTION_KEY=
```

5. Initialize the database:
```bash
python -c "from db_config import init_db; init_db()"
```

6. Start the Flask server:
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
- PostgreSQL runs on localhost:5432

## Database Security Features

- All sensitive user data is encrypted using Fernet symmetric encryption
- Verification records are automatically deleted after 5 minutes
- Only image hashes are stored, not the actual images
- Database credentials are stored in environment variables

## Deployment to Google Cloud Platform

This project can be deployed to Google Cloud Platform using Docker containers. The following instructions will guide you through the deployment process.

### Prerequisites for Deployment

- Google Cloud account
- Google Cloud SDK installed
- Docker installed
- Git (to clone the repository)

### Deployment Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd pre-capstone
```

#### 2. Configure Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable artifactregistry.googleapis.com run.googleapis.com
```

#### 3. Frontend Deployment

The frontend is containerized using Docker and can be deployed to Google Cloud Run:

1. Update the deployment script with your project details:
   - Open `deploy-to-gcp.ps1`
   - Set your `PROJECT_ID`, `REGION`, and other variables

2. Run the deployment script:
```bash
.\deploy-to-gcp.ps1
```

This script will:
- Build the Docker image
- Push it to Google Artifact Registry
- Deploy it to Google Cloud Run

#### 4. Backend Deployment

The backend can be deployed separately to Google Cloud Run:

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Dockerfile for the backend:
```dockerfile
FROM python:3.9-slim

# Install Tesseract OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libpq-dev \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

3. Build and deploy the backend:
```bash
# Build the backend Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/verification-backend .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/verification-backend

# Deploy to Cloud Run
gcloud run deploy verification-backend \
  --image gcr.io/YOUR_PROJECT_ID/verification-backend \
  --platform managed \
  --region YOUR_REGION \
  --allow-unauthenticated
```

#### 5. Database Setup on Google Cloud

1. Create a Cloud SQL PostgreSQL instance:
```bash
gcloud sql instances create verification-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=YOUR_REGION \
  --root-password=YOUR_SECURE_PASSWORD
```

2. Create the database:
```bash
gcloud sql databases create verification_db --instance=verification-db
```

3. Update the backend environment variables to connect to Cloud SQL:
```bash
gcloud run services update verification-backend \
  --set-env-vars="DB_USER=postgres,DB_PASSWORD=YOUR_SECURE_PASSWORD,DB_HOST=YOUR_CLOUD_SQL_IP,DB_PORT=5432,DB_NAME=verification_db,ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY"
```

#### 6. Connect Frontend to Backend

After deployment, update the frontend configuration to point to the backend service URL:

1. Create an environment variable file or update the configuration in your code
2. Set the backend API URL to the Cloud Run service URL

### Alternative Deployment: Virtual Machine

You can also deploy the application on a Google Compute Engine VM:

1. Create a VM instance:
```bash
gcloud compute instances create verification-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=debian-11 \
  --image-project=debian-cloud \
  --boot-disk-size=10GB \
  --tags=http-server,https-server
```

2. Set up firewall rules:
```bash
gcloud compute firewall-rules create allow-http \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:80 \
  --target-tags=http-server
```

3. SSH into the VM and install Docker:
```bash
gcloud compute ssh verification-vm --zone=us-central1-a
```

4. Inside the VM, install Docker and dependencies:
```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker $USER
```

5. Clone the repository and build the Docker images:
```bash
git clone <repository-url>
cd pre-capstone
docker-compose up -d
```

## Troubleshooting

### Common Deployment Issues

1. **Docker build fails**:
   - Check that all required files are present
   - Verify Docker is installed correctly

2. **Cloud Run deployment fails**:
   - Ensure all required Google Cloud APIs are enabled
   - Check that your account has sufficient permissions

3. **Database connection issues**:
   - Verify database credentials in .env file
   - Check network connectivity to database server
   - Ensure PostgreSQL service is running

4. **Application not working after deployment**:
   - Check the Cloud Run logs for errors
   - Verify that the frontend can communicate with the backend
