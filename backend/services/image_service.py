import requests
import os
import io
import random
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")

# Models prioritized by quality and your new API capacity
IMAGE_MODELS = [
    "black-forest-labs/FLUX.1-schnell",
    "stabilityai/stable-diffusion-xl-base-1.0",
    "stabilityai/stable-diffusion-2-1",
    "runwayml/stable-diffusion-v1-5",
    "CompVis/stable-diffusion-v1-4"
]

def generate_image(refined_prompt: str, width: int = 1024, height: int = 576) -> bytes:
    """Generate image using Hugging Face API."""
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    
    # Heavy negative prompting to avoid AI art look
    negative_prompt = (
        "cgi, 3d render, cartoon, anime, illustration, painting, drawing, sketch, "
        "low quality, blurry, distorted, saturated colors, watermark, signature, "
        "digital art, gloss, plastic, unreal engine, octane render, stylized"
    )
    
    # Use one of the high-quality models
    model_id = "black-forest-labs/FLUX.1-schnell"
    
    payload = {
        "inputs": refined_prompt,
        "parameters": {
            "num_inference_steps": 25, # Standard for SD models
            "guidance_scale": 7.5,
            "width": width,
            "height": height,
        },
        "options": {
            "wait_for_model": True,
            "use_cache": False
        }
    }
    
    # Simple payload for older models that don't support multi-parameters as well
    simple_payload = {
        "inputs": refined_prompt,
        "options": {"wait_for_model": True}
    }
    
    for model in IMAGE_MODELS:
        endpoints = [
            f"https://api-inference.huggingface.co/models/{model}",
            f"https://router.huggingface.co/hf-inference/models/{model}"
        ]
        
        for api_url in endpoints:
            # Adjust dimensions for standard logic if not FLUX or SDXL
            current_width, current_height = width, height
            if "xl" not in model.lower() and "flux" not in model.lower():
                # Older models prefer 512x512 or 768x768
                if width == height:
                    current_width, current_height = 768, 768
                elif width > height:
                    current_width, current_height = 768, 512
                else:
                    current_width, current_height = 512, 768

            try:
                print(f"\n--- API Request: {model} ---")
                print(f"Target Resolution: {current_width}x{current_height}")
                print(f"Prompt (first 100 chars): {refined_prompt[:100]}...")
                
                # Try FULL payload first with explicit parameters
                is_flux = "flux" in model.lower()
                is_sdxl = "xl" in model.lower()
                
                # HF Inference API expects parameters under the "parameters" key, 
                # but some models also support them at the top level. We use both for compatibility.
                full_payload = {
                    "inputs": refined_prompt,
                    "parameters": {
                        "num_inference_steps": 4 if "schnell" in model.lower() else (30 if is_sdxl else 50),
                        "guidance_scale": 5.0 if "schnell" in model.lower() else 7.5,
                        "width": current_width,
                        "height": current_height,
                    },
                    "options": {"wait_for_model": True, "use_cache": False}
                }
                
                response = requests.post(api_url, headers=headers, json=full_payload, timeout=120)
                
                # If full payload fails with 422 or 400, it might be the parameters.
                # Only then do we try the fallback.
                if response.status_code != 200:
                    print(f"Full payload for {model} failed with status {response.status_code}. Data: {response.text}")
                    print(f"Attempting simple payload fallback...")
                    response = requests.post(api_url, headers=headers, json=simple_payload, timeout=90)
                
                if response.status_code == 200:
                    print(f"Successfully generated image using {model} at {current_width}x{current_height}")
                    return response.content
                
                print(f"Model {model} at {api_url} finally failed with status {response.status_code}")
            except Exception as e:
                print(f"Error during generation call: {e}")
                continue
                
    return None
