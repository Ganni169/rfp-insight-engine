import os
import sys
import shutil
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Inject backend root into sys.path to run via `python entrypoint/api.py`
BACKEND_ROOT = Path(__file__).parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))

# Load env variables from .env file
load_dotenv(BACKEND_ROOT / ".env")

from src.schema.compliance import RFPAnalysisResult
from src.pipelines.embedding_pipeline import process_and_embed_document
from src.pipelines.retrieval_pipeline import retrieve_compliance_contexts
from src.pipelines.generation_pipeline import generate_compliance_matrix

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure temp directory exists
    os.makedirs(BACKEND_ROOT / "data" / "temp", exist_ok=True)
    yield

app = FastAPI(title="RFP Insight Engine API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-rfp", response_model=RFPAnalysisResult)
async def analyze_rfp(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    temp_file_path = str(BACKEND_ROOT / "data" / "temp" / file.filename)
    
    try:
        # Save the uploaded file temporarily
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Execute Modular RAG Pipeline Sequence
        vectorstore = process_and_embed_document(temp_file_path)
        chunks_list = retrieve_compliance_contexts(vectorstore)
        result = await generate_compliance_matrix(chunks_list)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    # Now running from entry file directly supports hot reload
    uvicorn.run("entrypoint.api:app", host="0.0.0.0", port=8000, reload=True)
