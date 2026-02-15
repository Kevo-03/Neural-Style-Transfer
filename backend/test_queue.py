# backend/test_queue.py
from celery_worker import generate_art_task
import os

# 1. Define Paths (Absolute paths are safest)
# We use the same 'input' folder you created earlier
base_dir = os.path.abspath("ml_engine")
content = os.path.join(base_dir, "input", "content.jpg")
style = os.path.join(base_dir, "input", "style.jpg")
output = os.path.join(base_dir, "output", "test_queue_result.jpg")

print("🚀 Sending job to Celery Worker...")

# 2. The Trigger (.delay)
# This is the magic method added by the @celery_app.task decorator.
# It sends the arguments to Redis and returns IMMEDIATELY.
# It does NOT wait for the image to generate.
task = generate_art_task.delay(content, style, output)

print(f"✅ Job Sent! Task ID: {task.id}")
print("Waiting for result...")

# 3. Wait for the result (Simulating what the frontend will do)
# .get() forces us to wait until the worker finishes.
result = task.get()

print("🎉 Result received from worker:")
print(result)