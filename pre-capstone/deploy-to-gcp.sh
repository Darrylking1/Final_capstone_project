#!/bin/bash

# Variables
PROJECT_ID="your-gcp-project-id"
IMAGE_NAME="verification-app"
REGION="us-central1"
SERVICE_NAME="verification-service"

# Build the Docker image
docker build -t $IMAGE_NAME .

# Configure Docker to use Google Cloud as a credential helper
gcloud auth configure-docker $REGION-docker.pkg.dev

# Tag the image for Google Artifact Registry
docker tag $IMAGE_NAME $REGION-docker.pkg.dev/$PROJECT_ID/$IMAGE_NAME/$IMAGE_NAME:latest

# Push the image to Google Artifact Registry
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$IMAGE_NAME/$IMAGE_NAME:latest

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/$IMAGE_NAME/$IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated