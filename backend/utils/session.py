import uuid
import pandas as pd
from typing import Optional

# In-memory store — swap for Redis in production
_store: dict[str, pd.DataFrame] = {}

def save_dataframe(df: pd.DataFrame) -> str:
    session_id = str(uuid.uuid4())
    _store[session_id] = df
    return session_id

def get_dataframe(session_id: str) -> Optional[pd.DataFrame]:
    return _store.get(session_id)

def delete_dataframe(session_id: str):
    _store.pop(session_id, None)
