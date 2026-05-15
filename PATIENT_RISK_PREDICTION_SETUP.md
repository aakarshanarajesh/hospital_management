# Patient Risk Prediction Setup

This project includes a simple RandomForest-based patient risk prediction service.

## 1. ML Service

```bash
cd ml-service
pip install -r requirements.txt
python generate_data.py
python train_model.py
python app.py
```

The Flask service exposes:

```http
POST /predict-risk
```

Example request:

```json
{
  "age": 60,
  "heart_rate": 110,
  "bp": 150,
  "spo2": 88,
  "symptoms": ["fever", "breathing difficulty"]
}
```

Example response:

```json
{
  "risk": "High",
  "confidence": 0.87
}
```

The synthetic training dataset is in `ml-service/data/training_data.csv`.

## 2. Backend

Set the ML service URL in `backend/.env`:

```env
ML_SERVICE_URL=http://localhost:10000
```

Run the backend:

```bash
cd backend
npm install
npm run dev
```

The Node API exposes:

```http
POST /api/predict-risk
```

It calls the ML service, saves the result on the Patient document, and updates the top-level `riskLevel` field.

## 3. Frontend

Run the React app:

```bash
cd frontend
npm install
npm run dev
```

Use the Patients page to click the Predict Risk action. Risk colors are:

- Low: green
- Medium: yellow
- High: red

The dashboard shows Low, Medium, and High risk counts and alerts when high-risk patients exceed the threshold.
