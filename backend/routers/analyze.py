from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
from utils.session import get_dataframe

router = APIRouter()

class AnalyzeRequest(BaseModel):
    session_id: str
    columns: Optional[list[str]] = None

@router.post("/stats")
def get_statistics(req: AnalyzeRequest):
    df = get_dataframe(req.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found. Please re-upload your file.")

    cols = req.columns if req.columns else df.select_dtypes(include="number").columns.tolist()
    df_num = df[cols].select_dtypes(include="number")

    stats = {}
    for col in df_num.columns:
        series = df_num[col].dropna()
        stats[col] = {
            "mean": round(float(series.mean()), 4),
            "median": round(float(series.median()), 4),
            "std": round(float(series.std()), 4),
            "min": round(float(series.min()), 4),
            "max": round(float(series.max()), 4),
            "q25": round(float(series.quantile(0.25)), 4),
            "q75": round(float(series.quantile(0.75)), 4),
            "skewness": round(float(series.skew()), 4),
            "kurtosis": round(float(series.kurtosis()), 4),
            "missing": int(df_num[col].isnull().sum()),
            "unique": int(series.nunique()),
        }

    return {"statistics": stats}

@router.post("/correlation")
def get_correlation(req: AnalyzeRequest):
    df = get_dataframe(req.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    df_num = df.select_dtypes(include="number")
    if df_num.empty:
        raise HTTPException(status_code=400, detail="No numeric columns found.")

    corr = df_num.corr().round(3)
    return {
        "columns": corr.columns.tolist(),
        "matrix": corr.values.tolist(),
    }

@router.post("/distribution")
def get_distribution(req: AnalyzeRequest):
    df = get_dataframe(req.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    result = {}
    cols = req.columns if req.columns else df.select_dtypes(include="number").columns.tolist()

    for col in cols:
        if col not in df.columns:
            continue
        series = df[col].dropna()
        if pd.api.types.is_numeric_dtype(series):
            counts, bin_edges = np.histogram(series, bins=20)
            result[col] = {
                "type": "histogram",
                "bins": [round(float(b), 4) for b in bin_edges[:-1]],
                "counts": counts.tolist(),
            }
        else:
            vc = series.value_counts().head(15)
            result[col] = {
                "type": "bar",
                "labels": vc.index.tolist(),
                "counts": vc.values.tolist(),
            }

    return {"distributions": result}
