import boto3
import uuid
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "heic", "heif"}

def validate_upload(file: UploadFile, max_size_mb: int = 20):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail=f"Invalid file type for {file.filename}. Must be an image.")
    
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported image format: {ext}")
        
    if file.size and file.size > max_size_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File {file.filename} is too large. Maximum size is {max_size_mb}MB.")

s3_client = boto3.client(
    's3',
    region_name=settings.do_space_region,
    endpoint_url=f"https://{settings.do_space_region}.digitaloceanspaces.com",
    aws_access_key_id=settings.do_access_key,
    aws_secret_access_key=settings.do_secret_key
)

def upload_to_spaces(file: UploadFile, folder: str = "uploads") -> str:
  
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{folder}/{uuid.uuid4().hex}.{file_extension}"

    try:
        s3_client.upload_fileobj(
            file.file,
            settings.do_space_name,
            unique_filename,
            ExtraArgs={
                'ACL': 'private', 
                'ContentType': file.content_type
            }
        )
        
        public_url = f"https://{settings.do_space_name}.{settings.do_space_region}.cdn.digitaloceanspaces.com/{unique_filename}"
        
        return public_url
        
    except Exception as e:
        print(f"Cloud upload failed: {e}")
        return None
    
def get_presigned_url(file_url: str, expiration: int = 3600) -> str:
    if not file_url:
        return None

    base_domain = f"https://{settings.do_space_name}.{settings.do_space_region}.cdn.digitaloceanspaces.com/"
    
    try:
        if file_url.startswith(base_domain):
            file_key = file_url.replace(base_domain, "")
            
            response = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': settings.do_space_name,
                    'Key': file_key
                },
                ExpiresIn=expiration
            )
            return response
        return file_url 
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return None
    
def delete_from_spaces(file_url: str):
   
    if not file_url:
        return

    base_domain = f"https://{settings.do_space_name}.{settings.do_space_region}.cdn.digitaloceanspaces.com/"
    
    try:
        if file_url.startswith(base_domain):
            file_key = file_url.replace(base_domain, "")
           
            s3_client.delete_object(Bucket=settings.do_space_name, Key=file_key)
            print(f"Successfully deleted {file_key} from cloud storage.")
            
    except Exception as e:
        print(f"Failed to delete {file_url} from cloud: {e}")