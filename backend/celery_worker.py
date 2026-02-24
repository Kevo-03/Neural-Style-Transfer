import time
from celery import Celery
from ml_engine.inference import run_inference
from app.db import engine
from app.models import Image
from app.config import settings
from sqlmodel import Session
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "ml_engine", "input")
OUTPUT_DIR = os.path.join(BASE_DIR, "ml_engine", "output")
# 1. Setup Celery
# 'redis://localhost:6379/0' is the standard local Redis address
celery_app = Celery(
    "nst_worker",
    broker=settings.redis_url,  # Use the Redis URL from settings
    backend=settings.redis_url
)

# 2. Define the Task
@celery_app.task(name="generate_art")
def generate_art_task(content_filename, style_filename, output_filename, image_id):
    
    # CHANGED: Rebuild the absolute paths so the ML engine can read the disk
    content_path = os.path.join(UPLOAD_DIR, content_filename)
    style_path = os.path.join(UPLOAD_DIR, style_filename)
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    
    print(f"Worker received job! Processing: {content_filename}")
    
    with Session(engine) as session:
        image = session.get(Image, image_id)
        if image:
            image.status = "PROCESSING"
            session.add(image)
            session.commit()

    # Run the TensorFlow script
    try:
        start = time.time()
        # ML engine still uses the full paths
        run_inference(content_path, style_path, output_path)
        end = time.time()
        
        print(f"Job finished in {end - start:.2f}s")

        with Session(engine) as session:
            image = session.get(Image, image_id)
            if image:
                image.status = "COMPLETED"
                # CHANGED: We save ONLY the filename to the database
                image.result_path = output_filename 
                session.add(image)
                session.commit()
                
        return {"status": "completed", "result": output_filename}
        
    except Exception as e:
        print(f"Error: {e}")
        return {"status": "failed", "error": str(e)}