"use client";

import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { ComplianceTable, ComplianceItem } from "@/components/ComplianceTable";
import { DeadlinesSidebar, CriticalDeadline } from "@/components/DeadlinesSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Activity, Zap } from "lucide-react";

interface RiskReport {
  evaluation_criteria: string;
  overall_risk_summary: string;
}

interface TechnicalSpec {
  spec: string;
}

interface RFPResponse {
  compliance_matrix: ComplianceItem[];
  critical_deadlines: CriticalDeadline[];
  technical_stack: TechnicalSpec[];
  risk_report: RiskReport;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<RFPResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/analyze-rfp", {
        method: "POST",
        body: formData,
        // mode: "cors", // Note: you might need CORS enabled on FastAPI backend
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze RFP: ${response.statusText}`);
      }

      const result: RFPResponse = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate a fake "Match Score" based on risk levels (High = minus points)
  let matchScore = 100;
  if (data?.compliance_matrix) {
    const highRisks = data.compliance_matrix.filter((r) => r.risk_assessment.toLowerCase().includes("high")).length;
    const medRisks = data.compliance_matrix.filter((r) => r.risk_assessment.toLowerCase().includes("medium")).length;
    matchScore -= highRisks * 15;
    matchScore -= medRisks * 5;
    if (matchScore < 10) matchScore = 10;
  }

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-10">

      {/* Left Panel: Uploader & Context */}
      <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col space-y-8 flex-shrink-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text">
            RFP Insight Engine
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">GovCon AI Proposal Assistant</p>
        </div>

        <UploadZone onUpload={handleUpload} isLoading={isLoading} />

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl shadow-sm">
            {error}
          </motion.div>
        )}
      </div>

      {/* Right Panel: Dashboard */}
      <div className="w-full lg:w-2/3 xl:w-3/4 flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          {!data && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex items-center justify-center p-12 border-2 border-dashed border-muted rounded-2xl bg-card/30 min-h-[50vh]"
            >
              <p className="text-muted-foreground text-lg text-center">Select an RFP PDF and click Start Anlysis Engine to view insights.</p>
            </motion.div>
          )}

          {data && !isLoading && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col space-y-10"
            >
              {/* Top: Feasibility Match Score */}
              <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-8 shadow-xl flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-12">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
                    <circle
                      cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10"
                      className={`${matchScore > 75 ? "text-emerald-500" : matchScore > 50 ? "text-amber-500" : "text-destructive"}`}
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * matchScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-black">{matchScore}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-bold flex items-center mb-2 text-foreground">
                    <Activity className="w-6 h-6 mr-3 text-primary" />
                    Feasibility Match Score
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-lg mb-4">
                    Score dynamically calculated based on GovCon strict compliance density and extracted risk flags.
                  </p>

                  {/* Risk Summary injected inside the top card */}
                  <div className="p-4 bg-muted/40 rounded-xl border border-border">
                    <h4 className="font-semibold mb-1 text-sm uppercase tracking-wider text-muted-foreground">Executive Summary</h4>
                    <p className="text-foreground/80 leading-relaxed">
                      {data.risk_report.overall_risk_summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle: Compliance Matrix */}
              <div className="w-full">
                <div className="flex items-center space-x-3 mb-6">
                  <Target className="w-7 h-7 text-primary" />
                  <h2 className="text-3xl font-bold tracking-tight">Compliance Matrix</h2>
                </div>
                <ComplianceTable data={data.compliance_matrix} />
              </div>

              {/* Followed by others: Deadlines & Technical Specs */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">

                {/* Deadlines Sidebar mapped as a module inside the grid */}
                <div>
                  <DeadlinesSidebar deadlines={data.critical_deadlines} evaluationCriteria={data.risk_report.evaluation_criteria} />
                </div>

                <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-xl h-fit">
                  <div className="flex items-center space-x-2 mb-6">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold">Technical Stack & Specs</h3>
                  </div>
                  {data.technical_stack && data.technical_stack.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-3 text-foreground/80">
                      {data.technical_stack.map((ts, idx) => (
                        <li key={idx} className="marker:text-primary pl-2 leading-relaxed">{ts.spec}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">No technical specifications were extracted.</p>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
