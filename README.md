# Dry Beans ML — Proyecto End-to-End

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

Enlace Video Explicativo Evaluacion 3
https://youtu.be/a_MVLil5ECQ

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
Solución end-to-end de clasificación supervisada sobre el dataset Dry Beans.
GitHub guarda el CSV crudo y el código; Render hostea el backend FastAPI que
ejecuta el pipeline y el modelo SVM; Supabase persiste los datos limpios;
Netlify hostea el dashboard en React.

## Estructura

```
dry-beans-ml/
├── data/                          CSV crudo (versionado en GitHub)
│   └── dry_beans.csv
├── backend/                       FastAPI + sklearn → deploy en Render
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── config.py
│       ├── routers/               endpoints HTTP
│       ├── ml/                    pipeline + SVM
│       └── db/                    cliente Supabase
└── frontend/                      React + Vite → deploy en Netlify
```

## Equipo

- **Cristian Romero** — Product Owner / Frontend / Deploy Netlify
- **Javier Sagredo** — Backend / Pipeline ML / Deploy Render

## Stack

| Capa | Tecnología | Hosting |
|------|-----------|---------|
| Datos crudos | CSV en GitHub | GitHub |
| Backend | FastAPI + sklearn | Render (free tier) |
| Base de datos | PostgreSQL | Supabase (free tier) |
| Frontend | React + Vite + Recharts | Netlify (free tier) |

## Setup local (backend)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate           # Linux/Mac
pip install -r requirements.txt
cp .env.example .env                 # rellenar con credenciales reales
uvicorn main:app --reload
```

Abrir http://localhost:8000/docs para probar los endpoints.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check (útil con cron-job.org) |
| POST | `/process` | Lee CSV de GitHub → pipeline → guarda en Supabase |
| POST | `/train` | Lee Supabase → entrena SVM → devuelve métricas JSON |


## Flujo de uso

1. **Una vez:** `POST /process` para poblar `beans_clean` en Supabase
2. **Cuando quieras métricas:** `POST /train` desde el frontend
3. **Dashboard:** lee datos limpios desde Supabase + métricas del backend
