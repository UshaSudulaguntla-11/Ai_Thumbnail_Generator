import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

class RAGService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        # Mock layout database: [description, prompt_addition]
        self.layouts = [
            ["Cinematic portrait with bokeh background and text on left", "ultra-realistic cinematic portrait, DSLR quality, bokeh background, text dynamic placement on the left third"],
            ["Minimalist product shot with clean shadows and centered text", "clean minimalist product photography, soft shadows, studio lighting, centered composition for text overlay"],
            ["Vibrant travel vlog style with outdoor sunlight and bold text", "vibrant outdoor photography, natural sunlight, high contrast, 4k, travel vlog aesthetic"],
            ["Dark moody tech style with neon accents and futuristic text", "moody dark studio, neon blue and purple accents, high tech aesthetic, futuristic lighting"]
        ]
        self.descriptions = [l[0] for l in self.layouts]
        self.index = faiss.IndexFlatL2(384) # MiniLM dimension
        
        # Initialize index
        embeddings = self.model.encode(self.descriptions)
        self.index.add(np.array(embeddings).astype('float32'))

    def retrieve_layout_style(self, query: str):
        query_embedding = self.model.encode([query])
        D, I = self.index.search(np.array(query_embedding).astype('float32'), 1)
        best_match_idx = I[0][0]
        return self.layouts[best_match_idx][1]

rag_service = RAGService()
