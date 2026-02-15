import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
from PIL import Image
import os

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

def load_img(path_to_img):
    max_dim = 512
    img = tf.io.read_file(path_to_img)
    img = tf.image.decode_image(img, channels=3)
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

def run_inference(content_path, style_path, output_path):
    print(f"Processing: {content_path}")
    
    # --- 2. LOAD MODEL ON DEMAND ---
    model = get_model()
    # -------------------------------

    content_image = load_img(content_path)
    style_image = load_img(style_path)

    outputs = model(tf.constant(content_image), tf.constant(style_image))
    stylized_image = outputs[0]

    result = tensor_to_image(stylized_image)
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    result.save(output_path)
    print(f"Saved to {output_path}")
    return output_path

if __name__ == "__main__":
    # Test Block
    run_inference("input/content.jpg", "input/style.jpg", "output/output.jpg")