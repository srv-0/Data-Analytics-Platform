from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from utils.session import get_dataframe

router = APIRouter()

class InsightsRequest(BaseModel):
    session_id: str

@router.post("/auto")
def auto_insights(req: InsightsRequest):
    df = get_dataframe(req.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    insights = []
    df_num = df.select_dtypes(include="number")

    # Missing data insight
    missing = df.isnull().sum()
    missing_pct = (missing / len(df) * 100).round(1)
    high_missing = missing_pct[missing_pct > 20]
    if not high_missing.empty:
        cols = ", ".join(high_missing.index.tolist())
        insights.append({
            "type": "warning",
            "title": "High missing data",
            "detail": f"Columns {cols} have more than 20% missing values. Consider imputation or removal.",
            "icon": "alert-triangle"
        })
    else:
        insights.append({
            "type": "success",
            "title": "Data completeness looks good",
            "detail": f"No column has more than 20% missing values across {len(df)} rows.",
            "icon": "circle-check"
        })

    # Correlation insights
    if df_num.shape[1] >= 2:
        corr = df_num.corr()
        high_corr_pairs = []
        for i in range(len(corr.columns)):
            for j in range(i+1, len(corr.columns)):
                val = corr.iloc[i, j]
                if abs(val) > 0.75:
                    high_corr_pairs.append((corr.columns[i], corr.columns[j], round(val, 2)))

        if high_corr_pairs:
            pair = high_corr_pairs[0]
            insights.append({
                "type": "info",
                "title": "Strong correlation found",
                "detail": f"'{pair[0]}' and '{pair[1]}' are strongly correlated (r={pair[2]}). One may predict the other — worth exploring for regression.",
                "icon": "chart-dots"
            })

    # Skewness
    for col in df_num.columns:
        skew = df_num[col].skew()
        if abs(skew) > 2:
            direction = "right (positive)" if skew > 0 else "left (negative)"
            insights.append({
                "type": "info",
                "title": f"Skewed distribution: {col}",
                "detail": f"'{col}' is heavily skewed {direction} (skew={round(skew,2)}). A log transform may improve ML model performance.",
                "icon": "wave-sine"
            })

    # Outlier detection (IQR method)
    outlier_cols = []
    for col in df_num.columns:
        Q1 = df_num[col].quantile(0.25)
        Q3 = df_num[col].quantile(0.75)
        IQR = Q3 - Q1
        outliers = df_num[(df_num[col] < Q1 - 1.5*IQR) | (df_num[col] > Q3 + 1.5*IQR)]
        pct = round(len(outliers) / len(df) * 100, 1)
        if pct > 5:
            outlier_cols.append(f"{col} ({pct}%)")

    if outlier_cols:
        insights.append({
            "type": "warning",
            "title": "Outliers detected",
            "detail": f"Significant outliers found in: {', '.join(outlier_cols)}. These may skew model results.",
            "icon": "point"
        })

    # Dataset size insight
    if len(df) < 100:
        insights.append({
            "type": "warning",
            "title": "Small dataset",
            "detail": f"Only {len(df)} rows detected. ML models need at least 500+ rows for reliable results. Results may be unstable.",
            "icon": "database"
        })
    elif len(df) > 10000:
        insights.append({
            "type": "success",
            "title": "Large dataset — great for ML",
            "detail": f"{len(df):,} rows detected. Your dataset is large enough for robust ML training and validation.",
            "icon": "database"
        })

    # Categorical cardinality
    for col in df.select_dtypes(include="object").columns:
        n_unique = df[col].nunique()
        if n_unique > 50:
            insights.append({
                "type": "info",
                "title": f"High cardinality: {col}",
                "detail": f"'{col}' has {n_unique} unique values. Consider grouping rare categories before using it in ML.",
                "icon": "tag"
            })

    return {
        "total_insights": len(insights),
        "insights": insights[:8],
        "summary": {
            "rows": len(df),
            "columns": len(df.columns),
            "numeric_cols": len(df_num.columns),
            "categorical_cols": len(df.select_dtypes(include="object").columns),
            "total_missing": int(df.isnull().sum().sum()),
        }
    }
