"""
Cliente único de Supabase y funciones de lectura/escritura
sobre la tabla beans_clean.
"""
import pandas as pd
from supabase import create_client, Client
from app.config import settings

_client: Client | None = None
TABLE = "beans_clean"


def get_client() -> Client:
    global _client
    if _client is None:
        settings.validate()
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _client


def _to_snake(col: str) -> str:
    out = []
    for i, ch in enumerate(col):
        if ch.isupper() and i > 0 and not col[i - 1].isupper():
            out.append("_")
        out.append(ch.lower())
    return "".join(out)


def insert_clean_data(df_clean: pd.DataFrame) -> int:
    client = get_client()
    df = df_clean.copy()
    df.columns = [_to_snake(c) for c in df.columns]

    try:
        client.rpc("truncate_beans_clean", params={}).execute()
    except Exception as e:
        raise Exception(f"Fallo en RPC: {str(e)}")

    records = df.to_dict(orient="records")
    batch_size = 500
    total = 0
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        try:
            client.table(TABLE).insert(batch).execute()
        except Exception as e:
            raise Exception(f"Fallo en INSERT lote {i}: {str(e)}")
        total += len(batch)
    return total


def fetch_clean_data() -> pd.DataFrame:
    client = get_client()
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
    rename_map = {
        "area": "Area",
        "major_axis_length": "MajorAxisLength",
        "eccentricity": "Eccentricity",
        "extent": "Extent",
        "solidity": "Solidity",
        "roundness": "roundness",
        "compactness": "Compactness",
        "shape_factor1": "ShapeFactor1",
        "shape_factor2": "ShapeFactor2",
        "shape_factor4": "ShapeFactor4",
    }
    df = df.rename(columns=rename_map)
    return df