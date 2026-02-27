from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Depends, status
from sqlmodel import Session, select, desc
from celery import Celery
from app.db import get_session
from app.config import settings
from app.models import Image, User
from app.schemas import ImageLibraryResponse
from app.dependencies import get_current_user
from typing import Annotated
import os
import uuid
import shutil

router = APIRouter()

celery_app = Celery("nst_worker", broker=settings.redis_url)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "ml_engine", "input")
OUTPUT_DIR = os.path.join(BASE_DIR, "ml_engine", "output")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@router.post("/generate")
def generate_image(
    content_file: Annotated[UploadFile, File(...)],
    style_file: Annotated[UploadFile, File(...)],
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
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
        content_path=content_filename,
        style_path=style_filename,
        status="PENDING",
        user_id=current_user.id
    )
    
    session.add(new_image)
    session.commit()
    session.refresh(new_image)


    task = celery_app.send_task(
        "generate_art", 
        args=[content_filename, style_filename, output_filename, new_image.id]
    )

    return {
        "job_id": job_id,
        "database_id": new_image.id,
        "status": "submitted", 
        "task_id": task.id
    }

@router.get("/status/{image_id}")
def get_image_status(image_id: int ,session: Annotated[Session, Depends(get_session)], current_user: Annotated[User, Depends(get_current_user)]):
    image = session.get(Image, image_id)

    if not image:
        raise HTTPException(status_code=400, detail= "Image job not found")
    
    if image.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You do not have permission to view this image"
        )
    
    final_result_url = image.result_path
    
    if image.status == "COMPLETED" and image.result_path:
    
        final_result_url = f"{settings.backend_url}/output/{image.result_path}"
    
    return {
        "id": image.id,
        "status": image.status,
        "result": final_result_url
    }

@router.get("/library", response_model=list[ImageLibraryResponse])
def get_user_library(session: Annotated[Session, Depends(get_session)], current_user: Annotated[User, Depends(get_current_user)]):
    
    statement = select(Image).where(Image.user_id == current_user.id).order_by(desc(Image.created_at))
    images = session.exec(statement).all()
    
    return [
        {
            "id": image.id,
            "status": image.status,
            "result": f"{settings.backend_url}/output/{image.result_path}" if image.result_path else None
        }
        for image in images
    ]

@router.delete("/library/{image_id}")
def delete_image(image_id: int, session: Annotated[Session, Depends(get_session)], current_user: Annotated[User, Depends(get_current_user)]):
    image = session.get(Image, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    if image.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this image"
        )
    if image.result_path:
        output_path = os.path.join(OUTPUT_DIR, image.result_path)
        if os.path.exists(output_path):
            os.remove(output_path)
    session.delete(image)
    session.commit()
    return {"message": "Image deleted successfully"}