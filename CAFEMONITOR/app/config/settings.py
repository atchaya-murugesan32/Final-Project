from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GOOGLE_PLACES_API_KEY: str
    BESTTIME_API_KEY: str
    database_url: str

    class Config:
        env_file = ".env"


settings = Settings()