import os
import yaml
import asyncio
from pathlib import Path
from typing import List
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from src.schema.compliance import RFPAnalysisResult, RiskReport

BACKEND_ROOT = Path(__file__).parent.parent.parent
PROMPTS_PATH = BACKEND_ROOT / "config" / "prompts.yaml"

def load_prompt() -> str:
    """Loads the specialized GovCon compliance prompt from YAML configuration."""
    with open(PROMPTS_PATH, "r") as f:
        prompts = yaml.safe_load(f)
    return prompts["compliance_officer_system_prompt"]

async def generate_compliance_matrix(chunks: List[str]) -> RFPAnalysisResult:
    """Invokes ChatGroq with structured JSON output concurrently over chunks with delays to dodge token limits."""
    if not os.environ.get("GROQ_API_KEY"):
        raise ValueError("GROQ_API_KEY environment variable is not set. Please set it to use the Groq API.")
        
    system_prompt_text = load_prompt()
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt_text),
        ("human", "Here is a relevant excerpt from the RFP:\n\n{context}\n\nPlease analyze it and extract any compliance data. Avoid hallucinating metrics.")
    ])
    
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
    structured_llm = llm.with_structured_output(RFPAnalysisResult)
    chain = prompt | structured_llm
    
    aggregated = RFPAnalysisResult(
        compliance_matrix=[],
        critical_deadlines=[],
        technical_stack=[],
        risk_report=RiskReport(evaluation_criteria="", overall_risk_summary="")
    )
    
    for idx, chunk in enumerate(chunks):
        try:
            # We use ainvoke for asynchronous invocation!
            result = await chain.ainvoke({"context": chunk})
            
            if result:
                if result.compliance_matrix: aggregated.compliance_matrix.extend(result.compliance_matrix)
                if result.critical_deadlines: aggregated.critical_deadlines.extend(result.critical_deadlines)
                if result.technical_stack: aggregated.technical_stack.extend(result.technical_stack)
                
                # Append string formats smoothly
                if result.risk_report:
                    if result.risk_report.evaluation_criteria:
                        aggregated.risk_report.evaluation_criteria += " " + result.risk_report.evaluation_criteria
                    if result.risk_report.overall_risk_summary:
                        aggregated.risk_report.overall_risk_summary += " " + result.risk_report.overall_risk_summary
        except Exception as e:
            print(f"Warning: Error processing specific chunk block {idx}: {e}")
            
        # Dynamic delay buffer to dodge token overflow rate-limits strictly on free API tiers
        if idx < len(chunks) - 1:
            await asyncio.sleep(5) 
            
    # Clean text
    aggregated.risk_report.evaluation_criteria = aggregated.risk_report.evaluation_criteria.strip()
    aggregated.risk_report.overall_risk_summary = aggregated.risk_report.overall_risk_summary.strip()
    
    return aggregated
