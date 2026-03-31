import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface ComplianceItem {
  requirement: string;
  risk_assessment: "Low" | "Medium" | "High" | string;
  rationale: string;
}

interface ComplianceTableProps {
  data: ComplianceItem[];
}

const getRiskColor = (risk: string) => {
  const norm = risk.toLowerCase();
  if (norm.includes("high")) return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
  if (norm.includes("medium")) return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
  if (norm.includes("low")) return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
  return "bg-secondary text-secondary-foreground";
};

export function ComplianceTable({ data }: ComplianceTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
        No compliance matrix data available yet. Upload an RFP to extract requirements.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-1/2">GovCon Requirement ("Shall/Must")</TableHead>
            <TableHead className="w-[150px]">Risk Assessment</TableHead>
            <TableHead>Insight Rationale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium text-foreground p-4">
                {item.requirement}
              </TableCell>
              <TableCell className="p-4">
                <Badge variant="outline" className={`font-semibold border-none ${getRiskColor(item.risk_assessment)}`}>
                  {item.risk_assessment}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm p-4">
                {item.rationale}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
