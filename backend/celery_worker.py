import time
from celery import Celery
from ml_engine.inference import run_inference
from app.db import engine
from app.models import Image
from sqlmodel import Session

# 1. Setup Celery
# 'redis://localhost:6379/0' is the standard local Redis address
celery_app = Celery(
    "nst_worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# 2. Define the Task
@celery_app.task(name="generate_art")
def generate_art_task(content_path, style_path, output_path, image_id):
    print(f"Worker received job! Processing: {content_path}")
    
    with Session(engine) as session:
        image = session.get(Image, image_id)
        if image:
            image.status = "PROCESSING"
            session.add(image)
            session.commit()


    # Run the TensorFlow script
    try:
        start = time.time()
        result_path = run_inference(content_path, style_path, output_path)
        end = time.time()
        
        print(f"Job finished in {end - start:.2f}s")

        with Session(engine) as session:
            image = session.get(Image, image_id)
            if image:
                image.status = "COMPLETED"
                image.result_path = result_path
                session.add(image)
                session.commit()
        return {"status": "completed", "result": result_path}

        
    except Exception as e:
        print(f"Error: {e}")
        return {"status": "failed", "error": str(e)}