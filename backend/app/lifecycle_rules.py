import os
import boto3
from dotenv import load_dotenv

# Load variables directly from your .env file
load_dotenv()

s3_client = boto3.client(
    's3',
    region_name=os.getenv("DO_SPACE_REGION"),
    endpoint_url=f"https://{os.getenv('DO_SPACE_REGION')}.digitaloceanspaces.com",
    aws_access_key_id=os.getenv("DO_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("DO_SECRET_KEY")
)

# Use the exact API method DO requires
# Try this specific structure - it's the most compatible with DigitalOcean
s3_client.put_bucket_lifecycle_configuration(
    Bucket=os.getenv("DO_SPACE_NAME"),
    LifecycleConfiguration={
        'Rules': [
            {
                'ID': 'DeleteGuestArt',
                'Status': 'Enabled',
                'Prefix': 'temp-public/',  # Using old-style Prefix for maximum compatibility
                'Expiration': {
                    'Days': 1
                }
            }
        ]
    }
)
print("✅ Success! The API accepted the modern XML payload. The black hole is active.")
