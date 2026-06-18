from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_squared_error, r2_score,
    accuracy_score, classification_report,
    silhouette_score
)
from utils.session import get_dataframe

router = APIRouter()

class PredictRequest(BaseModel):
    session_id: str
    target_column: str
    feature_columns: list[str]
    task: str  # "regression", "classification", "clustering"
    model: Optional[str] = "auto"
    n_clusters: Optional[int] = 3

@router.post("/run")
def run_prediction(req: PredictRequest):
    df = get_dataframe(req.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    df = df[req.feature_columns + ([req.target_column] if req.task != "clustering" else [])].dropna()

    X = df[req.feature_columns].copy()
    for col in X.select_dtypes(include="object").columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    if req.task == "clustering":
        k = req.n_clusters or 3
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = model.fit_predict(X_scaled)
        score = silhouette_score(X_scaled, labels) if k > 1 else 0
        return {
            "task": "clustering",
            "n_clusters": k,
            "silhouette_score": round(float(score), 4),
            "cluster_labels": labels.tolist(),
            "cluster_sizes": pd.Series(labels).value_counts().sort_index().to_dict(),
            "cluster_centers": model.cluster_centers_.round(4).tolist(),
            "feature_columns": req.feature_columns,
        }

    y = df[req.target_column]

    if req.task == "classification":
        le = LabelEncoder()
        y_enc = le.fit_transform(y.astype(str))
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_enc, test_size=0.2, random_state=42)
        clf = RandomForestClassifier(n_estimators=100, random_state=42)
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        importances = clf.feature_importances_.tolist()
        return {
            "task": "classification",
            "accuracy": round(float(acc), 4),
            "feature_importance": dict(zip(req.feature_columns, [round(v, 4) for v in importances])),
            "classes": le.classes_.tolist(),
            "train_size": len(X_train),
            "test_size": len(X_test),
        }

    if req.task == "regression":
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
        reg = RandomForestRegressor(n_estimators=100, random_state=42)
        reg.fit(X_train, y_train)
        y_pred = reg.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        importances = reg.feature_importances_.tolist()

        scatter_sample = list(zip(
            [round(float(v), 4) for v in y_test[:50].tolist()],
            [round(float(v), 4) for v in y_pred[:50].tolist()]
        ))

        return {
            "task": "regression",
            "r2_score": round(float(r2), 4),
            "rmse": round(float(np.sqrt(mse)), 4),
            "feature_importance": dict(zip(req.feature_columns, [round(v, 4) for v in importances])),
            "scatter": scatter_sample,
            "train_size": len(X_train),
            "test_size": len(X_test),
        }

    raise HTTPException(status_code=400, detail="Invalid task. Choose: regression, classification, clustering")
