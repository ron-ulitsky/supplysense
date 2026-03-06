# Deployment Guide: SupplySense

This document outlines how to deploy the SupplySense Next.js application. Given our deep integration with the Google ecosystem for the Intelligence Layer (Gemini), deploying to **Google Cloud Run** is the recommended architecture.

Google Cloud Run is a fully managed compute platform that automatically scales your stateless containers, perfect for our Next.js frontend and AI API routes.

## Deploying to Google Cloud Run

### Prerequisites:
1. A Google Cloud Platform (GCP) account.
2. The Google Cloud CLI (`gcloud`) installed on your machine.
3. Docker installed.

### Steps:

1. **Authenticate with GCP Desktop**
   ```bash
   gcloud auth login
   gcloud config set project [YOUR_PROJECT_ID]
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com
   ```

3. **Set Up Secret Manager**
   Store your Gemini API key in Google Cloud Secret Manager so the container can securely access it at runtime.
   ```bash
   printf "your-api-key-here" | gcloud secrets create gemini-api-key --data-file=-
   ```

4. **Build and Deploy**
   We have already provided the `Dockerfile` in the repository root. You can deploy directly from source using the `gcloud run deploy` command, which will build the container using Cloud Build and deploy it to Cloud Run in one step:
   
   ```bash
   gcloud run deploy supplysense \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --update-secrets="GEMINI_API_KEY=gemini-api-key:latest"
   ```

Once deployed, Google Cloud will provide you with a secure `https://` URL where your SupplySense AI Co-Pilot is live and accessible.
