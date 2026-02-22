from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlmodel import Session
from celery import Celery
from app.db import get_session
from app.models import Image
import os
import uuid
import shutil

router = APIRouter()

celery_app = Celery("nst_worker", broker="redis://localhost:6379/0")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "ml_engine", "input")
OUTPUT_DIR = os.path.join(BASE_DIR, "ml_engine", "output")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@router.post("/generate")
def generate_image(
    content_file: UploadFile = File(...),
    style_file: UploadFile = File(...),
    session: Session = Depends(get_session)
    ):

    job_id = str(uuid.uuid4())
    content_filename = f"{job_id}_content.jpg"
    style_filename = f"{job_id}_style.jpg"
    output_filename = f"{job_id}_result.jpg"

    content_path = os.path.join(UPLOAD_DIR, content_filename)
    style_path = os.path.join(UPLOAD_DIR, style_filename)
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    try:
        with open(content_path, "wb") as buffer:
            shutil.copyfileobj(content_file.file, buffer)
        with open(style_path, "wb") as buffer:
            shutil.copyfileobj(style_file.file, buffer)
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(ex)}")
    
    new_image = Image(
        content_path=content_path,
        style_path=style_path,
        status="PENDING"
        )
    
    session.add(new_image)
    session.commit()
    session.refresh(new_image)


    task = celery_app.send_task(
        "generate_art", 
        args=[content_path, style_path, output_path, new_image.id]
    )

    return {
        "job_id": job_id,
        "database_id": new_image.id,
        "status": "submitted", 
        "task_id": task.id
    }

@router.get("/status/{image_id}")
def get_image_status(image_id: int ,session: Session = Depends(get_session)):
    image = session.get(Image, image_id)

    if not image:
        raise HTTPException(status_code=400, detail= "Image job not found")
    
    final_result_url = image.result_path
    
    if image.status == "COMPLETED" and image.result_path:
        filename = os.path.basename(image.result_path)
        final_result_url = f"http://127.0.0.1:8000/output/{filename}"
    
    return {
        "id": image.id,
        "status": image.status,
        "result": final_result_url
    }