# AI Features Setup

## Folder Structure

```text
backend/
  controllers/aiController.js
  routes/aiRoutes.js
  models/Patient.js
frontend/
  src/pages/PatientsPage.jsx
  src/pages/DashboardPage.jsx
  src/pages/AssistantPage.jsx
  src/services/api.js
ml-service/
  app.py
  generate_data.py
  train_model.py
  hospital_assistant.py
  data/training_data.csv
  data/sample_predictions.json
  models/patient_risk_model_random_forest.pkl
  models/scaler.pkl
```

## Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install ML service dependencies:

```bash
cd ml-service
python -m pip install -r requirements.txt
```

4. Generate synthetic data and train the model:

```bash
cd ml-service
python generate_data.py
python train_model.py random_forest
```

5. Start services:

```bash
cd ml-service
python app.py
```

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

## Endpoints

- `POST /api/ai/predict-risk`
- `POST /api/ai/ask-assistant`
- `GET /api/ai/high-risk-patients`
- `GET /api/ai/dashboard-stats`
- `GET /api/ai/service-health`

## Environment

Backend:

```env
ML_SERVICE_URL=http://localhost:5001
```

ML service:

```env
MONGODB_URI=mongodb://localhost:27017/hospital_management
ASSISTANT_TYPE=mock
OPENAI_API_KEY=
```

Set `ASSISTANT_TYPE=openai` and provide `OPENAI_API_KEY` to use OpenAI instead of the mock assistant.
