from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from app.config import settings

def get_real_ip(request: Request) -> str:
    # 1. Check for Cloudflare's specific header
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip.split(",")[0].strip()
        
    # 2. Check for standard Nginx/Proxy forwarded header
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
        
    # 3. Fallback to the default remote address 
    return get_remote_address(request)

import os
is_test = os.environ.get("TESTING") == "1"

# Initialize Limiter with Redis storage
limiter = Limiter(
    key_func=get_real_ip,
    storage_uri="memory://" if is_test else settings.redis_url
)
