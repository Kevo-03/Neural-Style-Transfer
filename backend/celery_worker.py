import time
import uuid
import requests
import boto3
from celery import Celery
from ml_engine.inference import run_inference
from app.db import engine
from app.models import Image
from app.config import settings
from app.storage import get_presigned_url
from sqlmodel import Session

celery_app = Celery(
    "nst_worker",
    broker=settings.redis_url,
    backend=settings.redis_url
)

# Initialize Boto3 for the worker
s3_client = boto3.client(
    's3',
    region_name=settings.do_space_region,
    endpoint_url=f"https://{settings.do_space_region}.digitaloceanspaces.com",
    aws_access_key_id=settings.do_access_key,
    aws_secret_access_key=settings.do_secret_key
)

@celery_app.task(name="generate_art")
def generate_art_task(content_url, style_url, image_id=None, is_public=False):
    # 👇 Log the type of job we are running
    print(f"Worker received job. Public Mode: {is_public}, DB ID: {image_id}")
    job_id = str(uuid.uuid4())
    
    try:
        # 1. DOWNLOAD PHASE: Pull the raw bytes directly into RAM
        print("Downloading image bytes from cloud...")
        secure_content_url = get_presigned_url(content_url)
        secure_style_url = get_presigned_url(style_url)
        content_bytes = requests.get(secure_content_url).content
        style_bytes = requests.get(secure_style_url).content

        # 👇 DATABASE GUARD: Only update DB if it's a registered user
        if not is_public and image_id:
            with Session(engine) as session:
                image = session.get(Image, image_id)
                if image:
                    image.status = "PROCESSING"
                    session.add(image)
                    session.commit()

        # 2. INFERENCE PHASE: Run the ML model completely in memory
        print("Running ML Inference in RAM...")
        start = time.time()
        
        output_stream = run_inference(content_bytes, style_bytes) 
        
        print(f"Inference finished in {time.time() - start:.2f}s")

        # 3. UPLOAD PHASE: Push the RAM stream directly to DO Spaces
        print("Uploading result stream to cloud...")
        
        # 👇 S3 ROUTING: Send public jobs to the self-destruct folder
        if is_public:
            cloud_output_key = f"temp-public/results/{job_id}.jpg"
        else:
            cloud_output_key = f"results/{job_id}.jpg"
        
        s3_client.upload_fileobj(
            output_stream,
            settings.do_space_name,
            cloud_output_key,
            ExtraArgs={'ACL': 'private', 'ContentType': 'image/jpeg'}
        )
        
        result_url = f"https://{settings.do_space_name}.{settings.do_space_region}.cdn.digitaloceanspaces.com/{cloud_output_key}"

        # 4. DATABASE UPDATE
        # 👇 DATABASE GUARD: Only update DB if it's a registered user
        if not is_public and image_id:
            with Session(engine) as session:
                image = session.get(Image, image_id)
                if image:
                    image.status = "COMPLETED"
                    image.result_path = result_url
                    session.add(image)
                    session.commit()

        return {"status": "completed", "result_url": result_url}

    except Exception as e:
        print(f"Worker Error: {e}")
        # 👇 DATABASE GUARD
        if not is_public and image_id:
            with Session(engine) as session:
                image = session.get(Image, image_id)
                if image:
                    image.status = "FAILED"
                    session.add(image)
                    session.commit()
        return {"status": "failed", "error": str(e)}