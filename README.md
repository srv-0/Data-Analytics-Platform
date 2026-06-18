# DataLens — ML-Powered Data Analytics Platform

> Upload any CSV → get instant charts, statistics, auto-generated insights, and ML predictions (regression, classification, clustering) — all in a polished dark-themed web app.

Built with **React + Vite** (frontend) and **Python FastAPI + scikit-learn** (backend).

---

## Features

| Feature | Details |
|---|---|
| 📂 CSV Upload | Drag-and-drop, instant parse and preview |
| 📊 Distributions | Auto histograms and bar charts for all columns |
| 🔢 Statistics | Mean, median, std, skewness, kurtosis, outliers |
| 🔥 Correlation | Interactive heatmap for numeric columns |
| 💡 Auto Insights | Plain-English observations about your data |
| 🤖 ML Predict | Random Forest regression, classification, clustering |
| 📈 Feature Importance | Visual bar chart of what drives predictions |
| 🔵 Clustering | K-Means with silhouette score |

---

## Tech Stack

**Frontend**: React 18, Vite, Recharts, React Dropzone, Axios  
**Backend**: Python FastAPI, Pandas, NumPy, scikit-learn, Uvicorn  
**Architecture**: React SPA → REST API → Python ML microservice

---

## Project Structure

```
ml-analytics/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── pages/          # Upload, Overview, Analyze, Insights, Predict
│   │   ├── utils/api.js    # Axios API calls
│   │   └── index.css       # Design system
│   └── package.json
└── backend/                # FastAPI app
    ├── main.py             # App entry, CORS, routers
    ├── routers/
    │   ├── upload.py       # CSV parsing, session creation
    │   ├── analyze.py      # Stats, correlation, distributions
    │   ├── predict.py      # ML: regression, classification, clustering
    │   └── insights.py     # Auto insight generation
    ├── utils/session.py    # In-memory DataFrame store
    └── requirements.txt
```

---

## Getting Started

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload/csv` | Upload CSV, returns session_id |
| POST | `/api/analyze/stats` | Descriptive statistics |
| POST | `/api/analyze/correlation` | Correlation matrix |
| POST | `/api/analyze/distribution` | Column distributions |
| POST | `/api/insights/auto` | Auto-generated insights |
| POST | `/api/predict/run` | Run ML model |

---

## Example Usage

1. Download any CSV from [Kaggle](https://www.kaggle.com/datasets) (e.g. Iris, Titanic, House Prices)
2. Drop it onto the upload page
3. Explore the Overview and Analyze tabs
4. Check Auto Insights for quick observations
5. Go to ML Predict → select features + target → run

---

## Production Improvements (for scaling)

- Replace in-memory session store with **Redis**
- Add **PostgreSQL** to persist sessions and results
- Add **user auth** with JWT (NextAuth or Supabase)
- Deploy backend to **Railway** or **Render**
- Deploy frontend to **Vercel**
- Add **file size limits** and input validation
- Add **model export** (download trained model as .pkl)

---

## Interview Talking Points

- **Polyglot architecture**: JavaScript frontend + Python backend, two different runtimes communicating over REST
- **ML pipeline**: preprocessing → encoding → scaling → train/test split → model → metrics
- **CORS and session management**: stateless REST design with server-side state
- **Auto insight generation**: rule-based statistical analysis (IQR outliers, skewness, cardinality checks)
- **Recharts integration**: reactive chart rendering tied to API responses
