# Backend — Dry Beans

FastAPI + scikit-learn. Lee el CSV crudo desde GitHub, lo procesa con un
Pipeline de sklearn, guarda los datos limpios en Supabase y entrena un SVM
con GridSearchCV cuando se le solicita.

## Setup local

```bash
python -m venv .venv
source .venv/bin/activate       # Linux/Mac
# .venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env             # editar con credenciales reales
uvicorn main:app --reload
```

Abrir http://localhost:8000/docs para la documentación interactiva.

## Esquema de la tabla en Supabase

Ejecutar este SQL en el editor SQL de Supabase antes del primer `/process`:

```sql
create table beans_clean (
  id                bigserial primary key,
  area              double precision,
  perimeter         double precision,
  major_axis_length double precision,
  minor_axis_length double precision,
  aspect_ration     double precision,
  eccentricity      double precision,
  convex_area       double precision,
  equiv_diameter    double precision,
  extent            double precision,
  solidity          double precision,
  roundness         double precision,
  compactness       double precision,
  shape_factor1     double precision,
  shape_factor2     double precision,
  shape_factor3     double precision,
  shape_factor4     double precision,
  class_label       text,
  class_encoded    integer,
  created_at        timestamp default now()
);
```

## Deploy en Render

1. En Render: **New Web Service** → conectar el repo de GitHub
2. Configuración:
   - **Name:** `dry-beans-backend`
   - **Region:** Oregon
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
3. **Environment Variables** (pestaña Environment):
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `DATA_URL`
   - `FRONTEND_ORIGIN` → URL de Netlify

## Estructura

```
backend/
├── main.py                     entry point FastAPI
├── requirements.txt
├── .env.example
└── app/
    ├── config.py               carga de variables de entorno
    ├── routers/
    │   ├── health.py           GET /health
    │   ├── process.py          POST /process
    │   └── train.py            POST /train
    ├── ml/
    │   ├── pipeline.py         Imputer + Scaler + LabelEncoder
    │   └── model.py            SVM + GridSearchCV
    └── db/
        └── supabase_client.py  cliente Supabase + insert/fetch
```

## Mantener el servicio despierto

Render duerme servicios free tras 15 min de inactividad. Workaround:
configurar un cron gratis en [cron-job.org](https://cron-job.org) que
haga GET a `/health` cada 10 minutos durante horas de uso.
