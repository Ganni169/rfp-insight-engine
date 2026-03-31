from pydantic import BaseModel, Field
from typing import List

class ComplianceItem(BaseModel):
    requirement: str = Field(description="The exact requirement text containing Shall, Must, Will, or Required")
    risk_assessment: str = Field(description="Risk assessment: Low, Medium, or High, following the Brutally Honest Insight guideline")
    rationale: str = Field(description="The reason for this risk assessment")

class CriticalDeadline(BaseModel):
    deadline_description: str = Field(description="Description of the deadline event")
    date_time: str = Field(description="The exact date/time")
    delivery_format: str = Field(description="Delivery format (e.g. PDF via email, portal upload)")

class TechnicalSpec(BaseModel):
    spec: str = Field(description="Hardware, software, or certification requirement")

class RiskReport(BaseModel):
    evaluation_criteria: str = Field(description="How the government will grade the bid (e.g. LPTA, Best Value)")
    overall_risk_summary: str = Field(description="A high level summary combining the 'Brutally Honest' insights")

class RFPAnalysisResult(BaseModel):
    compliance_matrix: List[ComplianceItem]
    critical_deadlines: List[CriticalDeadline]
    technical_stack: List[TechnicalSpec]
    risk_report: RiskReport
