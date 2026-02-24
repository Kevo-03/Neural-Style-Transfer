from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
   
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    redis_url: str
    frontend_url: str
    backend_url: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()