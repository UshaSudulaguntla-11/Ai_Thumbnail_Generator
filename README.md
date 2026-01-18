# 🎨 AI Thumbnail Generator

An AI-powered web application that generates attractive thumbnails using prompts and retrieval-augmented generation (RAG). This project helps creators quickly design thumbnails for videos, blogs, and social media using AI.

---

## 🚀 Features

- Generate thumbnails using AI  
- Prompt-based image generation  
- Retrieval Augmented Generation (RAG) support  
- FastAPI backend  
- React + Vite frontend  
- Tailwind CSS UI  
- API-based architecture  

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- JavaScript

### Backend
- Python
- FastAPI
- HuggingFace / LLM Services
- RAG Pipeline

---

## 📂 Project Structure

ai_thumnail_generator/
│
├── backend/
│ ├── main.py
│ ├── requirements.txt
│ ├── services/
│ │ ├── image_service.py
│ │ ├── prompt_service.py
│ │ └── rag_service.py
│
├── frontend/
│ ├── src/
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── package.json
│ ├── vite.config.js
│
├── LICENSE
└── README.md

2️⃣ Backend Setup
cd backend
pip install -r requirements.txt
python main.py


Backend runs at:

http://localhost:8000

3️⃣ Frontend Setup

Open a new terminal:

cd frontend
npm install
npm run dev


Frontend runs at:

http://localhost:5173


🧠 How It Works

User enters a prompt

Backend processes using RAG + AI

Image is generated

Thumbnail is returned to frontend

User downloads the image
