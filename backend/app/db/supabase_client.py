"""
Cliente único de Supabase y funciones de lectura/escritura
sobre la tabla beans_clean.

Esquema esperado de la tabla en Supabase:

  beans_clean (
    id              bigserial primary key,
    area            double precision,
    perimeter       double precision,
    major_axis_length      double precision,
    minor_axis_length      double precision,
    aspect_ration   double precision,
    eccentricity    double precision,
    convex_area     double precision,
    equiv_diameter  double precision,
    extent          double precision,
    solidity        double precision,
    roundness       double precision,
    compactness     double precision,
    shape_factor1   double precision,
    shape_factor2   double precision,
    shape_factor3   double precision,
    shape_factor4   double precision,
    class_label     text,
    class_encoded   integer,
    created_at      timestamp default now()
  )
"""
import pandas as pd
from supabase import create_client, Client
from app.config import settings

_client: Client | None = None
TABLE = "beans_clean"


def get_client() -> Client:
    """Devuelve un cliente Supabase singleton."""
    global _client
    if _client is None:
        settings.validate()
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _client


def _to_snake(col: str) -> str:
    """Convierte CamelCase a snake_case (PascalCase -> pascal_case)."""
    out = []
    for i, ch in enumerate(col):
        if ch.isupper() and i > 0 and not col[i - 1].isupper():
            out.append("_")
        out.append(ch.lower())
    return "".join(out)


def insert_clean_data(df_clean: pd.DataFrame) -> int:
    """
    Limpia la tabla beans_clean y vuelve a insertar todo el df.

    Renombra columnas a snake_case para que coincidan con el esquema
    Postgres recomendado.
    """
    client = get_client()

    df = df_clean.copy()
    df.columns = [_to_snake(c) for c in df.columns]

    # Limpiar tabla antes de insertar (idempotente)
    client.table(TABLE).delete().gte("id", 0).execute()

    # Supabase tiene límite de payload — insertamos por lotes
    records = df.to_dict(orient="records")
    batch_size = 500
    total = 0
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        client.table(TABLE).insert(batch).execute()
        total += len(batch)
    return total


def fetch_clean_data() -> pd.DataFrame:
    """Lee toda la tabla beans_clean y devuelve un DataFrame."""
    client = get_client()
    # Usar paginación porque Supabase corta a 1000 filas por defecto
    all_rows = []
    page_size = 1000
    offset = 0
    while True:
        resp = (
            client.table(TABLE)
            .select("*")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        rows = resp.data
        if not rows:
            break
        all_rows.extend(rows)
        if len(rows) < page_size:
            break
        offset += page_size

    if not all_rows:
        return pd.DataFrame()

    df = pd.DataFrame(all_rows)

    # Renombrar de snake_case → CamelCase (el formato que espera el pipeline/modelo)
    rename_map = {
        "area": "Area",
        "perimeter": "Perimeter",
        "major_axis_length": "MajorAxisLength",
        "minor_axis_length": "MinorAxisLength",
        "aspect_ration": "AspectRation",
        "eccentricity": "Eccentricity",
        "convex_area": "ConvexArea",
        "equiv_diameter": "EquivDiameter",
        "extent": "Extent",
        "solidity": "Solidity",
        "roundness": "roundness",
        "compactness": "Compactness",
        "shape_factor1": "ShapeFactor1",
        "shape_factor2": "ShapeFactor2",
        "shape_factor3": "ShapeFactor3",
        "shape_factor4": "ShapeFactor4",
    }
    df = df.rename(columns=rename_map)
    return df
