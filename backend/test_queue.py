# backend/test_queue.py
from celery_worker import generate_art_task
import os

base_dir = os.path.abspath("ml_engine")
content = os.path.join(base_dir, "input", "content.jpg")
style = os.path.join(base_dir, "input", "style.jpg")
output = os.path.join(base_dir, "output", "test_queue_result.jpg")

print("🚀 Sending job to Celery Worker...")

task = generate_art_task.delay(content, style, output)

print(f"✅ Job Sent! Task ID: {task.id}")
print("Waiting for result...")

result = task.get()

print("🎉 Result received from worker:")
print(result)