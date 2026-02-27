import os
import boto3
from dotenv import load_dotenv

# 1. Load the keys from your .env file
load_dotenv()

SPACE_NAME = os.getenv("DO_SPACE_NAME")
REGION = os.getenv("DO_SPACE_REGION")
ACCESS_KEY = os.getenv("DO_ACCESS_KEY")
SECRET_KEY = os.getenv("DO_SECRET_KEY")

def test_upload():
    print(f"Connecting to DigitalOcean Space: '{SPACE_NAME}' in region '{REGION}'...\n")

    # 2. Initialize the S3 Client pointed at DigitalOcean
    client = boto3.client(
        's3',
        region_name=REGION,
        endpoint_url=f'https://{REGION}.digitaloceanspaces.com',
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY
    )

    try:
        # 3. Create a tiny test file in memory
        test_content = b"Success! Your Boto3 configuration is perfect."
        file_name = "test-folder/hello_world.txt"

        print(f"Attempting to upload '{file_name}'...")

        # 4. Upload it with public read permissions
        client.put_object(
            Bucket=SPACE_NAME,
            Key=file_name,
            Body=test_content,
            ACL='public-read',
            ContentType='text/plain'
        )

        # 5. Generate and print the CDN URL
        public_url = f"https://{SPACE_NAME}.{REGION}.cdn.digitaloceanspaces.com/{file_name}"
        
        print("\n✅ UPLOAD SUCCESSFUL!")
        print(f"Click this link to see your file on the live internet:\n{public_url}")

    except Exception as e:
        print("\n❌ UPLOAD FAILED!")
        print(f"Error Details: {e}")

if __name__ == "__main__":
    test_upload()