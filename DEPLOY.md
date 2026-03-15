# Deploy to Google Cloud Run

## Prerequisites
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated
- A Google Cloud project created
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster set up

---

## 1. MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com → create a free M0 cluster
2. Create a database user (username + password)
3. Under **Network Access** → Add IP Address → **Allow access from anywhere** (0.0.0.0/0)
4. Get your connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/nailkolors?retryWrites=true&w=majority
   ```

---

## 2. One-Time Google Cloud Setup

```bash
# Set your project ID
export PROJECT_ID=gen-lang-client-0525593878
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com

# Grant Cloud Build permission to deploy to Cloud Run
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"
gcloud iam service-accounts add-iam-policy-binding \
  ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

---

## 3. Set Environment Variables on Cloud Run

After the first deploy (step 4), set your secrets:

```bash
gcloud run services update nailkolors \
  --region=us-central1 \
  --set-env-vars="MONGODB_URI=mongodb://atlas-sql-69b5ae051f8f57e8c3df86b7-wq5um.g.query.mongodb.net/sample_mflix?ssl=true&authSource=admin" \
  --set-env-vars="JWT_SECRET=your_strong_random_secret_here" \
  --set-env-vars="EMAIL_HOST=smtp.gmail.com" \
  --set-env-vars="EMAIL_PORT=587" \
  --set-env-vars="EMAIL_USER=thanhtktran88@gmail.com" \
  --set-env-vars="EMAIL_PASS=uuzbixrtxbwtnyfn" \
  --set-env-vars="NODE_ENV=production"
  # CLIENT_URL is not needed — frontend is served from the same origin
```

> **Gmail tip:** Use an [App Password](https://support.google.com/accounts/answer/185833), not your real password.

---

## 4. Manual Deploy (first time)

```bash
cd d:/work/nailkolors

# Build and push image
docker build -t gcr.io/$PROJECT_ID/nailkolors .
docker push gcr.io/$PROJECT_ID/nailkolors

# Deploy to Cloud Run
gcloud run deploy nailkolors \
  --image=gcr.io/$PROJECT_ID/nailkolors \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi
```

Cloud Run will print the service URL, e.g.:
```
Service URL: https://nailkolors-xxxxxxxxxx-uc.a.run.app
```

After deploying, run step 3 to set environment variables, then redeploy once:
```bash
gcloud run deploy nailkolors \
  --image=gcr.io/$PROJECT_ID/nailkolors \
  --region=us-central1
```

---

## 5. Seed the Admin Account

Once deployed, visit:
```
POST https://nailkolors-xxxxxxxxxx-uc.a.run.app/api/auth/seed-admin
```
Or run:
```bash
curl -X POST https://nailkolors-xxxxxxxxxx-uc.a.run.app/api/auth/seed-admin
```
This creates admin@nailkolors.com / admin1234.

---

## 6. Auto Deploy on Git Push (CI/CD)

Connect your GitHub repo to Cloud Build for automatic deployments:

```bash
# In Google Cloud Console:
# Cloud Build → Triggers → Connect Repository → GitHub
# → Select your repo → Create trigger using cloudbuild.yaml
```

Every push to `main` will automatically build and deploy.

---

## Notes

- **Uploaded images** (nail colors, services, posts) are stored in the container's local filesystem.
  They will be lost on container restarts. For production, migrate uploads to **Google Cloud Storage**.
- Cloud Run scales to zero when idle — cold starts take ~2-3 seconds.
- The `min-instances=0` setting keeps costs near zero for low-traffic periods.
