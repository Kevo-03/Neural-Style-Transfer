import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
from PIL import Image
import os
import io
from PIL import Image

HUB_MODEL_URL = 'https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2'
hub_model = None  

def get_model():
    global hub_model
    if hub_model is None:
        print("Loading TensorFlow Model (First Run Only)...")
        hub_model = hub.load(HUB_MODEL_URL)
        print("Model Loaded!")
    return hub_model

def crop_center(image):
  """Returns a cropped square image."""
  shape = image.shape
  new_shape = min(shape[1], shape[2])
  offset_y = max(shape[1] - shape[2], 0) // 2
  offset_x = max(shape[2] - shape[1], 0) // 2
  image = tf.image.crop_to_bounding_box(
      image, offset_y, offset_x, new_shape, new_shape)
  return image

def load_img(img_bytes: bytes, target_shape=None, max_dim=512):
    img = tf.image.decode_image(img_bytes, channels=3)
    
    if len(img.shape) == 4:
        img = img[0]
        
    img = tf.image.convert_image_dtype(img, tf.float32)

    if not target_shape:
        shape = tf.cast(tf.shape(img)[:-1], tf.float32)
        long_dim = max(shape)
        scale = max_dim / long_dim

        new_shape = tf.cast(shape * scale, tf.int32)
        img = tf.image.resize(img, new_shape)

    img = img[tf.newaxis, :]
    
    if target_shape:
        img = crop_center(img)
        img = tf.image.resize(img, target_shape)
            
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
    style_img = load_img(style_bytes, target_shape=(256, 256))

    outputs = model(tf.constant(content_img), tf.constant(style_img))
    stylized_image = outputs[0]

    result = tensor_to_image(stylized_image)
    output_buffer = io.BytesIO()
    result.save(output_buffer, format="JPEG")
    output_buffer.seek(0)
    print("In-memory processing complete!")
    return output_buffer

if __name__ == "__main__":
    print("Testing in-memory pipeline...")
    
    try:
        with open("input/content.jpg", "rb") as f:
            c_bytes = f.read()
        with open("input/style.jpg", "rb") as f:
            s_bytes = f.read()
            
        out_stream = run_inference(c_bytes, s_bytes)
        
        with open("output/test_result1.jpg", "wb") as f:
            f.write(out_stream.read())
            
        print("✅ Success! Test image saved to output/test_result.jpg")
    except FileNotFoundError:
        print("Test skipped: Ensure you have 'input/content.jpg' and 'input/style.jpg' to run the local test.")