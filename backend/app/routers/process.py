"""
POST /process — descarga el CSV crudo desde GitHub, lo pasa por el pipeline
de sklearn y guarda el resultado limpio en Supabase.
"""
import pandas as pd
from fastapi import APIRouter, HTTPException
from app.config import settings
from app.ml.pipeline import process_dataset
from app.db.supabase_client import insert_clean_data

router = APIRouter(prefix="/process", tags=["process"])


@router.post("")
def process():
    try:
        df_raw = pd.read_csv(settings.DATA_URL, sep=';', decimal=',')
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"No se pudo leer el CSV desde GitHub: {e}",
        )
    try:
        df_clean, _, metadata = process_dataset(df_raw)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en pipeline: {e}")
    try:
        inserted = insert_clean_data(df_clean)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error escribiendo en Supabase: {str(e)} | tipo: {type(e).__name__}"
        )
    return {
        "status": "ok",
        "inserted_rows": inserted,
        "metadata": metadata,
    }