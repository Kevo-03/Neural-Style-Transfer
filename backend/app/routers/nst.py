from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Depends, status
from sqlmodel import Session, select, desc
from celery import Celery
from app.db import get_session
from app.config import settings
from app.models import Image, User
from app.schemas import ImageLibraryResponse
from app.dependencies import get_current_user
from app.storage import upload_to_spaces
from app.storage import delete_from_spaces
from typing import Annotated
import os

router = APIRouter()

celery_app = Celery("nst_worker", broker=settings.redis_url)

@router.post("/generate")
async def generate_image(  # 👈 MUST be async now!
    content_file: Annotated[UploadFile, File(...)],
    style_file: Annotated[UploadFile, File(...)],
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    # 1. Upload files directly to DigitalOcean Spaces
    content_url = await upload_to_spaces(content_file, folder="content")
    style_url = await upload_to_spaces(style_file, folder="style")

    # 2. Safety check: Ensure both uploads succeeded
    if not content_url or not style_url:
        raise HTTPException(
            status_code=500, 
            detail="Failed to upload images to cloud storage. Please try again."
        )
    
    # 3. Save the full cloud URLs to the database, not local paths
    new_image = Image(
        content_path=content_url,
        style_path=style_url,
        status="PENDING",
        user_id=current_user.id
    )
    
    session.add(new_image)
    session.commit()
    session.refresh(new_image)

    # 4. Trigger Celery worker
    # Notice we updated the args! The worker just needs the URLs and the ID now.
    task = celery_app.send_task(
        "generate_art", 
        args=[content_url, style_url, new_image.id]
    )

    return {
        "job_id": task.id, # You can just use the Celery task ID as the job ID now
        "database_id": new_image.id,
        "status": "submitted", 
        "task_id": task.id,
        "message": "Images uploaded to cloud successfully. Processing started."
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
    
    return {
        "id": image.id,
        "status": image.status,
        "result": image.result_path 
    }

@router.get("/library", response_model=list[ImageLibraryResponse])
def get_user_library(session: Annotated[Session, Depends(get_session)], current_user: Annotated[User, Depends(get_current_user)]):
    
    statement = select(Image).where(Image.user_id == current_user.id).order_by(desc(Image.created_at))
    images = session.exec(statement).all()
    
    return [
        {
            "id": image.id,
            "status": image.status,
            "result": image.result_path 
        }
        for image in images
    ]

@router.delete("/library/{image_id}")
async def delete_image(  # 👈 MUST be async now
    image_id: int, 
    session: Annotated[Session, Depends(get_session)], 
    current_user: Annotated[User, Depends(get_current_user)]
):
    image = session.get(Image, image_id)
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
        
    if image.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this image"
        )
        
    # 1. Delete all associated images from the cloud bucket
    if image.result_path:
        await delete_from_spaces(image.result_path)
    if image.content_path:
        await delete_from_spaces(image.content_path)
    if image.style_path:
        await delete_from_spaces(image.style_path)

    # 2. Delete the record from the database
    session.delete(image)
    session.commit()
    
    return {"message": "Image and cloud files deleted successfully"}