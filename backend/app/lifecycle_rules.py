import os
import boto3
from app.config import settings

s3_client = boto3.client(
    's3',
    region_name=settings.do_space_region,
    endpoint_url=f"https://{settings.do_space_region}.digitaloceanspaces.com",
    aws_access_key_id=settings.do_access_key,
    aws_secret_access_key=settings.do_secret_key
)

s3_client.put_bucket_lifecycle_configuration(
    Bucket=settings.do_space_name,
    LifecycleConfiguration={
        'Rules': [
            {
                'ID': 'Delete Guest Art',
                'Filter': {'Prefix': 'temp-public/'},
                'Status': 'Enabled',
                'Expiration': {'Days': 1}
            }
        ]
    }
)

print("✅ Success! The API accepted the modern XML payload. The black hole is active.")