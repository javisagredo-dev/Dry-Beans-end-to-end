"""
POST /train — lee los datos limpios desde Supabase, entrena el SVM con
GridSearchCV y devuelve las métricas en la respuesta JSON.

Las métricas NO se guardan en Supabase (van directo al frontend).
"""
from fastapi import APIRouter, HTTPException

from app.db.supabase_client import fetch_clean_data
from app.ml.model import train_svm

router = APIRouter(prefix="/train", tags=["train"])


@router.post("")
def train():
    df_clean = fetch_clean_data()
    if df_clean.empty:
        raise HTTPException(
            status_code=400,
            detail="La tabla beans_clean está vacía. Ejecuta POST /process primero.",
        )

    try:
        metrics = train_svm(df_clean)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error entrenando SVM: {e}")

    return {"status": "ok", "model": "SVM (rbf)", "metrics": metrics}
