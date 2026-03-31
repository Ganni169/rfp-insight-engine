from typing import List
from langchain_chroma import Chroma

def retrieve_compliance_contexts(vectorstore: Chroma) -> List[str]:
    """Retrieves document segments from vectorstore highly relevant to GovCon compliance."""
    # Query prioritizing all key RFP aspects
    num_chunks = vectorstore._collection.count()
    retriever = vectorstore.as_retriever(search_kwargs={"k": min(10, num_chunks)})
    
    query = "All compliance requirements (Shall, Must, Will, Required), technical specifications, certifications, submission deadlines, and evaluation criteria."
    relevant_docs = retriever.invoke(query)
    
    # Return independent excerpts to be processed asynchronously
    return [doc.page_content for doc in relevant_docs]
