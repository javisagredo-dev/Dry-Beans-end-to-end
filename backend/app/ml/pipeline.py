"""
Pipeline de preprocesamiento para el dataset Dry Beans.
El dataset tiene 16 features numéricas y 1 columna de clase ('Class').
Aplicamos:
  - StandardScaler para normalizar las features
  - LabelEncoder para la clase (target)
La clase se codifica aparte porque es el target, no una feature.
"""
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder

# Columnas numéricas del dataset Dry Beans
NUMERIC_FEATURES = [
    "Area", "MajorAxisLength", "Eccentricity", "Extent", "Solidity",
    "roundness", "Compactness", "ShapeFactor1", "ShapeFactor2", "ShapeFactor4",
]
TARGET = "Class"


def build_feature_pipeline() -> Pipeline:
    """Construye el pipeline de transformación de features numéricas."""
    return Pipeline([
        ("scaler", StandardScaler()),
    ])


def process_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, np.ndarray, dict]:
    """
    Aplica el pipeline al dataset y devuelve:
      - df_clean: DataFrame listo para guardar en Supabase
      - y_encoded: array con la clase codificada (para entrenar)
      - metadata: dict con info útil (mapping de clases, n_filas, etc.)
    """
    # Validar columnas
    missing_cols = [c for c in NUMERIC_FEATURES + [TARGET] if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Faltan columnas en el dataset: {missing_cols}")

    # Eliminar filas con target nulo
    df = df.dropna(subset=[TARGET]).reset_index(drop=True)

    # Procesar features
    pipe = build_feature_pipeline()
    X_processed = pipe.fit_transform(df[NUMERIC_FEATURES])

    # Codificar target
    le = LabelEncoder()
    y_encoded = le.fit_transform(df[TARGET])

    # Armar df limpio para guardar
    df_clean = pd.DataFrame(X_processed, columns=NUMERIC_FEATURES)
    df_clean["class_label"] = df[TARGET].values        # nombre original (legible)
    df_clean["class_encoded"] = y_encoded.astype(int)  # versión numérica para ML

    metadata = {
        "n_rows": len(df_clean),
        "n_features": len(NUMERIC_FEATURES),
        "classes": le.classes_.tolist(),
        "class_mapping": {cls: int(idx) for idx, cls in enumerate(le.classes_)},
    }

    return df_clean, y_encoded, metadata