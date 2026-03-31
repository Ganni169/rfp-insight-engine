import os
from pathlib import Path
from unstructured.partition.pdf import partition_pdf
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

BACKEND_ROOT = Path(__file__).parent.parent.parent
CHROMA_DB_PATH = BACKEND_ROOT / "data" / "vector_store" / "chroma_db"

def process_and_embed_document(pdf_path: str) -> Chroma:
    """Takes a raw PDF, parses, chunks, and stores embeddings into ChromaDB."""
    # 1. Parse PDF using unstructured
    elements = partition_pdf(filename=pdf_path)
    full_text = "\n\n".join([str(e) for e in elements if e.category in ["Text", "NarrativeText", "Title", "ListItem", "Table"]])
    
    # 2. Chunking
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=500)
    chunks = text_splitter.split_text(full_text)
    
    if not chunks:
        raise ValueError("No text could be extracted from the provided PDF.")
        
    # 3. Embed into ChromaDB
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = Chroma.from_texts(
        texts=chunks, 
        embedding=embeddings, 
        persist_directory=str(CHROMA_DB_PATH)
    )
    
    return vectorstore
