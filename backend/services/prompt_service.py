import requests
import os
import random
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
STABLELM_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"

def refine_prompt(user_input: str, context: str):
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    api_url = f"https://api-inference.huggingface.co/models/{STABLELM_MODEL}"
    
    # Define text extraction logic: look for text in quotes, otherwise use nothing
    import re
    quoted_text = re.findall(r'"([^"]*)"', user_input)
    render_text = quoted_text[0] if quoted_text else ""

    # Strictly enforcing photorealism, subject fidelity, and semantic disambiguation
    system_prompt = (
        "You are an expert photographic visualizer. Your goal is to create a STARKLY ACCURATE "
        "photographical representation of the user's scene description. "
        "STRICT ADHERENCE: You must generate an image that MATCHES THE USER'S PROMPT EXPLICITLY. "
        "ATMOSPHERIC PRIORITY: If the user mentions 'glow', 'smoky rays', 'volumetric light', or 'interior light', "
        "you MUST describe these effects with extreme detail and high priority. "
        "SUBJECT FIDELITY: Maintain the core subject exactly as described. "
        "STRICT STYLE FILTERS: Embody the following visual characteristics: "
        f"{context}. "
        "IMPORTANT - TEXT RENDERING: The user wants to include specific text in the image. "
        f"The text to render is: \"{render_text}\". "
        "ONLY render the text identified above. DO NOT try to render the entire scene description as text. "
        "Describe the text placement as requested (e.g., 'bottom center on a yellow capsule label'). "
        "REPEAT the text content at the end in the format: 'Text content: \"" + render_text + "\"'. "
    )
    
    prompt_payload = (
        f"<s>[INST] {system_prompt} \n"
        f"Subject: {user_input} \n"
        f"Provide a 1-paragraph highly detailed technical photographic description for a real-life thumbnail image. [/INST]"
    )
    
    payload = {
        "inputs": prompt_payload,
        "parameters": {"max_new_tokens": 150, "temperature": random.uniform(0.7, 0.9)},
        "options": {"wait_for_model": True, "use_cache": False}
    }
    
    try:
        response = requests.post(api_url, headers=headers, json=payload)
        
        if response.status_code in [410, 404]:
            v1_url = "https://router.huggingface.co/hf-inference/v1/chat/completions"
            v1_payload = {
                "model": STABLELM_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Subject: {user_input}"}
                ],
                "max_tokens": 150
            }
            response = requests.post(v1_url, headers=headers, json=v1_payload)
            result = response.json()
            return result['choices'][0]['message']['content'].strip()

        response.raise_for_status()
        result = response.json()
        
        content = ""
        if isinstance(result, list):
            content = result[0]['generated_text']
        else:
            content = result['generated_text']
            
    except Exception as e:
        print(f"Error in prompt refinement: {e}")
        # Robust fallback that weaves all filters into a descriptive paragraph
        return (
            f"A professional, high-fidelity real-life cinematic photograph of {user_input}. "
            f"The scene captures the subject with the following artistic constraints: {context}. "
            "Masterpiece quality, 8k resolution, detailed realistic textures, perfect composition. "
            f"Text content: \"{user_input}\""
        )
