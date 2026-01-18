from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
from services.rag_service import rag_service
from services.prompt_service import refine_prompt
from services.image_service import generate_image
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.exceptions import RequestValidationError
from fastapi import Request

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.body} - {exc.errors()}")
    return Response(content=str(exc.errors()), status_code=422)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import List, Dict

class GenerationRequest(BaseModel):
    title: str
    category: str
    platform: List[str] = ["YouTube"]
    aspect_ratio: List[str] = ["16:9"]
    style: List[str] = ["Professional"]
    lighting: List[str] = ["Cinematic"]
    camera_angle: List[str] = ["Eye Level"]
    instructions: str = ""
    brand_colors: List[str] = []
    use_brand_colors: bool = False
    enhancements: Dict[str, bool] = {}

ASPECT_RATIO_MAP = {
    "16:9": (1024, 576),
    "9:16": (576, 1024),
    "1:1": (1024, 1024),
    "4:5": (819, 1024),
    "21:9": (1280, 544),
    "3:2": (1024, 683)
}

# Make sure the frontend/dist folder exists
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

@app.post("/api/generate")
async def generate_thumbnail(request: GenerationRequest):
    try:
        # Combine inputs for better retrieval
        query = f"{request.title} {request.category} {request.style}"
        
        # 1. Retrieve layout style via RAG
        layout_style = rag_service.retrieve_layout_style(query)
        
        # 2. Refine prompt with expanded context and enhancements
        active_enhancements = [k for k, v in request.enhancements.items() if v]
        context = (
            f"Platforms: {', '.join(request.platform)}, Aspect Ratios: {', '.join(request.aspect_ratio)}, "
            f"Category: {request.category}, Visual Styles: {', '.join(request.style)}, "
            f"Lighting: {', '.join(request.lighting)}, Camera Angles: {', '.join(request.camera_angle)}. "
            f"Enhancements: {', '.join(active_enhancements)}. "
            f"Instructions: {request.instructions}. Layout: {layout_style}"
        )
        refined_prompt = refine_prompt(request.title, context)
        
        # 3. Handle aspect ratio
        ratio_str = request.aspect_ratio[0] if request.aspect_ratio else "16:9"
        width, height = ASPECT_RATIO_MAP.get(ratio_str, (1024, 576))

        # 4. Generate image
        image_bytes = generate_image(refined_prompt, width=width, height=height)
        
        if not image_bytes:
            raise HTTPException(status_code=500, detail="Failed to generate image")
        
        return Response(content=image_bytes, media_type="image/png")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount static files and serve index.html for unknown routes
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Prevent favicon or specific assets from falling through if they don't exist
        if "." in full_path and not full_path.endswith(".html"):
             return Response(status_code=404)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
