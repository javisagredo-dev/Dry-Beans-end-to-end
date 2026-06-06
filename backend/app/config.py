"""Carga centralizada de variables de entorno."""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    DATA_URL: str = os.getenv(
        "DATA_URL",
        "https://raw.githubusercontent.com/javisagredo-dev/Dry-Beans-end-to-end/main/data/Dry_Bean_Dataset.csv",
    )
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "*")

    def validate(self):
        missing = []
        if not self.SUPABASE_URL:
            missing.append("SUPABASE_URL")
        if not self.SUPABASE_KEY:
            missing.append("SUPABASE_KEY")
        if missing:
            raise RuntimeError(
                f"Faltan variables de entorno: {', '.join(missing)}. "
                "Revisa el archivo .env"
            )


settings = Settings()
