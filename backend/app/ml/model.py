"""
Entrenamiento del SVM con GridSearchCV.

Lee los datos limpios desde Supabase, entrena con kernel rbf,
optimiza C y gamma, y devuelve métricas en formato JSON serializable.
"""
import pandas as pd
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from .pipeline import NUMERIC_FEATURES


def train_svm(df_clean: pd.DataFrame) -> dict:
    X = df_clean[NUMERIC_FEATURES].values
    y = df_clean["class_encoded"].values
    class_names = (
        df_clean.drop_duplicates("class_encoded")
        .sort_values("class_encoded")["class_label"]
        .tolist()
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Hiperparámetros óptimos ya conocidos desde el notebook
    model = SVC(C=30, gamma='scale', kernel='rbf', random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    report = classification_report(
        y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0
    )
    cm = confusion_matrix(y_test, y_pred).tolist()

    return {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "f1_macro": float(f1_score(y_test, y_pred, average="macro")),
        "f1_weighted": float(f1_score(y_test, y_pred, average="weighted")),
        "params": {"C": 30, "gamma": "scale", "kernel": "rbf"},
        "classification_report": report,
        "confusion_matrix": cm,
        "class_names": class_names,
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
    }