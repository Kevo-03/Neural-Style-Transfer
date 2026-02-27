import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
from PIL import Image
import os
import io
from PIL import Image

# --- 1. SETUP GLOBAL VARIABLES (The Fix) ---
# We do NOT load the model here anymore. We just define the URL.
HUB_MODEL_URL = 'https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2'
hub_model = None  # Placeholder

def get_model():
    """
    Singleton pattern: Only loads the model if it hasn't been loaded yet.
    This ensures loading happens INSIDE the worker process, avoiding deadlocks.
    """
    global hub_model
    if hub_model is None:
        print("⏳ Loading TensorFlow Model (First Run Only)...")
        hub_model = hub.load(HUB_MODEL_URL)
        print("✅ Model Loaded!")
    return hub_model

def load_img(img_bytes: bytes):
    max_dim = 512
    img = tf.image.decode_image(img_bytes, channels=3)
    img = tf.image.convert_image_dtype(img, tf.float32)

    shape = tf.cast(tf.shape(img)[:-1], tf.float32)
    long_dim = max(shape)
    scale = max_dim / long_dim

    new_shape = tf.cast(shape * scale, tf.int32)
    img = tf.image.resize(img, new_shape)
    img = img[tf.newaxis, :]
    return img

def tensor_to_image(tensor):
    tensor = tensor * 255
    tensor = np.array(tensor, dtype=np.uint8)
    if np.ndim(tensor) > 3:
        assert tensor.shape[0] == 1
        tensor = tensor[0]
    return Image.fromarray(tensor)

def run_inference(content_bytes: bytes, style_bytes: bytes) -> io.BytesIO:
   
    model = get_model()

    content_img = load_img(content_bytes)
    style_img = load_img(style_bytes)

    outputs = model(tf.constant(content_img), tf.constant(style_img))
    stylized_image = outputs[0]

    result = tensor_to_image(stylized_image)
    output_buffer = io.BytesIO()
    result.save(output_buffer, format="JPEG")
    output_buffer.seek(0)
    print("In-memory processing complete!")
    return output_buffer

if __name__ == "__main__":
    # Test Block
    print("Testing in-memory pipeline...")
    
    try:
        with open("input/content.jpg", "rb") as f:
            c_bytes = f.read()
        with open("input/style.jpg", "rb") as f:
            s_bytes = f.read()
            
        out_stream = run_inference(c_bytes, s_bytes)
        
        # Save the stream out to disk just to verify it worked locally
        with open("output/test_result.jpg", "wb") as f:
            f.write(out_stream.read())
            
        print("✅ Success! Test image saved to output/test_result.jpg")
    except FileNotFoundError:
        print("Test skipped: Ensure you have 'input/content.jpg' and 'input/style.jpg' to run the local test.")