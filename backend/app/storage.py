import boto3
import uuid
from fastapi import UploadFile
from app.config import settings

# 1. Initialize the Boto3 Client to point to DigitalOcean instead of AWS
s3_client = boto3.client(
    's3',
    region_name=settings.do_space_region,
    endpoint_url=f"https://{settings.do_space_region}.digitaloceanspaces.com",
    aws_access_key_id=settings.do_access_key,
    aws_secret_access_key=settings.do_secret_key
)

async def upload_to_spaces(file: UploadFile, folder: str = "uploads") -> str:
    """
    Uploads a FastAPI file directly to DigitalOcean Spaces and returns the public URL.
    """
    # 2. Generate a guaranteed unique filename (e.g., "uploads/8f7a9...2b.jpg")
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{folder}/{uuid.uuid4().hex}.{file_extension}"

    try:
        # 3. Stream the file directly to the cloud bucket
        s3_client.upload_fileobj(
            file.file,
            settings.do_space_name,
            unique_filename,
            ExtraArgs={
                'ACL': 'public-read', # CRUCIAL: Lets your React frontend view the image!
                'ContentType': file.content_type
            }
        )
        
        # 4. Construct and return the public URL
        # DO Spaces CDN URLs look like: https://[SPACE_NAME].[REGION].cdn.digitaloceanspaces.com/[FILE]
        public_url = f"https://{settings.do_space_name}.{settings.do_space_region}.cdn.digitaloceanspaces.com/{unique_filename}"
        
        return public_url
        
    except Exception as e:
        print(f"Cloud upload failed: {e}")
        return None