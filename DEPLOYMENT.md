# Deployment Guide: SupplySense

This document outlines how to deploy the SupplySense application, which consists of two services running in a single container:

1. **Next.js Frontend** (port 3000): The dashboard UI
2. **Python ADK Backend** (port 8000): The Google ADK agent intelligence engine

Deploying to **Google Cloud Run** is the recommended architecture.

## Deploying to Google Cloud Run

### Prerequisites:
1. A Google Cloud Platform (GCP) account.
2. The Google Cloud CLI (`gcloud`) installed on your machine.
3. Docker installed.

### Steps:

1. **Authenticate with GCP**
   ```bash
   gcloud auth login
   gcloud config set project [YOUR_PROJECT_ID]
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com
   ```

3. **Set Up Secret Manager for Gemini API Key**
   Store your Gemini API key in Google Cloud Secret Manager so the ADK backend can securely access it at runtime.
   ```bash
   printf "your-api-key-here" | gcloud secrets create gemini-api-key --data-file=-
   ```

4. **Build and Deploy**
   The repository includes a `Dockerfile` that builds both the Next.js frontend and the Python ADK backend into a single container. Deploy directly from source:

   ```bash
   gcloud run deploy supplysense \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --update-secrets="GOOGLE_API_KEY=gemini-api-key:latest" \
     --memory=1Gi
   ```

   Cloud Run will build the container using Cloud Build and deploy it automatically.

5. **Verify Health**
   Once deployed, check the ADK backend health endpoint:
   ```bash
   curl https://[YOUR_CLOUD_RUN_URL]/api/health
   ```

Once deployed, Google Cloud will provide you with a secure `https://` URL where your SupplySense AI Co-Pilot is live and accessible. The container runs both the Next.js frontend (serving the dashboard) and the Python ADK agent backend (handling AI analysis requests) together.
